import { ExpenseService } from './expense.service';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import { PaginationQueryDto } from '../common/dto/pagination.dto';
export declare class ExpenseController {
    private readonly expenseService;
    constructor(expenseService: ExpenseService);
    create(createExpenseDto: CreateExpenseDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/expense.entity").Expense;
    }>;
    findAll(query: PaginationQueryDto, currentUser: any): Promise<import("../common/dto/pagination.dto").PaginatedResult<import("./entities/expense.entity").Expense>>;
    findOne(id: string, currentUser: any): Promise<{
        success: boolean;
        data: import("./entities/expense.entity").Expense;
    }>;
    update(id: string, updateExpenseDto: UpdateExpenseDto, currentUser: any): Promise<{
        success: boolean;
        message: string;
        data: import("./entities/expense.entity").Expense;
    }>;
    remove(id: string, currentUser: any): Promise<{
        success: boolean;
        message: string;
    }>;
}
