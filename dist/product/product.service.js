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
exports.ProductService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const product_entity_1 = require("./entities/product.entity");
const role_enum_1 = require("../common/enums/role.enum");
let ProductService = class ProductService {
    productRepository;
    constructor(productRepository) {
        this.productRepository = productRepository;
    }
    async create(createProductDto, currentUser) {
        const product = this.productRepository.create({
            ...createProductDto,
            businessId: currentUser.businessId,
            createdBy: currentUser.id,
        });
        const saved = await this.productRepository.save(product);
        return { success: true, message: 'Product created', data: saved };
    }
    async findAll(query, currentUser) {
        const page = Math.max(+(query.page || 1), 1);
        const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
        const skip = (page - 1) * limit;
        const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const sortBy = query.sortBy || 'createdAt';
        const where = {};
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            where.createdBy = currentUser.id;
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            where.businessId = currentUser.businessId;
        }
        if (query.search) {
            where.productName = (0, typeorm_2.ILike)(`%${query.search}%`);
        }
        if (query.categoryId) {
            where.categoryId = +query.categoryId;
        }
        const [data, total] = await this.productRepository.findAndCount({
            where,
            skip,
            take: limit,
            relations: { category: true },
            order: { [sortBy]: sortOrder },
        });
        const flattened = data.map(({ category, ...rest }) => ({
            ...rest,
            categoryId: category?.id ?? rest.categoryId,
            categoryName: category?.categoryName ?? null,
        }));
        return {
            success: true,
            data: flattened,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, currentUser) {
        const product = await this.productRepository.findOne({
            where: { id },
            relations: { category: true },
        });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            product.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            product.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        const { category, ...rest } = product;
        const flattened = {
            ...rest,
            categoryId: category?.id ?? rest.categoryId,
            categoryName: category?.categoryName ?? null,
        };
        return { success: true, data: flattened };
    }
    async update(id, updateProductDto, currentUser) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            product.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            product.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        Object.assign(product, updateProductDto, { updatedBy: currentUser.id });
        const saved = await this.productRepository.save(product);
        return { success: true, message: 'Product updated', data: saved };
    }
    async dropdown(currentUser) {
        const where = { isActive: true };
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            where.createdBy = currentUser.id;
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            where.businessId = currentUser.businessId;
        }
        const data = await this.productRepository.find({
            where,
            select: { id: true, productName: true, soldPrice: true, stock: true, imageUrl: true },
            order: { productName: 'ASC' },
        });
        return { success: true, data };
    }
    async findByCategory(categoryId, currentUser) {
        const where = { isActive: true, categoryId };
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            where.createdBy = currentUser.id;
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            where.businessId = currentUser.businessId;
        }
        const data = await this.productRepository.find({
            where,
            select: { id: true, productName: true, soldPrice: true, stock: true, imageUrl: true },
            order: { productName: 'ASC' },
        });
        return { success: true, data };
    }
    async updateStock(id, stock, currentUser) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            product.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            product.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        product.stock = Number(product.stock) + Number(stock);
        product.updatedBy = currentUser.id;
        const saved = await this.productRepository.save(product);
        return { success: true, message: 'Stock updated', data: saved };
    }
    async remove(id, currentUser) {
        const product = await this.productRepository.findOne({ where: { id } });
        if (!product)
            throw new common_1.NotFoundException('Product not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            product.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            product.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.productRepository.remove(product);
        return { success: true, message: 'Product removed' };
    }
};
exports.ProductService = ProductService;
exports.ProductService = ProductService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(product_entity_1.Product)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ProductService);
//# sourceMappingURL=product.service.js.map