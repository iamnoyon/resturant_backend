import { BusinessService } from './business.service';
import { UpsertBusinessDto } from './dto/upsert-business.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    upsert(upsertBusinessDto: UpsertBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/business.entity").Business;
    }>;
    getMyBusiness(currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/business.entity").Business>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
