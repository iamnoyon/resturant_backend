import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

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

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
