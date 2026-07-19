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
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Product>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Product;
    }>;
    update(id: number, updateProductDto: UpdateProductDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Product;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
