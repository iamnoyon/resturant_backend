import { Injectable, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../order/entities/order.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Table } from '../table/entities/table.entity';
import { Business } from '../business/entities/business.entity';
import { BillStatus } from '../common/enums/bill-status.enum';
import { SubscriptionStatus } from '../common/enums/subscription-status.enum';
import { Role } from '../common/enums/role.enum';

interface PeriodMetrics {
  totalRevenue: number;
  totalOrders: number;
  totalExpenses: number;
  netProfit: number;
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
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async getAdminOverview(currentUser: any) {
    if (currentUser.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const now = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const [
      totalBusinesses,
      activeSubscriptions,
      inactiveSubscriptions,
      expiringSoon,
      revenueResult,
    ] = await Promise.all([
      this.businessRepository.count(),
      this.businessRepository.count({
        where: { subscription: SubscriptionStatus.ACTIVE },
      }),
      this.businessRepository.count({
        where: { subscription: SubscriptionStatus.INACTIVE },
      }),
      this.businessRepository
        .createQueryBuilder('business')
        .where('business.subscription = :status', {
          status: SubscriptionStatus.ACTIVE,
        })
        .andWhere('business.subEndDate BETWEEN :now AND :sevenDays', {
          now,
          sevenDays: sevenDaysFromNow,
        })
        .getCount(),
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalBill - order.discount), 0)', 'total')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .getRawOne(),
    ]);

