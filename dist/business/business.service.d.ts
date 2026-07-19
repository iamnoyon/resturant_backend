import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class BusinessService {
    private businessRepository;
    constructor(businessRepository: Repository<Business>);
    create(createBusinessDto: CreateBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Business;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Business>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Business;
    }>;
    update(id: number, updateBusinessDto: UpdateBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Business;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
