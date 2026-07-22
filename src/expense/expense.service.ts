import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Expense } from './entities/expense.entity';
import { CreateExpenseDto } from './dto/create-expense.dto';
import { UpdateExpenseDto } from './dto/update-expense.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ExpenseService {
  constructor(
    @InjectRepository(Expense)
    private expenseRepository: Repository<Expense>,
  ) {}

  async create(createExpenseDto: CreateExpenseDto, currentUser: any) {
    const expense = this.expenseRepository.create({
      ...createExpenseDto,
      businessId: currentUser.businessId,
      createdBy: currentUser.id,
    });
    const saved = await this.expenseRepository.save(expense);
    return { success: true, message: 'Expense created', data: saved };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<Expense>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (
      currentUser.role === Role.ADMIN
    ) {
      where.createdBy = currentUser.id;
    } else if (currentUser.role === Role.CASHIER) {
      where.businessId = currentUser.businessId;
    }
    if (query.search) {
      where.expenseName = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.expenseRepository.findAndCount({
      where,
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
    });

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, currentUser: any) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      expense.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      expense.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: expense };
  }

  async update(
    id: number,
    updateExpenseDto: UpdateExpenseDto,
    currentUser: any,
  ) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      expense.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      expense.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(expense, updateExpenseDto, { updatedBy: currentUser.id });
    const saved = await this.expenseRepository.save(expense);
    return { success: true, message: 'Expense updated', data: saved };
  }

  async remove(id: number, currentUser: any) {
    const expense = await this.expenseRepository.findOne({ where: { id } });
    if (!expense) throw new NotFoundException('Expense not found');
    if (
      (currentUser.role === Role.ADMIN) &&
      expense.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      expense.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    await this.expenseRepository.remove(expense);
    return { success: true, message: 'Expense removed' };
  }
}
