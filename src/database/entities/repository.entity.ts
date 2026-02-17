import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { Department } from './department.entity';
import { Team } from './team.entity';

@Entity('repositories')
export class Repository {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 255, name: 'tech_stack' })
  techStack: string;

  @Column({ type: 'text', nullable: true })
  description: string;

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
