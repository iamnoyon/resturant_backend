import { CategoryService } from './category.service';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class CategoryController {
    private readonly categoryService;
    constructor(categoryService: CategoryService);
    create(createCategoryDto: CreateCategoryDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/category.entity").Category;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/category.entity").Category>>;
    dropdown(currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/category.entity").Category[];
    }>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/category.entity").Category;
    }>;
    update(id: string, updateCategoryDto: UpdateCategoryDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/category.entity").Category;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
