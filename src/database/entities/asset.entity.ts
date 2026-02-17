import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { StepAsset } from './step-asset.entity';
import { User } from './user.entity';
import { Department } from './department.entity';
import { Team } from './team.entity';

@Entity('assets')
export class Asset {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  filename: string;

  @Column({ type: 'varchar', length: 500 })
  url: string;

  @Column({ type: 'varchar', length: 100, name: 'mime_type' })
  mimeType: string;

  @OneToMany(() => StepAsset, (stepAsset) => stepAsset.asset)
  stepAssets: StepAsset[];

  @ManyToOne(() => User)
  @JoinColumn({ name: 'uploaded_by_id' })
  uploadedBy: User;

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
