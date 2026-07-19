import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private tableRepository: Repository<Table>,
  ) {}

  async create(createTableDto: CreateTableDto, currentUser: any) {
    const table = this.tableRepository.create({
      ...createTableDto,
      businessId: currentUser.businessId,
      createdBy: currentUser.id,
    });
    const saved = await this.tableRepository.save(table);
    return { success: true, message: 'Table created', data: saved };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<Table>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (
      currentUser.role === Role.SUPERADMIN ||
      currentUser.role === Role.ADMIN
    ) {
      where.createdBy = currentUser.id;
    } else if (currentUser.role === Role.CASHIER) {
      where.businessId = currentUser.businessId;
    }
    if (query.search) {
      where.tableName = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.tableRepository.findAndCount({
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
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      table.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      table.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: table };
  }

  async update(id: number, updateTableDto: UpdateTableDto, currentUser: any) {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      table.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      table.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(table, updateTableDto, { updatedBy: currentUser.id });
    const saved = await this.tableRepository.save(table);
    return { success: true, message: 'Table updated', data: saved };
  }

  async dropdown(currentUser: any) {
    const where: any = { isActive: true };
    if (
      currentUser.role === Role.SUPERADMIN ||
      currentUser.role === Role.ADMIN
    ) {
      where.createdBy = currentUser.id;
    } else if (currentUser.role === Role.CASHIER) {
      where.businessId = currentUser.businessId;
    }

    const data = await this.tableRepository.find({
      where,
      select: { id: true, tableName: true, totalSeat: true },
      order: { tableName: 'ASC' },
    });

    return { success: true, data };
  }

  async remove(id: number, currentUser: any) {
    const table = await this.tableRepository.findOne({ where: { id } });
    if (!table) throw new NotFoundException('Table not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      table.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      table.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    await this.tableRepository.remove(table);
    return { success: true, message: 'Table removed' };
  }
}
