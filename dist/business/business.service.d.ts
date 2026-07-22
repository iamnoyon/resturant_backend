import { Repository } from 'typeorm';
import { Business } from './entities/business.entity';
import { UpsertBusinessDto } from './dto/upsert-business.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class BusinessService {
    private businessRepository;
    constructor(businessRepository: Repository<Business>);
    upsert(upsertBusinessDto: UpsertBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Business;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Business>>;
    findByAdminId(adminId: number): Promise<{
        success: boolean;
        data: Business;
    }>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Business;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
