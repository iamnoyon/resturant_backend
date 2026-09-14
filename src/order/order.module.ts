import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from './order.service';
import { OrderController } from './order.controller';
import { Order } from './entities/order.entity';
import { Product } from '../product/entities/product.entity';
import { Business } from '../business/entities/business.entity';
import { Table } from '../table/entities/table.entity';
import { User } from '../users/entities/user.entity';
import { TokenModule } from '../token/token.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, Product, Business, Table, User]),
    TokenModule,
  ],
  controllers: [OrderController],
  providers: [OrderService],
})
export class OrderModule {}
