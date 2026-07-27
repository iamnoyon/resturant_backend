import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Business } from '../business/entities/business.entity';
import { LoginDto } from './dto/login.dto';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { UserStatus } from '../common/enums/user-status.enum';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private jwtService: JwtService,
  ) {}

  async login(loginDto: LoginDto) {
    const user = await this.userRepository.findOne({
      where: { email: loginDto.email },
      relations: { business: true },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException(
        'Your account is not active. Please contact admin.',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      loginDto.password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const payload = { sub: user.id, email: user.email, role: user.role };
    const token = this.jwtService.sign(payload);

    let business: Business | null = user.business;
    if (!business) {
      business = await this.businessRepository.findOne({
        where: { adminId: user.id },
      });
    }

    const userData = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      role: user.role,
      status: user.status,
      businessId: user.businessId,
      business,
    };

    return { token, userData };
  }

  async getProfile(userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: { business: true },
    });

    if (!user || user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Invalid token');
    }

    let business: Business | null = user.business;
    if (!business) {
      business = await this.businessRepository.findOne({
        where: { adminId: userId },
      });
    }

    const result: any = {
      id: user.id,
      name: user.name,
      email: user.email,
      phone: user.phone,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
      status: user.status,
      businessId: user.businessId,
      business,
      permissions: [],
    };

    if (user.role === Role.SUPERADMIN) {
      const allPermissions = await this.permissionRepository.find({
        order: { id: 'ASC' },
      });
      result.permissions = allPermissions.map((p) => ({
        value: p.name,
        name: p.description,
      }));
    } else {
      const permissionNames = user.permissions || [];
      if (permissionNames.length > 0) {
        const perms = await this.permissionRepository.find({
          where: { name: In(permissionNames) },
          order: { id: 'ASC' },
        });
        result.permissions = perms.map((p) => ({
          value: p.name,
          name: p.description,
        }));
      }
    }

    return result;
  }

  async updateProfile(userId: number, dto: UpdateProfileDto) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    if (dto.email && dto.email !== user.email) {
      const existing = await this.userRepository.findOne({
        where: { email: dto.email },
      });
      if (existing) throw new ConflictException('Email already exists');
    }

    if (dto.name !== undefined) user.name = dto.name;
    if (dto.email !== undefined) user.email = dto.email;
    if (dto.profileImageUrl !== undefined)
      user.profileImageUrl = dto.profileImageUrl;

    const saved = await this.userRepository.save(user);
    const { password, ...result } = saved;
    return { success: true, message: 'Profile updated', data: result };
  }

  async updatePassword(
    userId: number,
    oldPassword: string,
    newPassword: string,
  ) {
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');

    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) throw new BadRequestException('Old password is incorrect');

    user.password = await bcrypt.hash(newPassword, 10);
    await this.userRepository.save(user);
    return { success: true, message: 'Password updated successfully' };
  }
}
