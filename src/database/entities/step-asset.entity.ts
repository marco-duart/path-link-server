import { Entity, PrimaryGeneratedColumn, Column, ManyToOne } from 'typeorm';
import { Step } from './step.entity';
import { Asset } from './asset.entity';

@Entity('step_asset')
export class StepAsset {
  @PrimaryGeneratedColumn()
  id: number;

  @ManyToOne(() => Step, (step) => step.stepAssets, { onDelete: 'CASCADE' })
  step: Step;

  @ManyToOne(() => Asset, (asset) => asset.stepAssets, { onDelete: 'CASCADE' })
  asset: Asset;

  @Column({ type: 'varchar', length: 255, nullable: true })
  caption: string | null;
}
