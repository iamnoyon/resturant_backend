import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { TokenStatus } from '../common/enums/token-status.enum';

@Injectable()
export class TokenService {
  constructor(
    @InjectRepository(Token)
    private tokenRepository: Repository<Token>,
  ) {}

  async createForOrder(
    manager: EntityManager,
    orderId: string,
    tableId: number,
    tableName: string,
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
        tableId,
        tableName,
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

  async findAll(currentUser: any) {
    const where: any = {};
    if (currentUser.businessId) {
      where.businessId = currentUser.businessId;
    }

    const tokens = await this.tokenRepository.find({
      where,
      order: { createdAt: 'DESC' },
    });

    const grouped = new Map<string, Token[]>();
    for (const token of tokens) {
      const key = token.orderId;
      const group = grouped.get(key);
      if (group) {
        group.push(token);
      } else {
        grouped.set(key, [token]);
      }
    }

    const data = [...grouped.entries()].map(([orderId, items]) => ({
      orderId,
      tableId: items[0]?.tableId ?? null,
      tableName: items[0]?.tableName ?? null,
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      tokens: items.map(({ tableId, tableName, ...token }) => token),
    }));

    return {
      success: true,
      message: 'Tokens retrieved successfully',
      data,
    };
  }

  async findByOrder(orderId: string, currentUser: any) {
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
