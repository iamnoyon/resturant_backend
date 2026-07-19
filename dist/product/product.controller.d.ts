import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class ProductController {
    private readonly productService;
    constructor(productService: ProductService);
    create(createProductDto: CreateProductDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/product.entity").Product;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/product.entity").Product>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/product.entity").Product;
    }>;
    update(id: string, updateProductDto: UpdateProductDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/product.entity").Product;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
