import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Department } from './department.entity';
import { Team } from './team.entity';
import { AccessLevel } from './access-level.entity';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  username: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @ManyToOne(() => Department, (department) => department.users, {
    onDelete: 'SET NULL',
  })
  department: Department;

  @ManyToOne(() => Team, (team) => team.users, { onDelete: 'SET NULL' })
  team: Team;

  @ManyToOne(() => AccessLevel, (accessLevel) => accessLevel.users, {
    onDelete: 'SET NULL',
  })
  accessLevel: AccessLevel;
}
