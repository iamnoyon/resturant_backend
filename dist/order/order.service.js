"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.OrderService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const order_entity_1 = require("./entities/order.entity");
const product_entity_1 = require("../product/entities/product.entity");
const role_enum_1 = require("../common/enums/role.enum");
const bill_status_enum_1 = require("../common/enums/bill-status.enum");
let OrderService = class OrderService {
    orderRepository;
    productRepository;
    constructor(orderRepository, productRepository) {
        this.orderRepository = orderRepository;
        this.productRepository = productRepository;
    }
    async create(createOrderDto, currentUser) {
        const now = new Date();
        const dateStr = now.getFullYear().toString() +
            (now.getMonth() + 1).toString().padStart(2, '0') +
            now.getDate().toString().padStart(2, '0');
        const timeStr = now.getHours().toString().padStart(2, '0') +
            now.getMinutes().toString().padStart(2, '0') +
            now.getSeconds().toString().padStart(2, '0');
        const orderId = `ORD-${dateStr}${timeStr}`;
        const order = this.orderRepository.create({
            ...createOrderDto,
            orderId,
            businessId: currentUser.businessId,
            createdBy: currentUser.id,
        });
        const saved = await this.orderRepository.save(order);
        for (const item of createOrderDto.products) {
            if (item.quantity > 0) {
                const product = await this.productRepository.findOne({
                    where: { id: item.productId },
                });
                if (product && product.stockRequired) {
                    product.stock = Math.max(0, Number(product.stock) - item.quantity);
                    await this.productRepository.save(product);
                }
            }
        }
        return { success: true, message: 'Order created', data: saved };
    }
    async findAll(query, currentUser) {
        const page = Math.max(+(query.page || 1), 1);
        const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
        const skip = (page - 1) * limit;
        const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const sortBy = query.sortBy || 'createdAt';
        const where = {};
        if (currentUser.role === role_enum_1.Role.ADMIN) {
            where.createdBy = currentUser.id;
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            where.businessId = currentUser.businessId;
        }
        const [data, total] = await this.orderRepository.findAndCount({
            where,
            skip,
            take: limit,
            relations: { table: true },
            order: { [sortBy]: sortOrder },
        });
        const flattened = data.map(({ table, products, ...rest }) => ({
            ...rest,
            tableId: table?.id ?? rest.tableId,
        }));
        return {
            success: true,
            data: flattened,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, currentUser) {
        const order = await this.orderRepository.findOne({
            where: { id },
            relations: { table: true },
        });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            order.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            order.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: order };
    }
    async update(id, updateOrderDto, currentUser) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            order.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            order.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        Object.assign(order, updateOrderDto, { updatedBy: currentUser.id });
        const saved = await this.orderRepository.save(order);
        return { success: true, message: 'Order updated', data: saved };
    }
    async remove(id, currentUser) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            order.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            order.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (order.billStatus === bill_status_enum_1.BillStatus.PAID) {
            throw new common_1.BadRequestException('Cannot delete a paid order');
        }
        if (order.products && order.products.length > 0) {
            for (const item of order.products) {
                if (item.quantity > 0) {
                    const product = await this.productRepository.findOne({
                        where: { id: item.productId },
                    });
                    if (product && product.stockRequired) {
                        product.stock = Number(product.stock) + item.quantity;
                        await this.productRepository.save(product);
                    }
                }
            }
        }
        await this.orderRepository.remove(order);
        return { success: true, message: 'Order removed' };
    }
    async updateBillStatus(id, billStatus, currentUser) {
        const order = await this.orderRepository.findOne({ where: { id } });
        if (!order)
            throw new common_1.NotFoundException('Order not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            order.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            order.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        order.billStatus = billStatus;
        order.updatedBy = currentUser.id;
        const saved = await this.orderRepository.save(order);
        return {
            success: true,
            message: `Bill marked as ${billStatus}`,
            data: saved,
        };
    }
};
exports.OrderService = OrderService;
exports.OrderService = OrderService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(order_entity_1.Order)),
    __param(1, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], OrderService);
//# sourceMappingURL=order.service.js.map