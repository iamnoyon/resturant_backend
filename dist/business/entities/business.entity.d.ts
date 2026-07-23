import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';
export declare class Business {
    id: number;
    adminId: number;
    businessName: string;
    businessLogo: string;
    division: string;
    district: string;
    thana: string;
    area: string;
    subscription: SubscriptionStatus;
    subStartDate: Date | null;
    subEndDate: Date | null;
    createdAt: Date;
    updatedAt: Date;
}
