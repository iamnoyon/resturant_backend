import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PaymentService } from './payment.service';
import { PaymentController } from './payment.controller';
import { Payment } from './entities/payment.entity';
import { Package } from '../package/entities/package.entity';
import { Business } from '../business/entities/business.entity';
import { User } from '../users/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Payment, Package, Business, User])],
  controllers: [PaymentController],
  providers: [PaymentService],
})
export class PaymentModule {}
