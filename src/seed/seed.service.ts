import { Injectable, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { Permission } from '../permissions/entities/permission.entity';
import { Role } from '../common/enums/role.enum';
import { UserStatus } from '../common/enums/user-status.enum';
import { PERMISSIONS_LIST } from '../permissions/permissions.constants';

@Injectable()
export class SeedService implements OnModuleInit {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  async seed() {
    await this.seedPermissions();
    await this.seedUsers();
  }

  private async seedPermissions() {
    const count = await this.permissionRepository.count();
    if (count > 0) {
      console.log('[Seed] Permissions already exist, skipping.');
      return;
    }

    console.log('[Seed] Seeding permission list...');
    await this.permissionRepository.save(PERMISSIONS_LIST);
    console.log(`[Seed] Seeded ${PERMISSIONS_LIST.length} permissions.`);
  }

  private async seedUsers() {
    const userCount = await this.userRepository.count();
    if (userCount > 0) {
      console.log('[Seed] Users already exist, skipping user seed.');
      return;
    }

    console.log('[Seed] No users found. Seeding superadmin...');

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
    console.log('[Seed] Seeding completed.');
  }
}
