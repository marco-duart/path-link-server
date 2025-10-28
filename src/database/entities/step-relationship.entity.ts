import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Step } from './step.entity';

@Entity('step_relationship')
export class StepRelationship {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Step, (step) => step.stepRelationships, {
    onDelete: 'CASCADE',
  })
  step: Step;

  @Column({ type: 'varchar', length: 100, name: 'related_model' })
  relatedModel: string;

  @Column({ type: 'uuid', name: 'related_id' })
  relatedId: string;
}
