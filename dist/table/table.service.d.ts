import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class TableService {
    private tableRepository;
    constructor(tableRepository: Repository<Table>);
    create(createTableDto: CreateTableDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Table;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Table>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Table;
    }>;
    update(id: number, updateTableDto: UpdateTableDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Table;
    }>;
    dropdown(currentUser: any): Promise<{
        success: boolean;
        data: Table[];
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
