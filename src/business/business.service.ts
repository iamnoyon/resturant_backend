import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Business } from './entities/business.entity';
import { UpsertBusinessDto } from './dto/upsert-business.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class BusinessService {
  constructor(
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {}

  async upsert(upsertBusinessDto: UpsertBusinessDto, currentUser: any) {
    const existing = await this.businessRepository.findOne({
      where: { adminId: currentUser.id },
    });

    if (existing) {
      Object.assign(existing, upsertBusinessDto);
      const saved = await this.businessRepository.save(existing);
      return { success: true, message: 'Business updated', data: saved };
    }

    const business = this.businessRepository.create({
      ...upsertBusinessDto,
      adminId: currentUser.id,
    });
    const saved = await this.businessRepository.save(business);
    return { success: true, message: 'Business created', data: saved };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<Business>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (
      currentUser.role === Role.ADMIN
    ) {
      where.adminId = currentUser.id;
    }
    if (query.search) {
      where.businessName = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.businessRepository.findAndCount({
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

  async findByAdminId(adminId: number) {
    const business = await this.businessRepository.findOne({
      where: { adminId },
    });
    if (!business) throw new NotFoundException('Business not found');
    return { success: true, data: business };
  }

  async findOne(id: number, currentUser: any) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.adminId !== currentUser.id) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: business };
  }

  async remove(id: number, currentUser: any) {
    const business = await this.businessRepository.findOne({ where: { id } });
    if (!business) throw new NotFoundException('Business not found');
    if (business.adminId !== currentUser.id)
      throw new ForbiddenException('Access denied');
    await this.businessRepository.remove(business);
    return { success: true, message: 'Business removed' };
  }
}
