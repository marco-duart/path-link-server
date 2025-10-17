import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
} from 'typeorm';
import { AccessLevel } from './access-level.entity';

@Entity('accounts')
export class Account {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 150 })
  username: string;

  @Column({ type: 'text' })
  passwordEncrypted: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  url: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @ManyToOne(() => AccessLevel, (accessLevel) => accessLevel.accounts)
  accessLevel: AccessLevel;
}
