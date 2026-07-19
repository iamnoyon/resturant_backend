import { OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Business } from '../business/entities/business.entity';
export declare class SeedService implements OnModuleInit {
    private userRepository;
    private businessRepository;
    private configService;
    constructor(userRepository: Repository<User>, businessRepository: Repository<Business>, configService: ConfigService);
    onModuleInit(): Promise<void>;
    seed(): Promise<void>;
}
