import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Permission } from '../permissions/entities/permission.entity';
export declare class SeedService implements OnModuleInit {
    private userRepository;
    private businessRepository;
    private permissionRepository;
    private configService;
    constructor(userRepository: Repository<User>, businessRepository: Repository<Business>, permissionRepository: Repository<Permission>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
    private seedPermissions;
    private seedUsers;
    private getAdminPermissionNames;
    private getAllPermissionNames;
    private ensureAdminHasPermissions;
}
