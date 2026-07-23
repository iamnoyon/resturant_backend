import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { SubscriptionStatus } from '../../common/enums/subscription-status.enum';

@Entity('businesses')
export class Business {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  adminId: number;

  @Column()
  businessName: string;

  @Column({ nullable: true })
  businessLogo: string;

  @Column({ nullable: true })
  division: string;

  @Column({ nullable: true })
  district: string;

  @Column({ nullable: true })
  thana: string;

  @Column({ nullable: true })
  area: string;

  @Column({ type: 'enum', enum: SubscriptionStatus, default: SubscriptionStatus.INACTIVE })
  subscription: SubscriptionStatus;

  @Column({ type: 'date', nullable: true, name: 'sub_start_date' })
  subStartDate: Date | null;

  @Column({ type: 'date', nullable: true, name: 'sub_end_date' })
  subEndDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
