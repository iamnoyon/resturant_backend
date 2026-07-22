import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { Role } from '../common/enums/role.enum';
export declare class AuthService {
    private userRepository;
    private permissionRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, permissionRepository: Repository<Permission>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        userData: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: Role;
            status: UserStatus.ACTIVE;
            businessId: number;
        };
    }>;
    getProfile(userId: number): Promise<any>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: Role;
            status: UserStatus;
            profileImageUrl: string;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            permissions: string[];
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updatePassword(userId: number, oldPassword: string, newPassword: string): Promise<{
        success: boolean;
        message: string;
    }>;
}
