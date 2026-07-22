import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { BillStatus } from '../common/enums/bill-status.enum';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createOrderDto: CreateOrderDto, currentUser: any) {
    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeStr =
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const orderId = `ORD-${dateStr}${timeStr}`;

    const order = this.orderRepository.create({
      ...createOrderDto,
      orderId,
      businessId: currentUser.businessId,
      createdBy: currentUser.id,
    });
    const saved = await this.orderRepository.save(order);

    for (const item of createOrderDto.products) {
      if (item.quantity > 0) {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });
        if (product && product.stockRequired) {
          product.stock = Math.max(0, Number(product.stock) - item.quantity);
          await this.productRepository.save(product);
        }
      }
    }

    return { success: true, message: 'Order created', data: saved };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<any>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (
      currentUser.role === Role.ADMIN
    ) {
      where.createdBy = currentUser.id;
    } else if (currentUser.role === Role.CASHIER) {
      where.businessId = currentUser.businessId;
    }

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: { table: true },
      order: { [sortBy]: sortOrder },
    });

    const flattened = data.map(({ table, products, ...rest }) => ({
      ...rest,
      tableId: table?.id ?? rest.tableId,
    }));

    return {
      success: true,
      data: flattened,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, currentUser: any) {
    const order = await this.orderRepository.findOne({
      where: { id },
      relations: { table: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      order.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      order.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: order };
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, currentUser: any) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      order.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      order.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(order, updateOrderDto, { updatedBy: currentUser.id });
    const saved = await this.orderRepository.save(order);
    return { success: true, message: 'Order updated', data: saved };
  }

  async remove(id: number, currentUser: any) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      order.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      order.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (order.billStatus === BillStatus.PAID) {
      throw new BadRequestException('Cannot delete a paid order');
    }
    if (order.products && order.products.length > 0) {
      for (const item of order.products) {
        if (item.quantity > 0) {
          const product = await this.productRepository.findOne({
            where: { id: item.productId },
          });
          if (product && product.stockRequired) {
            product.stock = Number(product.stock) + item.quantity;
            await this.productRepository.save(product);
          }
        }
      }
    }

    await this.orderRepository.remove(order);
    return { success: true, message: 'Order removed' };
  }

  async updateBillStatus(id: number, billStatus: BillStatus, currentUser: any) {
    const order = await this.orderRepository.findOne({ where: { id } });
    if (!order) throw new NotFoundException('Order not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      order.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      order.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    order.billStatus = billStatus;
    order.updatedBy = currentUser.id;
    const saved = await this.orderRepository.save(order);
    return {
      success: true,
      message: `Bill marked as ${billStatus}`,
      data: saved,
    };
  }
}
