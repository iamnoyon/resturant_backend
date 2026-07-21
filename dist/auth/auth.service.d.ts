import { JwtService } from '@nestjs/jwt';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserStatus } from '../common/enums/user-status.enum';
export declare class AuthService {
    private userRepository;
    private jwtService;
    constructor(userRepository: Repository<User>, jwtService: JwtService);
    login(loginDto: LoginDto): Promise<{
        token: string;
        userData: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: import("../common/enums/role.enum").Role;
            status: UserStatus.ACTIVE;
            businessId: number;
        };
    }>;
    getProfile(userId: number): Promise<{
        id: number;
        name: string;
        email: string;
        phone: string;
        profileImageUrl: string;
        role: import("../common/enums/role.enum").Role;
        status: UserStatus.ACTIVE;
        businessId: number;
        business: import("../business/entities/business.entity").Business;
    }>;
    updateProfile(userId: number, dto: UpdateProfileDto): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: import("../common/enums/role.enum").Role;
            status: UserStatus;
            profileImageUrl: string;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
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
