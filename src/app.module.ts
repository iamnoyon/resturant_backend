import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { BusinessModule } from './business/business.module';
import { CategoryModule } from './category/category.module';
import { ProductModule } from './product/product.module';
import { TableModule } from './table/table.module';
import { OrderModule } from './order/order.module';
import { ExpenseModule } from './expense/expense.module';
import { SeedModule } from './seed/seed.module';
import { UploadModule } from './upload/upload.module';
import { PermissionsModule } from './permissions/permissions.module';
import { PackageModule } from './package/package.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get<string>('DB_HOST'),
        port: configService.get<number>('DB_PORT'),
        username: configService.get<string>('DB_USERNAME'),
        password: configService.get<string>('DB_PASSWORD'),
        database: configService.get<string>('DB_DATABASE'),
        entities: [__dirname + '/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    AuthModule,
    UsersModule,
    BusinessModule,
    CategoryModule,
    ProductModule,
    TableModule,
    OrderModule,
    ExpenseModule,
    SeedModule,
    UploadModule,
    PermissionsModule,
    PackageModule,
  ],
})
export class AppModule {}
