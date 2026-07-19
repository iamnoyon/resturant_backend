import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class TableController {
    private readonly tableService;
    constructor(tableService: TableService);
    create(createTableDto: CreateTableDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/table.entity").Table;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/table.entity").Table>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/table.entity").Table;
    }>;
    update(id: string, updateTableDto: UpdateTableDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/table.entity").Table;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
