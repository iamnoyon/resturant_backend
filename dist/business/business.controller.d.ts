import { BusinessService } from './business.service';
import { CreateBusinessDto } from './dto/create-business.dto';
import { UpdateBusinessDto } from './dto/update-business.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class BusinessController {
    private readonly businessService;
    constructor(businessService: BusinessService);
    create(createBusinessDto: CreateBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/business.entity").Business;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/business.entity").Business>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/business.entity").Business;
    }>;
    update(id: string, updateBusinessDto: UpdateBusinessDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/business.entity").Business;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
