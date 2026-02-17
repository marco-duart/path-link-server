import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { Team } from './team.entity';

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
}
