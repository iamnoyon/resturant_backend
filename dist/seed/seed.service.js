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
exports.SeedService = void 0;
const common_1 = require("@nestjs/common");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const bcrypt = __importStar(require("bcrypt"));
const user_entity_1 = require("../users/entities/user.entity");
const business_entity_1 = require("../business/entities/business.entity");
const permission_entity_1 = require("../permissions/entities/permission.entity");
const role_enum_1 = require("../common/enums/role.enum");
const user_status_enum_1 = require("../common/enums/user-status.enum");
const permissions_constants_1 = require("../permissions/permissions.constants");
let SeedService = class SeedService {
    userRepository;
    businessRepository;
    permissionRepository;
    configService;
    constructor(userRepository, businessRepository, permissionRepository, configService) {
        this.userRepository = userRepository;
        this.businessRepository = businessRepository;
        this.permissionRepository = permissionRepository;
        this.configService = configService;
    }
    async onModuleInit() {
        await this.seed();
    }
    async seed() {
        await this.seedPermissions();
        await this.seedUsers();
    }
    async seedPermissions() {
        const count = await this.permissionRepository.count();
        if (count > 0) {
            console.log('[Seed] Permissions already exist, skipping.');
            return;
        }
        console.log('[Seed] Seeding permission list...');
        await this.permissionRepository.save(permissions_constants_1.PERMISSIONS_LIST);
        console.log(`[Seed] Seeded ${permissions_constants_1.PERMISSIONS_LIST.length} permissions.`);
    }
    async seedUsers() {
        const userCount = await this.userRepository.count();
        if (userCount > 0) {
            console.log('[Seed] Users already exist, skipping user seed.');
            await this.ensureAdminHasPermissions();
            return;
        }
        console.log('[Seed] No users found. Seeding superadmin and admin...');
        const superadminPassword = await bcrypt.hash(this.configService.get('SUPERADMIN_PASSWORD', 'Super@123'), 10);
        const superadmin = this.userRepository.create({
            name: this.configService.get('SUPERADMIN_NAME', 'Super Admin'),
            email: this.configService.get('SUPERADMIN_EMAIL', 'superadmin@restaurant.com'),
            phone: this.configService.get('SUPERADMIN_PHONE', '01700000000'),
            password: superadminPassword,
            role: role_enum_1.Role.SUPERADMIN,
            status: user_status_enum_1.UserStatus.ACTIVE,
        });
        const savedSuperadmin = await this.userRepository.save(superadmin);
        console.log(`[Seed] Superadmin created: ${savedSuperadmin.email}`);
        const allPermissionNames = await this.getAllPermissionNames();
        const adminPassword = await bcrypt.hash(this.configService.get('ADMIN_PASSWORD', 'Admin@123'), 10);
        const admin = this.userRepository.create({
            name: this.configService.get('ADMIN_NAME', 'Admin'),
            email: this.configService.get('ADMIN_EMAIL', 'admin@restaurant.com'),
            phone: this.configService.get('ADMIN_PHONE', '01700000001'),
            password: adminPassword,
            role: role_enum_1.Role.ADMIN,
            status: user_status_enum_1.UserStatus.ACTIVE,
            createdBy: savedSuperadmin.id,
            permissions: allPermissionNames,
        });
        const savedAdmin = await this.userRepository.save(admin);
        const business = this.businessRepository.create({
            businessName: 'Default Restaurant',
            area: 'Main Area',
            adminId: savedAdmin.id,
        });
        const savedBusiness = await this.businessRepository.save(business);
        savedAdmin.businessId = savedBusiness.id;
        await this.userRepository.save(savedAdmin);
        console.log(`[Seed] Admin created: ${savedAdmin.email}`);
        console.log('[Seed] Seeding completed.');
    }
    async getAllPermissionNames() {
        await this.seedPermissions();
        const permissions = await this.permissionRepository.find();
        return permissions.map((p) => p.name);
    }
    async ensureAdminHasPermissions() {
        await this.seedPermissions();
        const admins = await this.userRepository.find({
            where: { role: role_enum_1.Role.ADMIN },
        });
        const allPermissionNames = await this.getAllPermissionNames();
        if (allPermissionNames.length === 0) {
            console.log('[Seed] No permissions found, skipping admin assignment.');
            return;
        }
        for (const admin of admins) {
            if (!admin.permissions || admin.permissions.length === 0) {
                admin.permissions = allPermissionNames;
                admin.updatedBy = admin.createdBy || admin.id;
                await this.userRepository.save(admin);
                console.log(`[Seed] Assigned ${allPermissionNames.length} permissions to admin: ${admin.email}`);
            }
        }
    }
};
exports.SeedService = SeedService;
exports.SeedService = SeedService = __decorate([
    (0, common_1.Injectable)(),
    __param(0, (0, typeorm_1.InjectRepository)(user_entity_1.User)),
    __param(1, (0, typeorm_1.InjectRepository)(business_entity_1.Business)),
    __param(2, (0, typeorm_1.InjectRepository)(permission_entity_1.Permission)),
    __metadata("design:paramtypes", [typeorm_2.Repository,
        typeorm_2.Repository,
        typeorm_2.Repository,
        config_1.ConfigService])
], SeedService);
//# sourceMappingURL=seed.service.js.map