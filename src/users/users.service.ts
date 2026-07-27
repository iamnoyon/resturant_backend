import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import {
  PaginationQueryDto,
  PaginatedResult,
} from '../common/dto/pagination.dto';
import { Role } from '../common/enums/role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto, currentUser: any) {
    if (createUserDto.role === Role.SUPERADMIN) {
      throw new BadRequestException('Cannot create superadmin');
    }
    if (currentUser.role === Role.SUPERADMIN) {
      if (createUserDto.role !== Role.ADMIN) {
        throw new ForbiddenException(
          'Superadmin can only create admin accounts',
        );
      }
    } else if (currentUser.role === Role.ADMIN) {
      if (
        createUserDto.role !== Role.CASHIER &&
        createUserDto.role !== Role.WAITER
      ) {
        throw new ForbiddenException(
          'Admin can only create cashier and waiter accounts',
        );
      }
    } else {
      throw new ForbiddenException('You are not authorized to create users');
    }

    const existingUser = await this.userRepository.findOne({
      where: { email: createUserDto.email },
    });
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      name: createUserDto.name,
      email: createUserDto.email,
      phone: createUserDto.phone || null,
      profileImageUrl: createUserDto.profileImageUrl || null,
      password: hashedPassword,
      role: createUserDto.role as Role,
      businessId: createUserDto.businessId || currentUser.businessId,
      createdBy: currentUser.id,
      status: UserStatus.ACTIVE,
    } as unknown as User);

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return {
      success: true,
      message: 'User created successfully',
      data: result,
    };
  }

  async findAll(
    query: PaginationQueryDto,
    currentUser: any,
  ): Promise<PaginatedResult<User>> {
    const page = Math.max(+(query.page || 1), 1);
    const limit = Math.min(Math.max(+(query.limit || 10), 1), 100);
    const skip = (page - 1) * limit;
    const sortOrder = query.sortOrder === 'ASC' ? 'ASC' : 'DESC';
    const sortBy = query.sortBy || 'createdAt';

    const where: any = {};

    if (currentUser.role === Role.ADMIN) {
      where.createdBy = currentUser.id;
    } else if (currentUser.role === Role.CASHIER) {
      where.id = currentUser.id;
    } else if (currentUser.role === Role.WAITER) {
      where.id = currentUser.id;
    }

    if (query.search) {
      where.name = ILike(`%${query.search}%`);
    }

    const [data, total] = await this.userRepository.findAndCount({
      where,
      skip,
      take: limit,
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImageUrl: true,
        role: true,
        status: true,
        businessId: true,
        createdAt: true,
      },
      relations: { business: true },
      order: { [sortBy]: sortOrder },
    });

    return {
      success: true,
      data,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getWaiters(currentUser: any) {
    const waiters = await this.userRepository.find({
      where: {
        businessId: currentUser.businessId,
        role: Role.WAITER,
        status: UserStatus.ACTIVE,
      },
      select: { id: true, name: true, profileImageUrl: true },
      order: { name: 'ASC' },
    });
    return { success: true, data: waiters };
  }

  async findOne(id: number, currentUser: any) {
    const user = await this.userRepository.findOne({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        profileImageUrl: true,
        role: true,
        status: true,
        businessId: true,
        createdBy: true,
        createdAt: true,
      },
    });
    if (!user) throw new NotFoundException('User not found');
    if (currentUser.role === Role.ADMIN) {
      if (user.createdBy !== currentUser.id)
        throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.CASHIER) {
      if (user.businessId !== currentUser.businessId)
        throw new ForbiddenException('Access denied');
      if (user.id !== currentUser.id)
        throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.WAITER) {
      if (user.id !== currentUser.id)
        throw new ForbiddenException('Access denied');
    }
    return { success: true, data: user };
  }

  async update(id: number, updateUserDto: UpdateUserDto, currentUser: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (currentUser.role === Role.ADMIN) {
      if (user.createdBy !== currentUser.id)
        throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.CASHIER) {
      if (user.businessId !== currentUser.businessId)
        throw new ForbiddenException('Access denied');
      if (user.id !== currentUser.id)
        throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.WAITER) {
      if (user.id !== currentUser.id)
        throw new ForbiddenException('Access denied');
    }
    delete (updateUserDto as any).role;
    delete (updateUserDto as any).password;
    user.updatedBy = currentUser.id;
    if ((updateUserDto as any).name !== undefined)
      user.name = (updateUserDto as any).name;
    if ((updateUserDto as any).email !== undefined)
      user.email = (updateUserDto as any).email;
    if ((updateUserDto as any).phone !== undefined)
      user.phone = (updateUserDto as any).phone;
    if ((updateUserDto as any).profileImageUrl !== undefined)
      user.profileImageUrl = (updateUserDto as any).profileImageUrl;
    if ((updateUserDto as any).status !== undefined)
      user.status = (updateUserDto as any).status;
    if ((updateUserDto as any).businessId !== undefined)
      user.businessId = (updateUserDto as any).businessId;
    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return {
      success: true,
      message: 'User updated successfully',
      data: result,
    };
  }

  async remove(id: number, currentUser: any) {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) throw new NotFoundException('User not found');
    if (user.role === Role.SUPERADMIN)
      throw new BadRequestException('Cannot delete superadmin');
    if (currentUser.role === Role.ADMIN) {
      if (user.createdBy !== currentUser.id)
        throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.CASHIER) {
      throw new ForbiddenException('Access denied');
    } else if (currentUser.role === Role.WAITER) {
      throw new ForbiddenException('Access denied');
    }
    await this.userRepository.softRemove(user);
    return { success: true, message: 'User removed successfully' };
  }
}
