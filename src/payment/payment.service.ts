import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Package } from '../package/entities/package.entity';
import { Business } from '../business/entities/business.entity';
import { User } from '../users/entities/user.entity';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum';
import { Role } from '../common/enums/role.enum';
import { AdminPurchasePackageDto } from './dto/admin-purchase-package.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';

@Injectable()
export class PaymentService {
  private sslcommerzBaseUrl: string;
  private storeId: string;
  private storePassword: string;

  constructor(
    @InjectRepository(Payment)
    private paymentRepository: Repository<Payment>,
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private configService: ConfigService,
  ) {
    const isSandbox =
      this.configService.get<string>('SSLCZ_SANDBOX', 'true') === 'true';
    this.sslcommerzBaseUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://secure.sslcommerz.com';
    this.storeId = this.configService.get<string>('SSLCZ_STORE_ID', '');
    this.storePassword = this.configService.get<string>(
      'SSLCZ_STORE_PASSWORD',
      '',
    );
  }

  async initiate(currentUser: any, packageId: number) {
    const pkg = await this.packageRepository.findOne({
      where: { id: packageId },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.status !== 'active')
      throw new BadRequestException('Package is not active');

    let businessId = currentUser.businessId;
    let business = businessId
      ? await this.businessRepository.findOne({ where: { id: businessId } })
      : null;

    if (!business) {
      business = await this.businessRepository.findOne({
        where: { adminId: currentUser.id },
      });
      if (!business)
        throw new BadRequestException('No business associated with this user');
      businessId = business.id;
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepository.create({
      businessId,
      packageId,
      transactionId,
      amount: Number(pkg.price),
      status: PaymentStatus.PENDING,
      adminId: currentUser.id,
    } as any);
    const savedPayment = (await this.paymentRepository.save(
      payment,
    )) as unknown as Payment;

    const appUrl = this.configService.get<string>(
      'APP_URL',
      'http://localhost:8001',
    );

    const postData = new URLSearchParams();
    postData.append('store_id', this.storeId);
    postData.append('store_passwd', this.storePassword);
    postData.append('total_amount', String(Number(pkg.price)));
    postData.append('currency', 'BDT');
    postData.append('tran_id', transactionId);
    postData.append('success_url', `${appUrl}/api/payment/success`);
    postData.append('fail_url', `${appUrl}/api/payment/fail`);
    postData.append('cancel_url', `${appUrl}/api/payment/cancel`);
    postData.append('cus_name', currentUser.name || 'Unknown');
    postData.append('cus_email', currentUser.email || 'unknown@example.com');
    postData.append('cus_add1', 'N/A');
    postData.append('cus_city', 'N/A');
    postData.append('cus_postcode', '1000');
    postData.append('cus_country', 'Bangladesh');
    postData.append('cus_phone', '01700000000');
    postData.append('shipping_method', 'NO');
    postData.append('product_name', pkg.packageName);
    postData.append('product_category', 'Subscription');
    postData.append('product_profile', 'general');

    try {
      const response = await axios.post(
        `${this.sslcommerzBaseUrl}/gwprocess/v4/api.php`,
        postData,
        { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } },
      );

      if (response.data.status === 'FAILED') {
        savedPayment.status = PaymentStatus.FAIL;
        savedPayment.gatewayData = response.data;
        await this.paymentRepository.save(savedPayment);
        throw new BadRequestException(
          response.data.failedreason || 'SSLCommerz initiation failed',
        );
      }

      savedPayment.gatewayData = response.data;
      await this.paymentRepository.save(savedPayment);

      return {
        success: true,
        data: {
          transactionId,
          gatewayUrl: response.data.GatewayPageURL,
        },
      };
    } catch (err: any) {
      if (
        err instanceof BadRequestException ||
        err instanceof NotFoundException
      )
        throw err;
      throw new BadRequestException(
        'Payment gateway error: ' + (err.message || 'Unknown error'),
      );
    }
  }

  async handleSuccess(tranId: string, valId?: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: tranId },
    });
    if (!payment) return { success: false, message: 'Invalid transaction' };
    if (payment.status === PaymentStatus.SUCCESS)
      return { success: true, message: 'Already processed' };

    try {
      const validateId = valId || payment.gatewayData?.val_id;
      if (!validateId) {
        payment.status = PaymentStatus.SUCCESS;
        await this.paymentRepository.save(payment);
      } else {
        const response = await axios.get(
          `${this.sslcommerzBaseUrl}/validator/api/validationserverAPI.php`,
          {
            params: {
              val_id: validateId,
              store_id: this.storeId,
              store_passwd: this.storePassword,
              v: 1,
              format: 'json',
            },
          },
        );

        const data = response.data;
        if (data.status !== 'VALID' && data.status !== 'VALIDATED') {
          payment.status = PaymentStatus.FAIL;
          payment.gatewayData = data;
          await this.paymentRepository.save(payment);
          return { success: false, message: 'Transaction validation failed' };
        }

        payment.status = PaymentStatus.SUCCESS;
        payment.gatewayData = data;
        await this.paymentRepository.save(payment);
      }

      const pkg = await this.packageRepository.findOne({
        where: { id: payment.packageId },
      });
      if (!pkg) return { success: false, message: 'Package not found' };

      await this.applySubscription(payment);

      return {
        success: true,
        message: 'Payment successful, subscription activated',
        payment_success: true,
      };
    } catch {
      return { success: false, message: 'Validation request failed' };
    }
  }

  async adminPurchase(currentUser: any, dto: AdminPurchasePackageDto) {
    if (currentUser.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const user = await this.userRepository.findOne({
      where: { id: dto.adminId },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!user.businessId) {
      throw new BadRequestException('User has no business');
    }

    const pkg = await this.packageRepository.findOne({
      where: { id: dto.packageId },
    });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.status !== 'active') {
      throw new BadRequestException('Package is not active');
    }

    const transactionId = `TXN${Date.now()}${Math.floor(Math.random() * 1000)}`;

    const payment = this.paymentRepository.create({
      businessId: user.businessId,
      packageId: pkg.id,
      transactionId,
      amount: Number(pkg.price),
      status: PaymentStatus.SUCCESS,
      adminId: user.id,
      gatewayData: {
        source: 'manual',
        purchasedBy: currentUser.id,
      },
    } as any);

    const savedPayment = (await this.paymentRepository.save(
      payment,
    )) as unknown as Payment;

    const business = await this.applySubscription(savedPayment);

    return {
      success: true,
      data: { payment: savedPayment, business },
    };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<Record<string, any>>> {
    if (currentUser.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (query.search) {
      where.transactionId = ILike(`%${query.search}%`);
    }

    const [payments, total] = await this.paymentRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    const businessIds = [
      ...new Set(payments.map((p) => p.businessId).filter(Boolean)),
    ];

    const emailMap = new Map<number, string | null>();
    if (businessIds.length) {
      const rows = await this.businessRepository
        .createQueryBuilder('business')
        .leftJoin(User, 'user', 'user.id = business.adminId')
        .select(['business.id AS id', 'user.email AS email'])
        .where('business.id IN (:...ids)', { ids: businessIds })
        .getRawMany();
      for (const r of rows) {
        emailMap.set(Number(r.id), r.email ?? null);
      }
    }

    const data = payments.map((p) => {
      const { gatewayData, ...rest } = p;
      return {
        ...rest,
        method: this.deriveMethod(gatewayData),
        adminEmail: emailMap.get(p.businessId) ?? null,
      };
    });

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  private deriveMethod(gatewayData: any): string {
    if (gatewayData?.source === 'manual') return 'manual';
    const cardType = String(gatewayData?.card_type ?? '').toUpperCase();
    if (cardType.startsWith('BKASH')) return 'bkash';
    if (cardType.startsWith('NAGAD')) return 'nagad';
    if (
      cardType.startsWith('VISA') ||
      cardType.startsWith('MASTERCARD') ||
      cardType.startsWith('AMEX')
    ) {
      return 'visa';
    }
    return 'unknown';
  }

  private async applySubscription(payment: Payment): Promise<Business | null> {
    const pkg = await this.packageRepository.findOne({
      where: { id: payment.packageId },
    });
    if (!pkg) return null;

    const business = await this.businessRepository.findOne({
      where: { id: payment.businessId },
    });
    if (!business) return null;

    const now = new Date();
    const hasActiveSub =
      business.subscription === SubscriptionStatus.ACTIVE &&
      business.subEndDate &&
      new Date(business.subEndDate) > now;
    const baseDate = hasActiveSub ? new Date(business.subEndDate!) : now;
    const endDate = new Date(baseDate);
    endDate.setMonth(endDate.getMonth() + pkg.numberOfMonth);

    business.subscription = SubscriptionStatus.ACTIVE;
    business.subStartDate = now;
    business.subEndDate = endDate;
    return this.businessRepository.save(business);
  }

  async getPaymentStatus(tranId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: tranId },
    });
    if (!payment) return { success: false, message: 'Transaction not found' };

    const business = await this.businessRepository.findOne({
      where: { id: payment.businessId },
    });

    return {
      success: true,
      data: {
        status: payment.status,
        amount: payment.amount,
        transactionId: payment.transactionId,
        businessId: payment.businessId,
        subscriptionStatus: business?.subscription || null,
        subStartDate: business?.subStartDate || null,
        subEndDate: business?.subEndDate || null,
      },
    };
  }

  async handleCancel(tranId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: tranId },
    });
    if (payment) {
      payment.status = PaymentStatus.CANCEL;
      await this.paymentRepository.save(payment);
    }
    return { success: true, message: 'Payment cancelled' };
  }

  async handleFail(tranId: string) {
    const payment = await this.paymentRepository.findOne({
      where: { transactionId: tranId },
    });
    if (payment) {
      payment.status = PaymentStatus.FAIL;
      await this.paymentRepository.save(payment);
    }
    return { success: true, message: 'Payment failed' };
  }
}
