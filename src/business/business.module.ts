import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BusinessService } from './business.service';
import { BusinessController } from './business.controller';
import { Business } from './entities/business.entity';
import { User } from '../users/entities/user.entity';
import { Package } from '../package/entities/package.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Business, User, Package])],
  controllers: [BusinessController],
  providers: [BusinessService],
  exports: [BusinessService],
})
export class BusinessModule {}
