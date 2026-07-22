import { Injectable, OnModuleInit, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Permission } from './entities/permission.entity';
import { User } from '../users/entities/user.entity';
import { PERMISSIONS_LIST } from './permissions.constants';
import { Role } from '../common/enums/role.enum';

@Injectable()
export class PermissionsService implements OnModuleInit {
  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
    @InjectRepository(User)
    private userRepository: Repository<User>,
  ) {}

  async onModuleInit() {
    await this.seedPermissions();
  }

  async seedPermissions() {
    const count = await this.permissionRepository.count();
    if (count > 0) {
      console.log('[Permissions] Already seeded, skipping.');
      return;
    }

    console.log('[Permissions] Seeding permission list...');
    await this.permissionRepository.save(PERMISSIONS_LIST);
    console.log(`[Permissions] Seeded ${PERMISSIONS_LIST.length} permissions.`);
  }

  async findAll() {
    const permissions = await this.permissionRepository.find({
      order: { module: 'ASC', action: 'ASC' },
    });

    const data = permissions.map((p) => ({ value: p.name, name: p.description }));
    return { success: true, data };
  }

  async updateUserPermissions(
    targetUserId: number,
    permissionNames: string[],
    currentUser: any,
  ) {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
    });

    if (!targetUser) {
      return { success: false, message: 'User not found' };
    }

    this.validatePermissionAssignment(currentUser, targetUser);

    targetUser.permissions = permissionNames;
    targetUser.updatedBy = currentUser.id;
    await this.userRepository.save(targetUser);

    const resolvedPermissions = await this.permissionRepository.find({
      where: { name: In(permissionNames) },
      order: { id: 'ASC' },
    });

    const mappedPermissions = resolvedPermissions.map((p) => ({
      value: p.name,
      name: p.description,
    }));

    return {
      success: true,
      message: 'Permissions updated successfully',
      data: { id: targetUser.id, permissions: mappedPermissions },
    };
  }

  async getUserPermissions(targetUserId: number, currentUser: any) {
    const targetUser = await this.userRepository.findOne({
      where: { id: targetUserId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdBy: true,
        permissions: true,
      },
    });

    if (!targetUser) {
      return { success: false, message: 'User not found' };
    }

    this.validatePermissionView(currentUser, targetUser);

    const permissions = targetUser.permissions || [];
    const resolvedPermissions = await this.permissionRepository.find({
      where: { name: In(permissions) },
      order: { id: 'ASC' },
    });

    const mappedPermissions = resolvedPermissions.map((p) => ({
      value: p.name,
      name: p.description,
    }));

    return {
      success: true,
      data: {
        id: targetUser.id,
        name: targetUser.name,
        email: targetUser.email,
        role: targetUser.role,
        permissions: mappedPermissions,
      },
    };
  }

  private validatePermissionAssignment(currentUser: any, targetUser: User) {
    if (currentUser.id === targetUser.id) {
      throw new ForbiddenException('You cannot modify your own permissions');
    }

    if (targetUser.role === Role.SUPERADMIN) {
      throw new ForbiddenException('Cannot modify superadmin permissions');
    }

    if (currentUser.role === Role.SUPERADMIN) {
      return;
    }

    if (currentUser.role === Role.ADMIN) {
      if (targetUser.role !== Role.CASHIER && targetUser.role !== Role.WAITER) {
        throw new ForbiddenException(
          'You can only manage cashier and waiter permissions',
        );
      }
      if (targetUser.createdBy !== currentUser.id) {
        throw new ForbiddenException('Access denied');
      }
      return;
    }

    throw new ForbiddenException(
      'You are not authorized to manage permissions',
    );
  }

  private validatePermissionView(currentUser: any, targetUser: User) {
    if (currentUser.id === targetUser.id) {
      return;
    }

    if (currentUser.role === Role.SUPERADMIN) {
      return;
    }

    if (currentUser.role === Role.ADMIN) {
      if (targetUser.role !== Role.CASHIER && targetUser.role !== Role.WAITER) {
        throw new ForbiddenException(
          'You can only view cashier and waiter permissions',
        );
      }
      if (targetUser.createdBy !== currentUser.id) {
        throw new ForbiddenException('Access denied');
      }
      return;
    }

    throw new ForbiddenException('Access denied');
  }
}
