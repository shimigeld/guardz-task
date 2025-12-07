import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

@Entity('incident')
@Index(['severity'])
@Index(['status'])
@Index(['account'])
@Index(['source'])
@Index(['timestamp'])
export class Incident {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 50 })
  severity!: string; // Critical, High, Med, Low

  @Column({ type: 'varchar' })
  title!: string;

  @Column({ type: 'varchar' })
  account!: string; // Account / Tenant

  @Column({ type: 'varchar' })
  source!: string; // EDR, Email, Identity, etc.

  @Column({ type: 'datetime', default: () => 'CURRENT_TIMESTAMP' })
  timestamp!: Date;

  @Column({ type: 'varchar', length: 50, default: 'Open' })
  status!: string; // Open, Investigating, Resolved

  @Column({ type: 'text', default: '[]' })
  tags!: string; // JSON array stored as string

  @Column({ type: 'varchar', nullable: true })
  owner?: string; // Assigned owner

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
