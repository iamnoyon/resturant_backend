import { Repository } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class ProductService {
    private productRepository;
    constructor(productRepository: Repository<Product>);
    create(createProductDto: CreateProductDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Product;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<any>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: {
            categoryId: number;
            categoryName: string;
            id: number;
            productName: string;
            description: string;
            imageUrl: string;
            costPrice: number;
            soldPrice: number;
            stock: number;
            isActive: boolean;
            businessId: number;
            business: import("../business/entities/business.entity").Business;
            createdBy: number;
            updatedBy: number;
            createdAt: Date;
            updatedAt: Date;
        };
    }>;
    update(id: number, updateProductDto: UpdateProductDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Product;
    }>;
    dropdown(currentUser: any): Promise<{
        success: boolean;
        data: Product[];
    }>;
    findByCategory(categoryId: number, currentUser: any): Promise<{
        success: boolean;
        data: Product[];
    }>;
    updateStock(id: number, stock: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Product;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
