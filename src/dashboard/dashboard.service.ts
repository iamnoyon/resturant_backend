import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Table } from '../table/entities/table.entity';
import { BillStatus } from '../common/enums/bill-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async getSummary(currentUser: any, startDate: string, endDate: string) {
    const dateStart = new Date(startDate);
    const dateEnd = new Date(endDate);
    dateEnd.setHours(23, 59, 59, 999);

    const businessFilter = this.businessFilter(currentUser);

    const [
      revenueResult,
      orderCount,
      expenseResult,
      pendingBillCount,
      avgOrderResult,
      discountResult,
      totalProducts,
      lowStockProducts,
      totalTables,
    ] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.subTotal), 0)', 'total')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .andWhere('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .getRawOne(),

      this.orderRepository
        .createQueryBuilder('order')
        .where('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .getCount(),

      this.expenseRepository
        .createQueryBuilder('expense')
        .select('COALESCE(SUM(expense.expenseValue), 0)', 'total')
        .where('expense.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .getRawOne(),

      this.orderRepository
        .createQueryBuilder('order')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.UNPAID,
        })
        .andWhere(businessFilter)
        .getCount(),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(AVG(order.subTotal), 0)', 'avg')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .andWhere('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .getRawOne(),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.discount), 0)', 'total')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .andWhere('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .getRawOne(),

      this.productRepository
        .createQueryBuilder('product')
        .where('product.isActive = :isActive', { isActive: true })
        .andWhere(businessFilter)
        .getCount(),

      this.productRepository
        .createQueryBuilder('product')
        .where('product.stock < :threshold', { threshold: 5 })
        .andWhere('product.isActive = :isActive', { isActive: true })
        .andWhere(businessFilter)
        .getCount(),

      this.tableRepository
        .createQueryBuilder('table')
        .andWhere(businessFilter)
        .getCount(),
    ]);

    const totalRevenue = Number(revenueResult?.total) || 0;
    const totalExpenses = Number(expenseResult?.total) || 0;
    const averageOrderValue =
      Number(Number(avgOrderResult?.avg).toFixed(2)) || 0;
    const totalDiscount = Number(discountResult?.total) || 0;

    return {
      success: true,
      data: {
        totalRevenue,
        totalOrders: orderCount,
        totalExpenses,
        netProfit: totalRevenue - totalExpenses,
        pendingBillCount,
        averageOrderValue,
        totalDiscount,
        totalProducts,
        lowStockProducts,
        totalTables,
      },
    };
  }

  async getCharts(currentUser: any, startDate: string, endDate: string) {
    const dateStart = new Date(startDate);
    const dateEnd = new Date(endDate);
    dateEnd.setHours(23, 59, 59, 999);

    const businessFilter = this.businessFilter(currentUser);

    const [revenueData, orderData, expenseData] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('DATE(order.createdAt)', 'date')
        .addSelect('COALESCE(SUM(order.subTotal), 0)', 'amount')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .andWhere('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .groupBy('DATE(order.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany(),

      this.orderRepository
        .createQueryBuilder('order')
        .select('DATE(order.createdAt)', 'date')
        .addSelect('COUNT(order.id)', 'count')
        .where('order.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .groupBy('DATE(order.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany(),

      this.expenseRepository
        .createQueryBuilder('expense')
        .select('DATE(expense.createdAt)', 'date')
        .addSelect('COALESCE(SUM(expense.expenseValue), 0)', 'amount')
        .where('expense.createdAt BETWEEN :start AND :end', {
          start: dateStart,
          end: dateEnd,
        })
        .andWhere(businessFilter)
        .groupBy('DATE(expense.createdAt)')
        .orderBy('date', 'ASC')
        .getRawMany(),
    ]);

    return {
      success: true,
      data: {
        revenuePerDay: revenueData.map((r) => ({
          date: r.date,
          amount: Number(r.amount),
        })),
        ordersPerDay: orderData.map((o) => ({
          date: o.date,
          count: Number(o.count),
        })),
        expensesPerDay: expenseData.map((e) => ({
          date: e.date,
          amount: Number(e.amount),
        })),
      },
    };
  }

  async getRecentOrders(currentUser: any, limit: number = 10) {
    const businessFilter = this.businessFilter(currentUser);

    const orders = await this.orderRepository.find({
      where: businessFilter,
      relations: { table: true },
      order: { createdAt: 'DESC' },
      take: limit,
    });

    const data = orders.map((order) => ({
      id: order.id,
      orderId: order.orderId,
      tableName: order.table?.tableName || `Table #${order.tableId}`,
      totalBill: Number(order.totalBill),
      discount: Number(order.discount),
      subTotal: Number(order.subTotal),
      billStatus: order.billStatus,
      productCount: (order.products || []).reduce(
        (sum: number, p: { quantity: number }) => sum + p.quantity,
        0,
      ),
      createdAt: order.createdAt,
    }));

    return { success: true, data };
  }

  private businessFilter(currentUser: any) {
    if (currentUser.role === Role.SUPERADMIN) {
      return {};
    }
    return { businessId: currentUser.businessId };
  }
}