    return {
      success: true,
      data: {
        totalBusinesses,
        activeSubscriptions,
        inactiveSubscriptions,
        totalRevenue: Number(revenueResult?.total) || 0,
        expiringSoon,
      },
    };
  }

  async getAdminCharts(currentUser: any, year: number) {
    if (currentUser.role !== Role.SUPERADMIN) {
      throw new ForbiddenException('Access denied');
    }

    const [revenueData, businessData] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('EXTRACT(MONTH FROM order.createdAt)', 'month')
        .addSelect('COALESCE(SUM(order.subTotal), 0)', 'amount')
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.PAID,
        })
        .andWhere('EXTRACT(YEAR FROM order.createdAt) = :year', { year })
        .groupBy('EXTRACT(MONTH FROM order.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany(),

      this.businessRepository
        .createQueryBuilder('business')
        .select('EXTRACT(MONTH FROM business.createdAt)', 'month')
        .addSelect('COUNT(business.id)', 'count')
        .where('EXTRACT(YEAR FROM business.createdAt) = :year', { year })
        .groupBy('EXTRACT(MONTH FROM business.createdAt)')
        .orderBy('month', 'ASC')
        .getRawMany(),
    ]);

    const revenueMap = new Map(
      revenueData.map((r: any) => [Number(r.month), Number(r.amount)]),
    );
    const businessMap = new Map(
      businessData.map((b: any) => [Number(b.month), Number(b.count)]),
    );

    const revenue = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      amount: revenueMap.get(i + 1) || 0,
    }));

    const businesses = Array.from({ length: 12 }, (_, i) => ({
      month: i + 1,
      count: businessMap.get(i + 1) || 0,
    }));

    return { success: true, data: { revenue, businesses } };
  }

  async getSummary(currentUser: any, startDate?: string, endDate?: string) {
    const businessFilter = this.businessFilter(currentUser);
    const { start: currentStart, end: currentEnd } = this.normalizeDateRange(
      startDate,
      endDate,
    );

    const currentStartForComparison = new Date(currentStart);
    currentStartForComparison.setHours(0, 0, 0, 0);
    const currentEndForComparison = new Date(currentEnd);
    currentEndForComparison.setHours(23, 59, 59, 999);

    const currentEndDay = new Date(currentEnd);
    currentEndDay.setHours(0, 0, 0, 0);
    const daysInPeriod =
      Math.round(
        (currentEndDay.getTime() - currentStartForComparison.getTime()) /
          MS_PER_DAY,
      ) + 1;

    const previousEnd = new Date(
      currentStartForComparison.getTime() - MS_PER_DAY,
    );
    previousEnd.setHours(23, 59, 59, 999);
    const previousStart = new Date(
      previousEnd.getTime() - (daysInPeriod - 1) * MS_PER_DAY,
    );
    previousStart.setHours(0, 0, 0, 0);

    const [current, previous] = await Promise.all([
      this.computePeriodMetrics(
        businessFilter,
        currentStartForComparison,
        currentEndForComparison,
      ),
      this.computePeriodMetrics(businessFilter, previousStart, previousEnd),
    ]);

    const expensePerMonth = await this.expenseRepository
      .createQueryBuilder('expense')
      .select('EXTRACT(YEAR FROM expense.createdAt)', 'year')
      .addSelect('EXTRACT(MONTH FROM expense.createdAt)', 'month')
      .addSelect('COALESCE(SUM(expense.expenseValue), 0)', 'total')
      .where('expense.createdAt BETWEEN :start AND :end', {
        start: currentStartForComparison,
        end: currentEndForComparison,
      })
      .andWhere(businessFilter)
      .groupBy('EXTRACT(YEAR FROM expense.createdAt)')
      .addGroupBy('EXTRACT(MONTH FROM expense.createdAt)')
      .orderBy('year', 'ASC')
      .addOrderBy('month', 'ASC')
      .getRawMany();

    const netProfit = current.netProfit;
    const previousNetProfit = previous.netProfit;

    return {
      success: true,
      data: {
        totalRevenue: this.withTrend(
          current.totalRevenue,
          previous.totalRevenue,
        ),
        totalOrders: this.withTrend(current.totalOrders, previous.totalOrders),
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
        expensesPerMonth: expensePerMonth.map((e) => ({
          year: Number(e.year),
          month: Number(e.month),
          total: Number(e.total),
        })),
      },
    };
  }

  async getCharts(currentUser: any, startDate?: string, endDate?: string) {
    const now = new Date();

    let dateStart = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), 0, 1);

    let dateEnd = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);

    if (!startDate && !endDate) {
      dateStart = new Date(now.getFullYear(), 0, 1);
      dateEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (startDate && !endDate) {
      dateStart = new Date(startDate);
      dateEnd = new Date(dateStart.getFullYear(), 11, 31, 23, 59, 59, 999);
    } else if (!startDate && endDate) {
      dateEnd = new Date(endDate);
      dateStart = new Date(dateEnd.getFullYear(), 0, 1);
    }

    // Validate dates
    if (Number.isNaN(dateStart.getTime())) {
      dateStart = new Date(now.getFullYear(), 0, 1);
    }

    if (Number.isNaN(dateEnd.getTime())) {
      dateEnd = new Date(now.getFullYear(), 11, 31, 23, 59, 59, 999);
    }

    // Swap dates if start date is greater than end date
    if (dateStart > dateEnd) {
      [dateStart, dateEnd] = [dateEnd, dateStart];
    }

    const businessFilter = this.businessFilter(currentUser);

    const monthMap = new Map<
      string,
      {
        revenue: number;
        netProfit: number;
      }
    >();

    // Generate all months between start and end date
    const monthCursor = new Date(
      dateStart.getFullYear(),
      dateStart.getMonth(),
      1,
    );

    const lastMonth = new Date(dateEnd.getFullYear(), dateEnd.getMonth(), 1);

    while (monthCursor <= lastMonth) {
      const key = `${monthCursor.getFullYear()}-${String(
        monthCursor.getMonth() + 1,
      ).padStart(2, '0')}`;

      monthMap.set(key, {
        revenue: 0,
        netProfit: 0,
      });

      monthCursor.setMonth(monthCursor.getMonth() + 1);
    }

    const [revenueData, expenseData, profitData, discountData] =
      await Promise.all([
        // Revenue
        this.orderRepository
          .createQueryBuilder('order')
          .select('EXTRACT(YEAR FROM order.createdAt)', 'year')
          .addSelect('EXTRACT(MONTH FROM order.createdAt)', 'month')
          .addSelect(
            'COALESCE(SUM(order.totalBill - order.discount), 0)',
            'amount',
          )
          .where('order.billStatus = :billStatus', {
            billStatus: BillStatus.PAID,
          })
          .andWhere('order.createdAt BETWEEN :start AND :end', {
            start: dateStart,
            end: dateEnd,
          })
          .andWhere(businessFilter)
          .groupBy('EXTRACT(YEAR FROM order.createdAt)')
          .addGroupBy('EXTRACT(MONTH FROM order.createdAt)')
          .orderBy('year', 'ASC')
          .addOrderBy('month', 'ASC')
          .getRawMany(),

        // Expenses
        this.expenseRepository
          .createQueryBuilder('expense')
          .select('EXTRACT(YEAR FROM expense.createdAt)', 'year')
          .addSelect('EXTRACT(MONTH FROM expense.createdAt)', 'month')
          .addSelect('COALESCE(SUM(expense.expenseValue), 0)', 'amount')
          .where('expense.createdAt BETWEEN :start AND :end', {
            start: dateStart,
            end: dateEnd,
          })
          .andWhere(businessFilter)
          .groupBy('EXTRACT(YEAR FROM expense.createdAt)')
          .addGroupBy('EXTRACT(MONTH FROM expense.createdAt)')
          .orderBy('year', 'ASC')
          .addOrderBy('month', 'ASC')
          .getRawMany(),

        // Profit
        this.orderRepository
          .createQueryBuilder('order')
          .select('EXTRACT(YEAR FROM order.createdAt)', 'year')
          .addSelect('EXTRACT(MONTH FROM order.createdAt)', 'month')
          .addSelect('COALESCE(SUM(order.profit), 0)', 'amount')
          .where('order.billStatus = :billStatus', {
            billStatus: BillStatus.PAID,
          })
          .andWhere('order.createdAt BETWEEN :start AND :end', {
            start: dateStart,
            end: dateEnd,
          })
          .andWhere(businessFilter)
          .groupBy('EXTRACT(YEAR FROM order.createdAt)')
          .addGroupBy('EXTRACT(MONTH FROM order.createdAt)')
          .orderBy('year', 'ASC')
          .addOrderBy('month', 'ASC')
          .getRawMany(),

        // Discount
        this.orderRepository
          .createQueryBuilder('order')
          .select('EXTRACT(YEAR FROM order.createdAt)', 'year')
          .addSelect('EXTRACT(MONTH FROM order.createdAt)', 'month')
          .addSelect(
            'COALESCE(SUM(order.discount), 0)',
            'amount',
          )
          .where('order.billStatus = :billStatus', {
            billStatus: BillStatus.PAID,
          })
          .andWhere('order.createdAt BETWEEN :start AND :end', {
            start: dateStart,
            end: dateEnd,
          })
          .andWhere(businessFilter)
          .groupBy('EXTRACT(YEAR FROM order.createdAt)')
          .addGroupBy('EXTRACT(MONTH FROM order.createdAt)')
          .orderBy('year', 'ASC')
          .addOrderBy('month', 'ASC')
          .getRawMany(),
      ]);

    // Add revenue data
    revenueData.forEach((item) => {
      const month = `${Number(item.year)}-${String(Number(item.month)).padStart(
        2,
        '0',
      )}`;

      if (monthMap.has(month)) {
        monthMap.get(month)!.revenue = Number(item.amount) || 0;
      }
    });

    // Subtract expenses from net profit
    expenseData.forEach((item) => {
      const month = `${Number(item.year)}-${String(Number(item.month)).padStart(
        2,
        '0',
      )}`;

      if (monthMap.has(month)) {
        monthMap.get(month)!.netProfit -= Number(item.amount) || 0;
      }
    });

    // Add order profit to net profit
    profitData.forEach((item) => {
      const month = `${Number(item.year)}-${String(Number(item.month)).padStart(
        2,
        '0',
      )}`;

      if (monthMap.has(month)) {
        monthMap.get(month)!.netProfit += Number(item.amount) || 0;
      }
    });

    const labels = Array.from(monthMap.keys());

    const revenue = labels.map((month) =>
      Number(monthMap.get(month)?.revenue || 0),
    );

    const netProfit = labels.map((month) =>
      Number(monthMap.get(month)?.netProfit || 0),
    );

    const totalRevenue = revenue.reduce((sum, val) => sum + val, 0);
    const totalProfit = netProfit.reduce((sum, val) => sum + val, 0);
    const totalExpense = expenseData.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );
    const totalDiscount = discountData.reduce(
      (sum, item) => sum + (Number(item.amount) || 0),
      0,
    );

    const pieChart = [
      {
        name: 'Total Revenue',
        value: Number(totalRevenue.toFixed(2)),
      },
      {
        name: 'Total Profit',
        value: Number(totalProfit.toFixed(2)),
      },
      {
        name: 'Total Expense',
        value: Number(totalExpense.toFixed(2)),
      },
      {
        name: 'Total Discount',
        value: Number(totalDiscount.toFixed(2)),
      },
    ];

    // Convert YYYY-MM to Jan, Feb, Mar, etc.
    const getMonthName = (month: string) => {
      const monthNames = [
        'Jan',
        'Feb',
        'Mar',
        'Apr',
        'May',
        'Jun',
        'Jul',
        'Aug',
        'Sep',
        'Oct',
        'Nov',
        'Dec',
      ];

      const monthNumber = Number(month.split('-')[1]);

      return monthNames[monthNumber - 1];
    };

    return {
      success: true,

      data: {
        labels,

        revenue,

        netProfit,

        revenuePerMonth: labels.map((month, index) => ({
          month,
          monthName: getMonthName(month),
          amount: revenue[index],
        })),

        netProfitPerMonth: labels.map((month, index) => ({
          month,
          monthName: getMonthName(month),
          amount: netProfit[index],
        })),

        pieChart,
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
      netProfitResult,
      pendingBillCount,
      avgOrderResult,
      discountResult,
      totalProducts,
      lowStockProducts,
      totalTables,
    ] = await Promise.all([
      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(SUM(order.totalBill - order.discount), 0)', 'total')
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
        .select('COALESCE(SUM(order.profit), 0)', 'total')
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
        .where('order.billStatus = :billStatus', {
          billStatus: BillStatus.UNPAID,
        })
        .andWhere(businessFilter)
        .getCount(),

      this.orderRepository
        .createQueryBuilder('order')
        .select('COALESCE(AVG(order.totalBill - order.discount), 0)', 'avg')
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
      netProfit:
        (Number(netProfitResult?.total) || 0) -
        (Number(expenseResult?.total) || 0),
      pendingBillCount,
      averageOrderValue: Number(Number(avgOrderResult?.avg).toFixed(2)) || 0,
      totalDiscount: Number(discountResult?.total) || 0,
      totalProducts,
      lowStockProducts,
      totalTables,
    };
  }

  private normalizeDateRange(startDate?: string, endDate?: string) {
    const now = new Date();

    let start = startDate
      ? new Date(startDate)
      : new Date(now.getFullYear(), now.getMonth(), 1);
    let end = endDate
      ? new Date(endDate)
      : new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);

    if (Number.isNaN(start.getTime())) {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    if (Number.isNaN(end.getTime())) {
      end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
    }

    if (start > end) {
      [start, end] = [end, start];
    }

    return { start, end };
  }

  private withTrend(current: number, previous: number): TrendIndicator {
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
