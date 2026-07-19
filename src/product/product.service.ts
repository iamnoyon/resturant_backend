import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Product } from './entities/product.entity';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class ProductService {
  constructor(
    @InjectRepository(Product)
    private productRepository: Repository<Product>,
  ) {}

  async create(createProductDto: CreateProductDto, currentUser: any) {
    const product = this.productRepository.create({
      ...createProductDto,
      businessId: currentUser.businessId,
      createdBy: currentUser.id,
    });
    const saved = await this.productRepository.save(product);
    return { success: true, message: 'Product created', data: saved };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<Product>> {
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
      where.productName = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.productRepository.findAndCount({
      where,
      skip,
      take: limit,
      relations: { category: true },
      order: { [sortBy]: sortOrder },
    });

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findOne(id: number, currentUser: any) {
    const product = await this.productRepository.findOne({
      where: { id },
      relations: { category: true },
    });
    if (!product) throw new NotFoundException('Product not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      product.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      product.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    return { success: true, data: product };
  }

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    currentUser: any,
  ) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      product.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      product.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    Object.assign(product, updateProductDto, { updatedBy: currentUser.id });
    const saved = await this.productRepository.save(product);
    return { success: true, message: 'Product updated', data: saved };
  }

  async remove(id: number, currentUser: any) {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) throw new NotFoundException('Product not found');
    if (
      (currentUser.role === Role.SUPERADMIN ||
        currentUser.role === Role.ADMIN) &&
      product.createdBy !== currentUser.id
    ) {
      throw new ForbiddenException('Access denied');
    }
    if (
      currentUser.role === Role.CASHIER &&
      product.businessId !== currentUser.businessId
    ) {
      throw new ForbiddenException('Access denied');
    }
    await this.productRepository.remove(product);
    return { success: true, message: 'Product removed' };
  }
}
