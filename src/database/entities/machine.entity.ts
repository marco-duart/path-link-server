import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Department } from './department.entity';
import { Team } from './team.entity';

@Entity('machines')
export class Machine {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100, unique: true, name: 'asset_tag' })
  assetTag: string;

  @Column({ type: 'varchar', length: 50, default: 'other', name: 'device_type' })
  deviceType: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  assignee: string;

  @Column({ type: 'varchar', length: 45, nullable: true })
  ip: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  cpu: string;

  @Column({ type: 'integer', nullable: true, name: 'ram_gb' })
  ramGb: number;

  @Column({ type: 'varchar', length: 30, nullable: true, name: 'storage_type' })
  storageType: string;

  @Column({ type: 'integer', nullable: true, name: 'storage_gb' })
  storageGb: number;

  @Column({ type: 'varchar', length: 255, nullable: true, name: 'monitor_info' })
  monitorInfo: string;

  @Column({ type: 'varchar', length: 150, nullable: true })
  room: string;

  @Column({ type: 'varchar', length: 30, default: 'available' })
  status: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => Department, { nullable: true })
  @JoinColumn({ name: 'department_id' })
  department: Department;

  @ManyToOne(() => Team, { nullable: true })
  @JoinColumn({ name: 'team_id' })
  team: Team;

  @Column({
    type: 'integer',
    default: 10,
    name: 'required_level',
  })
  requiredLevel: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
