import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { AccessLevel } from './access-level.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255 })
  techStack: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @ManyToOne(() => AccessLevel)
  accessLevel: AccessLevel;
}
