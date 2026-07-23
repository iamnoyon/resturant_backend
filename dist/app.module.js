"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AppModule = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const auth_module_1 = require("./auth/auth.module");
const users_module_1 = require("./users/users.module");
const business_module_1 = require("./business/business.module");
const category_module_1 = require("./category/category.module");
const product_module_1 = require("./product/product.module");
const table_module_1 = require("./table/table.module");
const order_module_1 = require("./order/order.module");
const expense_module_1 = require("./expense/expense.module");
const seed_module_1 = require("./seed/seed.module");
const upload_module_1 = require("./upload/upload.module");
const permissions_module_1 = require("./permissions/permissions.module");
const package_module_1 = require("./package/package.module");
let AppModule = class AppModule {
};
exports.AppModule = AppModule;
exports.AppModule = AppModule = __decorate([
    (0, common_1.Module)({
        imports: [
            config_1.ConfigModule.forRoot({
                isGlobal: true,
                envFilePath: '.env',
            }),
            typeorm_1.TypeOrmModule.forRootAsync({
                imports: [config_1.ConfigModule],
                inject: [config_1.ConfigService],
                useFactory: (configService) => ({
                    type: 'postgres',
                    host: configService.get('DB_HOST'),
                    port: configService.get('DB_PORT'),
                    username: configService.get('DB_USERNAME'),
                    password: configService.get('DB_PASSWORD'),
                    database: configService.get('DB_DATABASE'),
                    entities: [__dirname + '/**/*.entity{.ts,.js}'],
                    synchronize: true,
                }),
            }),
            auth_module_1.AuthModule,
            users_module_1.UsersModule,
            business_module_1.BusinessModule,
            category_module_1.CategoryModule,
            product_module_1.ProductModule,
            table_module_1.TableModule,
            order_module_1.OrderModule,
            expense_module_1.ExpenseModule,
            seed_module_1.SeedModule,
            upload_module_1.UploadModule,
            permissions_module_1.PermissionsModule,
            package_module_1.PackageModule,
        ],
    })
], AppModule);
//# sourceMappingURL=app.module.js.map