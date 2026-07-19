import { Business } from '../../business/entities/business.entity';
export declare class Expense {
    id: number;
    expenseName: string;
    expenseValue: number;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
