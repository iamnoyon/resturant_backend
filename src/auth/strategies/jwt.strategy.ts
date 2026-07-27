import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Request } from 'express';
import { User } from '../../users/entities/user.entity';
import { UserStatus } from '../../common/enums/user-status.enum';
import { Business } from '../../business/entities/business.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request?.cookies?.access_token || null,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('JWT_SECRET', 'default_secret'),
    });
  }

  async validate(payload: any) {
    const user = await this.userRepository.findOne({
      where: { id: payload.sub },
      relations: { business: true },
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('User is inactive');
    }

    let businessId = user.businessId;
    if (!businessId) {
      const business = await this.businessRepository.findOne({
        where: { adminId: user.id },
      });
      if (business) {
        businessId = business.id;
        await this.userRepository.update(user.id, { businessId: business.id });
      }
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      businessId,
      business: user.business,
      permissions: user.permissions || [],
    };
  }
}
