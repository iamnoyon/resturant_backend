import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Package } from './entities/package.entity';
import { CreatePackageDto } from './dto/create-package.dto';
import { UpdatePackageDto } from './dto/update-package.dto';

@Injectable()
export class PackageService {
  constructor(
    @InjectRepository(Package)
    private packageRepository: Repository<Package>,
  ) {}

  async create(dto: CreatePackageDto) {
    const pkg = this.packageRepository.create(dto);
    const saved = await this.packageRepository.save(pkg);
    return { success: true, message: 'Package created', data: saved };
  }

  async findAll() {
    const data = await this.packageRepository.find({
      order: { createdAt: 'DESC' },
    });
    return { success: true, data };
  }

  async findOne(id: number) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    return { success: true, data: pkg };
  }

  async update(id: number, dto: UpdatePackageDto) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    Object.assign(pkg, dto);
    const saved = await this.packageRepository.save(pkg);
    return { success: true, message: 'Package updated', data: saved };
  }

  async remove(id: number) {
    const pkg = await this.packageRepository.findOne({ where: { id } });
    if (!pkg) throw new NotFoundException('Package not found');
    await this.packageRepository.remove(pkg);
    return { success: true, message: 'Package removed' };
  }
}
