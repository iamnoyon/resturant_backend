import { Role } from '../../common/enums/role.enum';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Business } from '../../business/entities/business.entity';
export declare class User {
    id: number;
    name: string;
    email: string;
    phone: string;
    password: string;
    role: Role;
    status: UserStatus;
    profileImageUrl: string;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
