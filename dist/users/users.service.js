"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UsersService = void 0;
const common_1 = require("@nestjs/common");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("./entities/user.entity");
const role_enum_1 = require("../common/enums/role.enum");
const user_status_enum_1 = require("../common/enums/user-status.enum");
let UsersService = class UsersService {
    userRepository;
    constructor(userRepository) {
        this.userRepository = userRepository;
    }
    async create(createUserDto, currentUser) {
        if (createUserDto.role === role_enum_1.Role.SUPERADMIN) {
            throw new common_1.BadRequestException('Cannot create superadmin');
        }
        if (currentUser.role === role_enum_1.Role.ADMIN &&
            createUserDto.role !== role_enum_1.Role.CASHIER) {
            throw new common_1.ForbiddenException('Admin can only create cashier accounts');
        }
        if (currentUser.role === role_enum_1.Role.CASHIER) {
            throw new common_1.ForbiddenException('Cashier cannot create users');
        }
        const existingUser = await this.userRepository.findOne({
            where: { email: createUserDto.email },
        });
        if (existingUser) {
            throw new common_1.ConflictException('Email already exists');
        }
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
        const user = this.userRepository.create({
            name: createUserDto.name,
            email: createUserDto.email,
            phone: createUserDto.phone || null,
            password: hashedPassword,
            role: createUserDto.role,
            businessId: createUserDto.businessId || currentUser.businessId,
            createdBy: currentUser.id,
            status: user_status_enum_1.UserStatus.ACTIVE,
        });
        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return {
            success: true,
            message: 'User created successfully',
            data: result,
        };
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
            where.id = currentUser.id;
        }
        if (query.search) {
            where.name = (0, typeorm_2.ILike)(`%${query.search}%`);
        }
        const [data, total] = await this.userRepository.findAndCount({
            where,
            skip,
            take: limit,
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                businessId: true,
                createdAt: true,
            },
            order: { [sortBy]: sortOrder },
        });
        return {
            success: true,
            data,
            meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
        };
    }
    async findOne(id, currentUser) {
        const user = await this.userRepository.findOne({
            where: { id },
            select: {
                id: true,
                name: true,
                email: true,
                phone: true,
                role: true,
                status: true,
                businessId: true,
                createdAt: true,
            },
        });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            if (user.createdBy !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            if (user.businessId !== currentUser.businessId)
                throw new common_1.ForbiddenException('Access denied');
            if (user.id !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        return { success: true, data: user };
    }
    async update(id, updateUserDto, currentUser) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            if (user.createdBy !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            if (user.businessId !== currentUser.businessId)
                throw new common_1.ForbiddenException('Access denied');
            if (user.id !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        if (updateUserDto.password) {
            updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
        }
        delete updateUserDto.role;
        user.updatedBy = currentUser.id;
        if (updateUserDto.name !== undefined)
            user.name = updateUserDto.name;
        if (updateUserDto.email !== undefined)
            user.email = updateUserDto.email;
        if (updateUserDto.phone !== undefined)
            user.phone = updateUserDto.phone;
        if (updateUserDto.password !== undefined)
            user.password = updateUserDto.password;
        if (updateUserDto.status !== undefined)
            user.status = updateUserDto.status;
        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return {
            success: true,
            message: 'User updated successfully',
            data: result,
        };
    }
    async remove(id, currentUser) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === role_enum_1.Role.SUPERADMIN)
            throw new common_1.BadRequestException('Cannot delete superadmin');
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            if (user.createdBy !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            throw new common_1.ForbiddenException('Access denied');
        }
        await this.userRepository.softRemove(user);
        return { success: true, message: 'User removed successfully' };
    }
    async toggleStatus(id, currentUser) {
        const user = await this.userRepository.findOne({ where: { id } });
        if (!user)
            throw new common_1.NotFoundException('User not found');
        if (user.role === role_enum_1.Role.SUPERADMIN)
            throw new common_1.BadRequestException('Cannot change superadmin status');
        if (currentUser.role === role_enum_1.Role.SUPERADMIN ||
            currentUser.role === role_enum_1.Role.ADMIN) {
            if (user.createdBy !== currentUser.id)
                throw new common_1.ForbiddenException('Access denied');
        }
        else if (currentUser.role === role_enum_1.Role.CASHIER) {
            throw new common_1.ForbiddenException('Access denied');
        }
        user.status =
            user.status === user_status_enum_1.UserStatus.ACTIVE
                ? user_status_enum_1.UserStatus.INACTIVE
                : user_status_enum_1.UserStatus.ACTIVE;
        user.updatedBy = currentUser.id;
        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return { success: true, message: `User ${result.status}`, data: result };
    }
};
exports.UsersService = UsersService;
exports.UsersService = UsersService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __metadata("design:paramtypes", [typeorm_2.Repository])
], UsersService);
//# sourceMappingURL=users.service.js.map