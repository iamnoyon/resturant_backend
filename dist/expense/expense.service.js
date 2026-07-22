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
exports.ExpenseService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const expense_entity_1 = require("./entities/expense.entity");
const role_enum_1 = require("../common/enums/role.enum");
let ExpenseService = class ExpenseService {
    expenseRepository;
    constructor(expenseRepository) {
        this.expenseRepository = expenseRepository;
    }
    async create(createExpenseDto, currentUser) {
        const expense = this.expenseRepository.create({
            ...createExpenseDto,
            businessId: currentUser.businessId,
            createdBy: currentUser.id,
        });
        const saved = await this.expenseRepository.save(expense);
        return { success: true, message: 'Expense created', data: saved };
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
        if (query.search) {
            where.expenseName = (0, typeorm_2.ILike)(`%${query.search}%`);
        }
        const [data, total] = await this.expenseRepository.findAndCount({
            where,
            skip,
            take: limit,
            order: { [sortBy]: sortOrder },
        });
        return {
            success: true,
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, currentUser) {
        const expense = await this.expenseRepository.findOne({ where: { id } });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            expense.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            expense.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: expense };
    }
    async update(id, updateExpenseDto, currentUser) {
        const expense = await this.expenseRepository.findOne({ where: { id } });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            expense.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            expense.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        Object.assign(expense, updateExpenseDto, { updatedBy: currentUser.id });
        const saved = await this.expenseRepository.save(expense);
        return { success: true, message: 'Expense updated', data: saved };
    }
    async remove(id, currentUser) {
        const expense = await this.expenseRepository.findOne({ where: { id } });
        if (!expense)
            throw new common_1.NotFoundException('Expense not found');
        if ((currentUser.role === role_enum_1.Role.ADMIN) &&
            expense.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            expense.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.expenseRepository.remove(expense);
        return { success: true, message: 'Expense removed' };
    }
};
exports.ExpenseService = ExpenseService;
exports.ExpenseService = ExpenseService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(expense_entity_1.Expense)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], ExpenseService);
//# sourceMappingURL=expense.service.js.map