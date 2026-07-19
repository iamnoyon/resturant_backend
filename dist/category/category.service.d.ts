import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class CategoryService {
    private categoryRepository;
    constructor(categoryRepository: Repository<Category>);
    create(createCategoryDto: CreateCategoryDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Category;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Category>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Category;
    }>;
    update(id: number, updateCategoryDto: UpdateCategoryDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Category;
    }>;
    dropdown(currentUser: any): Promise<{
        success: boolean;
        data: Category[];
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
