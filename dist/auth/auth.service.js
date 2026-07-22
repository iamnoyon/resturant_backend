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
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const user_status_enum_1 = require("../common/enums/user-status.enum");
const role_enum_1 = require("../common/enums/role.enum");
let AuthService = class AuthService {
    userRepository;
    permissionRepository;
    jwtService;
    constructor(userRepository, permissionRepository, jwtService) {
        this.userRepository = userRepository;
        this.permissionRepository = permissionRepository;
        this.jwtService = jwtService;
    }
    async login(loginDto) {
        const user = await this.userRepository.findOne({
            where: { email: loginDto.email },
        });
        if (!user) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        if (user.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Your account is inactive. Please contact admin.');
        }
        const isPasswordValid = await bcrypt.compare(loginDto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid email or password');
        }
        const payload = { sub: user.id, email: user.email, role: user.role };
        const token = this.jwtService.sign(payload);
        const userData = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            role: user.role,
            status: user.status,
            businessId: user.businessId,
        };
        return { token, userData };
    }
    async getProfile(userId) {
        const user = await this.userRepository.findOne({
            where: { id: userId },
            relations: { business: true },
        });
        if (!user || user.status !== user_status_enum_1.UserStatus.ACTIVE) {
            throw new common_1.UnauthorizedException('Invalid token');
        }
        const result = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone,
            profileImageUrl: user.profileImageUrl,
            role: user.role,
            status: user.status,
            businessId: user.businessId,
            business: user.business,
            permissions: [],
        };
        if (user.role === role_enum_1.Role.SUPERADMIN) {
            const allPermissions = await this.permissionRepository.find({
                order: { id: 'ASC' },
            });
            result.permissions = allPermissions.map((p) => ({
                value: p.name,
                name: p.description,
            }));
        }
        else {
            const permissionNames = user.permissions || [];
            if (permissionNames.length > 0) {
                const perms = await this.permissionRepository.find({
                    where: { name: (0, typeorm_2.In)(permissionNames) },
                    order: { id: 'ASC' },
                });
                result.permissions = perms.map((p) => ({
                    value: p.name,
                    name: p.description,
                }));
            }
        }
        return result;
    }
    async updateProfile(userId, dto) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        if (dto.email && dto.email !== user.email) {
            const existing = await this.userRepository.findOne({
                where: { email: dto.email },
            });
            if (existing)
                throw new common_1.ConflictException('Email already exists');
        }
        if (dto.name !== undefined)
            user.name = dto.name;
        if (dto.email !== undefined)
            user.email = dto.email;
        if (dto.profileImageUrl !== undefined)
            user.profileImageUrl = dto.profileImageUrl;
        const saved = await this.userRepository.save(user);
        const { password, ...result } = saved;
        return { success: true, message: 'Profile updated', data: result };
    }
    async updatePassword(userId, oldPassword, newPassword) {
        const user = await this.userRepository.findOne({ where: { id: userId } });
        if (!user)
            throw new common_1.UnauthorizedException('User not found');
        const isMatch = await bcrypt.compare(oldPassword, user.password);
        if (!isMatch)
            throw new common_1.BadRequestException('Old password is incorrect');
        user.password = await bcrypt.hash(newPassword, 10);
        await this.userRepository.save(user);
        return { success: true, message: 'Password updated successfully' };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map