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
exports.BusinessService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const business_entity_1 = require("./entities/business.entity");
const user_entity_1 = require("../users/entities/user.entity");
const role_enum_1 = require("../common/enums/role.enum");
let BusinessService = class BusinessService {
    businessRepository;
    userRepository;
    constructor(businessRepository, userRepository) {
        this.businessRepository = businessRepository;
        this.userRepository = userRepository;
    }
    async upsert(upsertBusinessDto, currentUser) {
        const existing = await this.businessRepository.findOne({
            where: { adminId: currentUser.id },
        });
        if (existing) {
            Object.assign(existing, upsertBusinessDto);
            const saved = await this.businessRepository.save(existing);
            return { success: true, message: 'Business updated', data: saved };
        }
        const business = this.businessRepository.create({
            ...upsertBusinessDto,
            adminId: currentUser.id,
        });
        const saved = await this.businessRepository.save(business);
        await this.userRepository.update(currentUser.id, { businessId: saved.id });
        return { success: true, message: 'Business created', data: saved };
    }
    async findAll(query, currentUser) {
        const page = Math.max(+(query.page || 1), 1);
        const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
        const skip = (page - 1) * limit;
        const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
        const sortBy = query.sortBy || 'createdAt';
        const where = {};
        if (currentUser.role === role_enum_1.Role.ADMIN) {
            where.adminId = currentUser.id;
        }
        if (query.search) {
            where.businessName = (0, typeorm_2.ILike)(`%${query.search}%`);
        }
        const [data, total] = await this.businessRepository.findAndCount({
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
    async findByAdminId(adminId) {
        const business = await this.businessRepository.findOne({
            where: { adminId },
        });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        return { success: true, data: business };
    }
    async findOne(id, currentUser) {
        const business = await this.businessRepository.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        if (business.adminId !== currentUser.id) {
            throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: business };
    }
    async remove(id, currentUser) {
        const business = await this.businessRepository.findOne({ where: { id } });
        if (!business)
            throw new common_1.NotFoundException('Business not found');
        if (business.adminId !== currentUser.id)
            throw new common_1.ForbiddenException('Access denied');
        await this.businessRepository.remove(business);
        return { success: true, message: 'Business removed' };
    }
};
exports.BusinessService = BusinessService;
exports.BusinessService = BusinessService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(1, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository])
], BusinessService);
//# sourceMappingURL=business.service.js.map