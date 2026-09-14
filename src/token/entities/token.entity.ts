import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { TokenStatus } from '../../common/enums/token-status.enum';

@Entity('tokens')
@Index('idx_tokens_order', ['orderId'])
@Index('idx_tokens_business_status', ['businessId', 'status'])
export class Token {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  orderId: string;

  @Column({ nullable: true })
  tableId: number;

  @Column({ nullable: true })
  tableName: string;

  @Column({ nullable: true })
  productId: number;

  @Column({ nullable: true })
  productName: string;

  @Column({ type: 'int', default: 1 })
  quantity: number;

  @Column({ type: 'enum', enum: TokenStatus, default: TokenStatus.COOKING })
  status: TokenStatus;

  @Column({ nullable: true })
  businessId: number;

  @Column({ nullable: true })
  createdBy: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
