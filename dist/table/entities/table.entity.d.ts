import { Business } from '../../business/entities/business.entity';
export declare class Table {
    id: number;
    tableName: string;
    totalSeat: number;
    isActive: boolean;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
