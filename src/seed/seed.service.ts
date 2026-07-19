import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
import { Role } from '../common/enums/role.enum';
import { UserStatus } from '../common/enums/user-status.enum';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Business)
    private businessRepository: Repository<Business>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('[Seed] Users already exist, skipping seed.');
      return;
    }

    console.log('[Seed] No users found. Seeding superadmin and admin...');

    const superadminPassword = await bcrypt.hash(
      this.configService.get<string>('SUPERADMIN_PASSWORD', 'Super@123'),
      10,
    );

    const superadmin = this.userRepository.create({
      name: this.configService.get<string>('SUPERADMIN_NAME', 'Super Admin'),
      email: this.configService.get<string>(
        'SUPERADMIN_EMAIL',
        'superadmin@restaurant.com',
      ),
      phone: this.configService.get<string>('SUPERADMIN_PHONE', '01700000000'),
      password: superadminPassword,
      role: Role.SUPERADMIN,
      status: UserStatus.ACTIVE,
    } as unknown as User);

    const savedSuperadmin = await this.userRepository.save(superadmin);
    console.log(`[Seed] Superadmin created: ${savedSuperadmin.email}`);

    const adminPassword = await bcrypt.hash(
      this.configService.get<string>('ADMIN_PASSWORD', 'Admin@123'),
      10,
    );

    const admin = this.userRepository.create({
      name: this.configService.get<string>('ADMIN_NAME', 'Admin'),
      email: this.configService.get<string>(
        'ADMIN_EMAIL',
        'admin@restaurant.com',
      ),
      phone: this.configService.get<string>('ADMIN_PHONE', '01700000001'),
      password: adminPassword,
      role: Role.ADMIN,
      status: UserStatus.ACTIVE,
      createdBy: savedSuperadmin.id,
    } as unknown as User);

    const savedAdmin = await this.userRepository.save(admin);

    const business = this.businessRepository.create({
      businessName: 'Default Restaurant',
      area: 'Main Area',
      adminId: savedAdmin.id,
    } as unknown as Business);

    const savedBusiness = await this.businessRepository.save(business);

    savedAdmin.businessId = savedBusiness.id;
    await this.userRepository.save(savedAdmin);

    console.log(`[Seed] Admin created: ${savedAdmin.email}`);
    console.log('[Seed] Seeding completed.');
  }
}
