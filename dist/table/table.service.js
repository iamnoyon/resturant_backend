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
exports.TableService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const table_entity_1 = require("./entities/table.entity");
const role_enum_1 = require("../common/enums/role.enum");
let TableService = class TableService {
    tableRepository;
    constructor(tableRepository) {
        this.tableRepository = tableRepository;
    }
    async create(createTableDto, currentUser) {
        const table = this.tableRepository.create({
            ...createTableDto,
            businessId: currentUser.businessId,
            createdBy: currentUser.id,
        });
        const saved = await this.tableRepository.save(table);
        return { success: true, message: 'Table created', data: saved };
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
            where.tableName = (0, typeorm_2.ILike)(`%${query.search}%`);
        }
        const [data, total] = await this.tableRepository.findAndCount({
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
        const table = await this.tableRepository.findOne({ where: { id } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            table.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            table.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: table };
    }
    async update(id, updateTableDto, currentUser) {
        const table = await this.tableRepository.findOne({ where: { id } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            table.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            table.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        Object.assign(table, updateTableDto, { updatedBy: currentUser.id });
        const saved = await this.tableRepository.save(table);
        return { success: true, message: 'Table updated', data: saved };
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
        const data = await this.tableRepository.find({
            where,
            select: { id: true, tableName: true, totalSeat: true },
            order: { tableName: 'ASC' },
        });
        return { success: true, data };
    }
    async remove(id, currentUser) {
        const table = await this.tableRepository.findOne({ where: { id } });
        if (!table)
            throw new common_1.NotFoundException('Table not found');
        if ((currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) &&
            table.createdBy !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER &&
            table.businessId !== currentUser.businessId) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.tableRepository.remove(table);
        return { success: true, message: 'Table removed' };
    }
};
exports.TableService = TableService;
exports.TableService = TableService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(table_entity_1.Table)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], TableService);
//# sourceMappingURL=table.service.js.map