import { Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Business } from '../../business/entities/business.entity';
declare const JwtStrategy_base: new (...args: [opt: import("passport-jwt").StrategyOptionsWithRequest] | [opt: import("passport-jwt").StrategyOptionsWithoutRequest]) => Strategy & {
    validate(...args: any[]): unknown;
};
export declare class JwtStrategy extends JwtStrategy_base {
    private configService;
    private userRepository;
    private businessRepository;
    constructor(configService: ConfigService, userRepository: Repository<User>, businessRepository: Repository<Business>);
    validate(payload: any): Promise<{
        id: number;
        email: string;
        name: string;
        role: import("../../common/enums/role.enum").Role;
        businessId: number;
        business: Business;
        permissions: string[];
    }>;
}
export {};
