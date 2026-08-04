import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DashboardController } from './dashboard.controller';
import { DashboardService } from './dashboard.service';
import { Order } from '../order/entities/order.entity';
import { Expense } from '../expense/entities/expense.entity';
import { Product } from '../product/entities/product.entity';
import { Table } from '../table/entities/table.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Order, Expense, Product, Table])],
  controllers: [DashboardController],
  providers: [DashboardService],
})
export class DashboardModule {}
