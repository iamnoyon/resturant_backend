import type { Response } from 'express';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UpdatePasswordDto } from './dto/update-password.dto';
export declare class AuthController {
    private readonly authService;
    constructor(authService: AuthService);
    login(loginDto: LoginDto, response: Response): Promise<{
        success: boolean;
        message: string;
        data: {
            user: {
                id: number;
                name: string;
                email: string;
                phone: string;
                role: import("../common/enums/role.enum").Role;
                status: import("../common/enums/user-status.enum").UserStatus.ACTIVE;
                businessId: number;
            };
        };
    }>;
    getProfile(currentUser: any): Promise<{
        success: boolean;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            profileImageUrl: string;
            role: import("../common/enums/role.enum").Role;
            status: import("../common/enums/user-status.enum").UserStatus.ACTIVE;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
        };
    }>;
    updateProfile(dto: UpdateProfileDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: import("../common/enums/role.enum").Role;
            status: import("../common/enums/user-status.enum").UserStatus;
            profileImageUrl: string;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    updatePassword(dto: UpdatePasswordDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    logout(response: Response): Promise<{
        success: boolean;
        message: string;
    }>;
}
