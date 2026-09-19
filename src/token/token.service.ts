import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';
import { Token } from './entities/token.entity';
import { TokenStatus } from '../common/enums/token-status.enum';
import { Role } from '../common/enums/role.enum';

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

  async syncForOrder(
    manager: EntityManager,
    orderId: string,
    tableId: number,
    tableName: string,
    newItems: { productId: number; quantity: number }[],
    productMap: Map<number, { productName?: string }>,
    businessId: number,
    userId: number,
  ): Promise<void> {
    const existingTokens = await manager.find(Token, {
      where: { orderId },
    });

    const existingByProduct = new Map<number, Token>();
    for (const t of existingTokens) {
      const pid = Number(t.productId);
      if (pid && !existingByProduct.has(pid)) {
        existingByProduct.set(pid, t);
      }
    }

    for (const item of newItems) {
      const productId = Number(item?.productId);
      const newQty = Number(item?.quantity);
      if (!productId || newQty < 1) continue;

      const existing = existingByProduct.get(productId);

      if (existing && existing.status === TokenStatus.COOKING) {
        existing.quantity = newQty;
        existing.tableId = tableId;
        existing.tableName = tableName;
        await manager.save(existing);
        existingByProduct.delete(productId);
        continue;
      }

      if (
        existing &&
        (existing.status === TokenStatus.READY ||
          existing.status === TokenStatus.SERVED)
      ) {
        const oldQty = Number(existing.quantity || 0);
        if (newQty > oldQty) {
          const delta = newQty - oldQty;
          const deltaToken = manager.create(Token, {
            orderId,
            tableId,
            tableName,
            productId,
            productName: productMap.get(productId)?.productName ?? undefined,
            quantity: delta,
            status: TokenStatus.COOKING,
            businessId,
            createdBy: userId,
          });
          await manager.save(deltaToken);
        }
        existingByProduct.delete(productId);
        continue;
      }

      if (!existing) {
        const token = manager.create(Token, {
          orderId,
          tableId,
          tableName,
          productId,
          productName: productMap.get(productId)?.productName ?? undefined,
          quantity: newQty,
          status: TokenStatus.COOKING,
          businessId,
          createdBy: userId,
        });
        await manager.save(token);
        existingByProduct.delete(productId);
      }
    }

    for (const [, token] of existingByProduct) {
      if (token.status === TokenStatus.COOKING) {
        await manager.remove(token);
      }
    }
  }

  async markAllServedForOrder(
    manager: EntityManager,
    orderId: string,
  ): Promise<void> {
    const tokens = await manager.find(Token, { where: { orderId } });
    for (const token of tokens) {
      if (token.status !== TokenStatus.SERVED) {
        token.status = TokenStatus.SERVED;
        await manager.save(token);
      }
    }
  }

  async findAll(currentUser: any) {
    const empty = {
      success: true,
      message: 'Tokens retrieved successfully',
      data: [],
    };

    if (!currentUser?.businessId) {
      return empty;
    }

    const where: any = { businessId: currentUser.businessId };
    if (currentUser.role === Role.WAITER) {
      where.createdBy = currentUser.id;
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

    const TWELVE_HOURS_MS = 12 * 60 * 60 * 1000;
    const cutoff = Date.now() - TWELVE_HOURS_MS;

    const visible = [...grouped.entries()]
      .filter(([, items]) => {
        const allServed = items.every((i) => i.status === TokenStatus.SERVED);
        if (!allServed) return true;
        const allOlderThan12h = items.every(
          (i) => i.createdAt && i.createdAt.getTime() < cutoff,
        );
        return !allOlderThan12h;
      })
      .sort(([, a], [, b]) => {
        const aMax = Math.max(
          ...a.map((i) => (i.createdAt ? i.createdAt.getTime() : 0)),
        );
        const bMax = Math.max(
          ...b.map((i) => (i.createdAt ? i.createdAt.getTime() : 0)),
        );
        return bMax - aMax;
      });

    const data = visible.map(([orderId, items]) => ({
      orderId,
      tableId: items[0]?.tableId ?? null,
      tableName: items[0]?.tableName ?? null,
      totalItems: items.length,
      totalQuantity: items.reduce((sum, item) => sum + (item.quantity || 0), 0),
      tokens: items.map((item) => ({
        id: item.id,
        orderId: item.orderId,
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        status: item.status,
        businessId: item.businessId,
        createdBy: item.createdBy,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      })),
    }));

    return {
      success: true,
      message: 'Tokens retrieved successfully',
      data,
    };
  }

  async updateStatus(id: number, status: TokenStatus, currentUser: any) {
    const where: any = { id };
    if (currentUser.businessId) {
      where.businessId = currentUser.businessId;
    }

    const token = await this.tokenRepository.findOne({ where });
    if (!token) throw new NotFoundException('Token not found');

    if (token.status === status) {
      throw new BadRequestException(`Token is already "${status}"`);
    }

    if (currentUser.role === Role.CHEF) {
      if (
        token.status !== TokenStatus.COOKING ||
        status !== TokenStatus.READY
      ) {
        throw new ForbiddenException(
          'Chef can only move a cooking token to ready',
        );
      }
    } else if (currentUser.role === Role.WAITER) {
      if (token.status !== TokenStatus.READY || status !== TokenStatus.SERVED) {
        throw new ForbiddenException(
          'Waiter can only move a ready token to served',
        );
      }
    } else if (
      currentUser.role !== Role.ADMIN &&
      currentUser.role !== Role.SUPERADMIN
    ) {
      throw new ForbiddenException('Access denied');
    }

    token.status = status;
    const saved = await this.tokenRepository.save(token);

    return {
      success: true,
      message: 'Token status updated successfully',
      data: saved,
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
