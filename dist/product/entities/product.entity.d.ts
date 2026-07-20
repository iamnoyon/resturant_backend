import { Business } from '../../business/entities/business.entity';
import { Category } from '../../category/entities/category.entity';
export declare class Product {
    id: number;
    productName: string;
    categoryId: number;
    category: Category;
    description: string;
    imageUrl: string;
    costPrice: number;
    soldPrice: number;
    stock: number;
    isActive: boolean;
    businessId: number;
    business: Business;
    createdBy: number;
    updatedBy: number;
    createdAt: Date;
    updatedAt: Date;
}
