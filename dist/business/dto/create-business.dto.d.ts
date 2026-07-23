import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
export declare class CreateBusinessDto {
    businessName: string;
    businessLogo?: string;
    division?: string;
    district?: string;
    thana?: string;
    area?: string;
    subscription?: SubscriptionStatus;
    subStartDate?: string;
    subEndDate?: string;
}
