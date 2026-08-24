import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entities/order.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Table } from '../table/entities/table.entity';
import { Business } from '../business/entities/business.entity';
import { Payment } from '../payment/entities/payment.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Order,
      Expense,
      Product,
      Table,
      Business,
      Payment,
      User,
    ]),
  ],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
