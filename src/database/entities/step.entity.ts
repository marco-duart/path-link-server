import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Process } from './process.entity';
import { StepAsset } from './step-asset.entity';
import { StepRelationship } from './step-relationship.entity';

@Entity('step')
export class Step {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Process, (process) => process.steps, { onDelete: 'CASCADE' })
  process: Process;

  @Column({ type: 'int', name: 'step_number' })
  stepNumber: number;

  @Column({ type: 'varchar', length: 255 })
  title: string;

  @Column({ type: 'text' })
  instructions: string;

  @Column({ type: 'text', nullable: true, name: 'expected_result' })
  expectedResult: string | null;

  @Column({ type: 'text', nullable: true })
  notes: string | null;

  @Column({ type: 'boolean', default: false, name: 'is_optional' })
  isOptional: boolean;

  @OneToMany(() => StepAsset, (stepAsset) => stepAsset.step)
  stepAssets: StepAsset[];

  @OneToMany(
    () => StepRelationship,
    (stepRelationship) => stepRelationship.step,
  )
  stepRelationships: StepRelationship[];
}
