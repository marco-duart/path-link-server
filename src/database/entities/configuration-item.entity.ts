import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

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

  @Column({
    type: 'integer',
    default: 10,
    name: 'required_level',
  })
  requiredLevel: number;
}
