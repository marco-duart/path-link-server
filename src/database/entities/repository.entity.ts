import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({
    type: 'integer',
    default: 10,
    name: 'required_level',
  })
  requiredLevel: number;
}
