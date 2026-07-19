import { Business } from '../../business/entities/business.entity';
export declare class Category {
    id: number;
    categoryName: string;
    shortNote: string;
    isActive: boolean;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
