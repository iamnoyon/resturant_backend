import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Role } from '../common/enums/role.enum';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: Role;
            status: import("../common/enums/user-status.enum").UserStatus;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/user.entity").User>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/user.entity").User;
    }>;
    update(id: string, updateUserDto: UpdateUserDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: Role;
            status: import("../common/enums/user-status.enum").UserStatus;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
    toggleStatus(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: {
            id: number;
            name: string;
            email: string;
            phone: string;
            role: Role;
            status: import("../common/enums/user-status.enum").UserStatus;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
}
