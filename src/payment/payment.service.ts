import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';
import { Payment, PaymentStatus } from './entities/payment.entity';
import { Package } from '../package/entities/package.entity';
import { Business } from '../business/entities/business.entity';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum';

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
    private configService: ConfigService,
  ) {
    const isSandbox = this.configService.get<string>('SSLCZ_SANDBOX', 'true') === 'true';
    this.sslcommerzBaseUrl = isSandbox
      ? 'https://sandbox.sslcommerz.com'
      : 'https://secure.sslcommerz.com';
    this.storeId = this.configService.get<string>('SSLCZ_STORE_ID', '');
    this.storePassword = this.configService.get<string>('SSLCZ_STORE_PASSWORD', '');
  }

  async initiate(currentUser: any, packageId: number) {
    const pkg = await this.packageRepository.findOne({ where: { id: packageId } });
    if (!pkg) throw new NotFoundException('Package not found');
    if (pkg.status !== 'active') throw new BadRequestException('Package is not active');

    let businessId = currentUser.businessId;
    let business = businessId
      ? await this.businessRepository.findOne({ where: { id: businessId } })
      : null;

    if (!business) {
      business = await this.businessRepository.findOne({
        where: { adminId: currentUser.id },
      });
      if (!business) throw new BadRequestException('No business associated with this user');
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
    const savedPayment = await this.paymentRepository.save(payment) as unknown as Payment;

    const appUrl = this.configService.get<string>('APP_URL', 'http://localhost:8001');

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
        throw new BadRequestException(response.data.failedreason || 'SSLCommerz initiation failed');
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
      if (err instanceof BadRequestException || err instanceof NotFoundException) throw err;
      throw new BadRequestException('Payment gateway error: ' + (err.message || 'Unknown error'));
    }
  }

  async handleSuccess(tranId: string, valId?: string) {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: tranId } });
    if (!payment) return { success: false, message: 'Invalid transaction' };
    if (payment.status === PaymentStatus.SUCCESS) return { success: true, message: 'Already processed' };

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

      const pkg = await this.packageRepository.findOne({ where: { id: payment.packageId } });
      if (!pkg) return { success: false, message: 'Package not found' };

      const business = await this.businessRepository.findOne({ where: { id: payment.businessId } });
      if (business) {
        const now = new Date();
        const endDate = new Date(now);
        endDate.setMonth(endDate.getMonth() + pkg.numberOfMonth);

        business.subscription = SubscriptionStatus.ACTIVE;
        business.subStartDate = now;
        business.subEndDate = endDate;
        await this.businessRepository.save(business);
      }

      return { success: true, message: 'Payment successful, subscription activated' };
    } catch {
      return { success: false, message: 'Validation request failed' };
    }
  }

  async handleCancel(tranId: string) {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: tranId } });
    if (payment) {
      payment.status = PaymentStatus.CANCEL;
      await this.paymentRepository.save(payment);
    }
    return { success: true, message: 'Payment cancelled' };
  }

  async handleFail(tranId: string) {
    const payment = await this.paymentRepository.findOne({ where: { transactionId: tranId } });
    if (payment) {
      payment.status = PaymentStatus.FAIL;
      await this.paymentRepository.save(payment);
    }
    return { success: true, message: 'Payment failed' };
  }
}
