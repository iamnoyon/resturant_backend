import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../business/entities/business.entity';
import { Table } from '../table/entities/table.entity';
import { CreateOrderDto } from './dto/create-order.dto';
import { CreateWaiterOrderDto } from './dto/create-waiter-order.dto';
import { UpdateWaiterOrderDto } from './dto/update-waiter-order.dto';
import { UpdateOrderDto } from './dto/update-order.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { BillStatus } from '../common/enums/bill-status.enum';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum';
import { TokenService } from '../token/token.service';

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
    private dataSource: DataSource,
    private tokenService: TokenService,
  ) {}

  async create(createOrderDto: CreateOrderDto, currentUser: any) {
    if (!currentUser.businessId) {
      throw new BadRequestException('You must create a restaurant first');
    }

    const business = await this.businessRepository.findOne({
      where: { id: currentUser.businessId },
    });
    if (business?.subscription !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Subscription expired. Renew ASAP to continue',
      );
    }
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

    const productCostTotal = await Promise.all(
      createOrderDto.products.map(async (item) => {
        const product = await this.productRepository.findOne({
          where: { id: item.productId },
        });

        if (!product) {
          return 0;
        }

        return Number(product.costPrice || 0) * Number(item.quantity || 0);
      }),
    );

    const orderRevenue = Number(
      createOrderDto.subTotal ??
        Number(createOrderDto.totalBill || 0) -
          Number(createOrderDto.discount || 0),
    );
    const calculatedProfit = Number(
      (
        orderRevenue - productCostTotal.reduce((sum, value) => sum + value, 0)
      ).toFixed(2),
    );

    const order = this.orderRepository.create({
      ...createOrderDto,
      profit: calculatedProfit,
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

  async createForWaiter(
    createWaiterOrderDto: CreateWaiterOrderDto,
    currentUser: any,
  ) {
    if (currentUser.role !== Role.WAITER) {
      throw new ForbiddenException('Only waiters can place waiter orders');
    }

    if (!currentUser.businessId) {
      throw new BadRequestException('You must create a restaurant first');
    }

    const business = await this.businessRepository.findOne({
      where: { id: currentUser.businessId },
    });
    if (business?.subscription !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Subscription expired. Renew ASAP to continue',
      );
    }

    const tableId = Number(createWaiterOrderDto?.tableId);
    if (!tableId) {
      throw new BadRequestException('Table is required');
    }

    const table = await this.tableRepository.findOne({
      where: { id: tableId },
    });
    if (!table) throw new NotFoundException('Table not found');
    if (table.businessId !== currentUser.businessId) {
      throw new ForbiddenException('Access denied');
    }

    const items = Array.isArray(createWaiterOrderDto?.products)
      ? createWaiterOrderDto.products
      : [];
    if (items.length === 0) {
      throw new BadRequestException('At least one product is required');
    }

    const quantityMap = new Map<number, number>();
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException('Invalid product or quantity');
      }
      quantityMap.set(productId, (quantityMap.get(productId) || 0) + quantity);
    }
    const productIds = [...quantityMap.keys()];

    const now = new Date();
    const dateStr =
      now.getFullYear().toString() +
      (now.getMonth() + 1).toString().padStart(2, '0') +
      now.getDate().toString().padStart(2, '0');
    const timeStr =
      now.getHours().toString().padStart(2, '0') +
      now.getMinutes().toString().padStart(2, '0') +
      now.getSeconds().toString().padStart(2, '0');
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const orderId = `ORD-${dateStr}${timeStr}-${randomSuffix}`;

    const saved = await this.dataSource.transaction(async (manager) => {
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
      });
      if (products.length !== productIds.length) {
        throw new BadRequestException('One or more products were not found');
      }

      let totalBill = 0;
      let totalCost = 0;
      const orderItems: { productId: number; quantity: number }[] = [];

      for (const product of products) {
        if (product.businessId !== currentUser.businessId) {
          throw new ForbiddenException('Access denied');
        }
        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.productName}" is not available`,
          );
        }
        const quantity = quantityMap.get(product.id)!;
        if (product.stockRequired && Number(product.stock) < quantity) {
          throw new BadRequestException(
            `Insufficient stock for "${product.productName}"`,
          );
        }
        totalBill += Number(product.soldPrice) * quantity;
        totalCost += Number(product.costPrice) * quantity;
        orderItems.push({ productId: product.id, quantity });
      }

      totalBill = Number(totalBill.toFixed(2));
      const profit = Number((totalBill - totalCost).toFixed(2));

      const order = manager.create(Order, {
        orderId,
        tableId,
        products: orderItems,
        totalBill,
        discount: 0,
        subTotal: totalBill,
        profit,
        billStatus: BillStatus.UNPAID,
        businessId: currentUser.businessId,
        waiterId: currentUser.id,
        createdBy: currentUser.id,
      });
      const created = await manager.save(order);

      const productMap = new Map(
        products.map((product) => [product.id, product]),
      );
      await this.tokenService.createForOrder(
        manager,
        created.id,
        orderItems,
        productMap,
        currentUser.businessId,
        currentUser.id,
      );

      for (const product of products) {
        if (product.stockRequired) {
          const quantity = quantityMap.get(product.id)!;
          await manager.decrement(
            Product,
            { id: product.id },
            'stock',
            quantity,
          );
        }
      }

      return created;
    });

    return { success: true, message: 'Order placed', data: saved };
  }

  async updateForWaiter(
    id: number,
    updateWaiterOrderDto: UpdateWaiterOrderDto,
    currentUser: any,
  ) {
    if (currentUser.role !== Role.WAITER) {
      throw new ForbiddenException('Only waiters can modify waiter orders');
    }

    if (!currentUser.businessId) {
      throw new BadRequestException('You must create a restaurant first');
    }

    const business = await this.businessRepository.findOne({
      where: { id: currentUser.businessId },
    });
    if (business?.subscription !== SubscriptionStatus.ACTIVE) {
      throw new BadRequestException(
        'Subscription expired. Renew ASAP to continue',
      );
    }

    const order = await this.orderRepository.findOne({
      where: { id, businessId: currentUser.businessId },
    });
    if (!order) throw new NotFoundException('Order not found');
    if (order.billStatus === BillStatus.PAID) {
      throw new BadRequestException('Cannot modify a paid order');
    }

    const items = Array.isArray(updateWaiterOrderDto?.products)
      ? updateWaiterOrderDto.products
      : [];
    if (items.length === 0) {
      throw new BadRequestException('At least one product is required');
    }

    const newQuantityMap = new Map<number, number>();
    for (const item of items) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (!productId || !Number.isInteger(quantity) || quantity < 1) {
        throw new BadRequestException('Invalid product or quantity');
      }
      newQuantityMap.set(
        productId,
        (newQuantityMap.get(productId) || 0) + quantity,
      );
    }

    const oldQuantityMap = new Map<number, number>();
    for (const item of order.products || []) {
      const productId = Number(item?.productId);
      const quantity = Number(item?.quantity);
      if (productId && quantity > 0) {
        oldQuantityMap.set(
          productId,
          (oldQuantityMap.get(productId) || 0) + quantity,
        );
      }
    }

    const productIds = [
      ...new Set([...oldQuantityMap.keys(), ...newQuantityMap.keys()]),
    ];

    const saved = await this.dataSource.transaction(async (manager) => {
      const products = await manager.find(Product, {
        where: { id: In(productIds) },
      });
      const productMap = new Map(products.map((p) => [p.id, p]));

      let totalBill = 0;
      let totalCost = 0;
      const orderItems: { productId: number; quantity: number }[] = [];

      for (const [productId, quantity] of newQuantityMap) {
        const product = productMap.get(productId);
        if (!product) {
          throw new BadRequestException('One or more products were not found');
        }
        if (product.businessId !== currentUser.businessId) {
          throw new ForbiddenException('Access denied');
        }
        if (!product.isActive) {
          throw new BadRequestException(
            `Product "${product.productName}" is not available`,
          );
        }
        totalBill += Number(product.soldPrice) * quantity;
        totalCost += Number(product.costPrice) * quantity;
        orderItems.push({ productId, quantity });
      }

      for (const productId of productIds) {
        const product = productMap.get(productId);
        if (!product || !product.stockRequired) {
          continue;
        }
        const delta =
          (newQuantityMap.get(productId) || 0) -
          (oldQuantityMap.get(productId) || 0);
        if (delta > 0 && Number(product.stock) < delta) {
          throw new BadRequestException(
            `Insufficient stock for "${product.productName}"`,
          );
        }
        if (delta !== 0) {
          await manager.increment(Product, { id: productId }, 'stock', -delta);
        }
      }

      totalBill = Number(totalBill.toFixed(2));
      const profit = Number((totalBill - totalCost).toFixed(2));
      const discount = Number(order.discount || 0);

      order.products = orderItems;
      order.totalBill = totalBill;
      order.subTotal = Number((totalBill - discount).toFixed(2));
      order.profit = profit;
      order.updatedBy = currentUser.id;

      return manager.save(order);
    });

    return { success: true, message: 'Order updated', data: saved };
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
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    if (query.billStatus) {
      where.billStatus = query.billStatus;
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
      tableName: table?.tableName ?? null,
    }));

    return {
      success: true,
      data: flattened,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findWaiterOrders(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<any>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const base: any = {};
    if (currentUser.businessId) {
      base.businessId = currentUser.businessId;
    }
    if (query.billStatus) {
      base.billStatus = query.billStatus;
    }

    const where = [
      { ...base, createdBy: currentUser.id },
      { ...base, waiterId: currentUser.id },
    ];

    const [data, total] = await this.orderRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: { table: true },
      order: { [sortBy]: sortOrder },
    });

    const flattened = data.map((order) => {
      const row: any = {
        ...order,
        tableId: order.table?.id ?? order.tableId,
        tableName: order.table?.tableName ?? null,
      };
      delete row.table;
      delete row.products;
      return row;
    });

    return {
      success: true,
      data: flattened,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findWaiterOrder(id: number, currentUser: any) {
    const where: any = { id };
    if (currentUser.businessId) {
      where.businessId = currentUser.businessId;
    }
    const order = await this.orderRepository.findOne({
      where,
      relations: { table: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    const row: any = {
      ...order,
      tableId: order.table?.id ?? order.tableId,
      tableName: order.table?.tableName ?? null,
    };
    delete row.table;
    return { success: true, data: row };
  }

  async findOne(id: number, currentUser: any) {
    const where: any = { id };
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    const order = await this.orderRepository.findOne({
      where,
      relations: { table: true },
    });
    if (!order) throw new NotFoundException('Order not found');
    return { success: true, data: order };
  }

  async update(id: number, updateOrderDto: UpdateOrderDto, currentUser: any) {
    const where: any = { id };
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new NotFoundException('Order not found');
    if (order.billStatus === BillStatus.PAID) {
      throw new BadRequestException('Cannot modify a paid order');
    }
    Object.assign(order, updateOrderDto, { updatedBy: currentUser.id });
    const saved = await this.orderRepository.save(order);
    return { success: true, message: 'Order updated', data: saved };
  }

  async remove(id: number, currentUser: any) {
    const where: any = { id };
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new NotFoundException('Order not found');
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
    const where: any = { id };
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    const order = await this.orderRepository.findOne({ where });
    if (!order) throw new NotFoundException('Order not found');
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
