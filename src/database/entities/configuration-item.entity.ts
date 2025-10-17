import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { AccessLevel } from './access-level.entity';

@Entity('configuration_items')
export class ConfigurationItem {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'text' })
  details: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => AccessLevel)
  accessLevel: AccessLevel;
}
