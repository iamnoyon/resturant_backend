import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { QueryTokenDto } from './dto/query-token.dto';
import { TokenStatus } from '../common/enums/token-status.enum';
import { Role } from '../common/enums/role.enum';
import { PaginatedResult } from '../common/dto/pagination.dto';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async createForOrder(
    manager: EntityManager,
    orderId: number,
    items: { productId: number; quantity: number }[],
    productMap: Map<number, { productName?: string }>,
    businessId: number,
    userId: number,
  ): Promise<Token[]> {
    if (!items || items.length === 0) {
      return [];
    }

    const tokens = items.map((item) =>
      manager.create(Token, {
        orderId,
        productId: item.productId,
        productName: productMap.get(item.productId)?.productName ?? undefined,
        quantity: item.quantity,
        status: TokenStatus.COOKING,
        businessId,
        createdBy: userId,
      }),
    );

    return manager.save(tokens);
  }

  async findAll(
    query: QueryTokenDto,
    currentUser: any,
  ): Promise<PaginatedResult<any>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};
    if (
      currentUser.role === Role.ADMIN ||
      currentUser.role === Role.CASHIER ||
      currentUser.role === Role.WAITER
    ) {
      where.businessId = currentUser.businessId;
    }
    if (query.orderId) {
      where.orderId = Number(query.orderId);
    }
    if (query.status) {
      where.status = query.status;
    }

    const [data, total] = await this.tokenRepository.findAndCount({
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

  async findByOrder(orderId: number, currentUser: any) {
    const where: any = { orderId };
    if (currentUser.businessId) {
      where.businessId = currentUser.businessId;
    }
    const tokens = await this.tokenRepository.find({
      where,
      order: { createdAt: 'ASC' },
    });
    return { success: true, data: tokens };
  }
}
