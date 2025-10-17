import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Step } from './step.entity';
import { User } from './user.entity';
import { AccessLevel } from './access-level.entity';

@Entity('processes')
export class Process {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 100 })
  category: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @OneToMany(() => Step, (step) => step.process)
  steps: Step[];

  @ManyToOne(() => User)
  createdBy: User;

  @ManyToOne(() => AccessLevel)
  accessLevel: AccessLevel;
}
