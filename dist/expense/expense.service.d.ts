import { Repository } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationQueryDto, PaginatedResult } from '../common/dto/pagination.dto';
export declare class ExpenseService {
    private expenseRepository;
    constructor(expenseRepository: Repository<Expense>);
    create(createExpenseDto: CreateExpenseDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Expense;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<PaginatedResult<Expense>>;
    findOne(id: number, currentUser: any): Promise<{
        success: boolean;
        data: Expense;
    }>;
    update(id: number, updateExpenseDto: UpdateExpenseDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: Expense;
    }>;
    remove(id: number, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
