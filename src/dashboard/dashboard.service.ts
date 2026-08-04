import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Table } from '../table/entities/table.entity';
import { BillStatus } from '../common/enums/bill-status.enum';
import { Role } from '../common/enums/role.enum';

interface PeriodMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  pendingBillCount: number;
  averageOrderValue: number;
  totalDiscount: number;
  totalProducts: number;
  lowStockProducts: number;
  totalTables: number;
}

interface TrendIndicator {
  value: number;
  change: number;
  trend: 'up' | 'down' | 'stable';
}

export type { TrendIndicator };

const MS_PER_DAY = 86400000;

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
    const businessFilter = this.businessFilter(currentUser);

    const currentStart = new Date(startDate);
    currentStart.setHours(0, 0, 0, 0);
    const currentEnd = new Date(endDate);
    currentEnd.setHours(23, 59, 59, 999);

    const currentEndDay = new Date(endDate);
    currentEndDay.setHours(0, 0, 0, 0);
    const daysInPeriod =
      Math.round(
        (currentEndDay.getTime() - currentStart.getTime()) / MS_PER_DAY,
      ) + 1;

    const previousEnd = new Date(currentStart.getTime() - MS_PER_DAY);
    previousEnd.setHours(23, 59, 59, 999);
    const previousStart = new Date(
      previousEnd.getTime() - (daysInPeriod - 1) * MS_PER_DAY,
    );
    previousStart.setHours(0, 0, 0, 0);

    const [current, previous] = await Promise.all([
      this.computePeriodMetrics(businessFilter, currentStart, currentEnd),
      this.computePeriodMetrics(businessFilter, previousStart, previousEnd),
    ]);

    const netProfit = current.totalRevenue - current.totalExpenses;
    const previousNetProfit =
      previous.totalRevenue - previous.totalExpenses;

    return {
      success: true,
      data: {
        totalRevenue: this.withTrend(
          current.totalRevenue,
          previous.totalRevenue,
        ),
        totalOrders: this.withTrend(
          current.totalOrders,
          previous.totalOrders,
        ),
        totalExpenses: this.withTrend(
          current.totalExpenses,
          previous.totalExpenses,
        ),
        netProfit: this.withTrend(netProfit, previousNetProfit),
        pendingBillCount: this.withTrend(
          current.pendingBillCount,
          previous.pendingBillCount,
        ),
        averageOrderValue: this.withTrend(
          current.averageOrderValue,
          previous.averageOrderValue,
        ),
        totalDiscount: this.withTrend(
          current.totalDiscount,
          previous.totalDiscount,
        ),
        totalProducts: current.totalProducts,
        lowStockProducts: current.lowStockProducts,
        totalTables: current.totalTables,
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

  private async computePeriodMetrics(
    businessFilter: { businessId?: number },
    dateStart: Date,
    dateEnd: Date,
  ): Promise<PeriodMetrics> {
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

    return {
      totalRevenue: Number(revenueResult?.total) || 0,
      totalOrders: orderCount,
      totalExpenses: Number(expenseResult?.total) || 0,
      pendingBillCount,
      averageOrderValue:
        Number(Number(avgOrderResult?.avg).toFixed(2)) || 0,
      totalDiscount: Number(discountResult?.total) || 0,
      totalProducts,
      lowStockProducts,
      totalTables,
    };
  }

  private withTrend(
    current: number,
    previous: number,
  ): TrendIndicator {
    let change: number;
    let trend: 'up' | 'down' | 'stable';

    if (previous === 0) {
      if (current === 0) {
        change = 0;
        trend = 'stable';
      } else {
        change = 100;
        trend = 'up';
      }
    } else {
      const raw = ((current - previous) / previous) * 100;
      change = Math.round(raw * 100) / 100;
      trend = change > 0 ? 'up' : change < 0 ? 'down' : 'stable';
    }

    return { value: current, change, trend };
  }

  private businessFilter(currentUser: any) {
    if (currentUser.role === Role.SUPERADMIN) {
      return {};
    }
    return { businessId: currentUser.businessId };
  }
}
