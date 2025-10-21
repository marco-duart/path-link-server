import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  BeforeInsert,
} from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from './department.entity';
import { Team } from './team.entity';
import { BadRequestException } from '@nestjs/common';
import {
  getLevelByName,
  getNameByLevel,
  RoleHierarchy,
} from '../../enums/role.enum';

@Entity('user')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 100, unique: true })
  name: string;

  @Column({ type: 'varchar', length: 255 })
  password_digest: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({
    type: 'integer',
    default: RoleHierarchy.Auxiliar,
    name: 'role_level',
  })
  private roleLevel: number;

  public get roleName(): string {
    return getNameByLevel(this.roleLevel);
  }

  public set roleName(roleName: string) {
    this.roleLevel = getLevelByName(roleName);
  }

  @ManyToOne(() => Department, (department) => department.users, {
    onDelete: 'SET NULL',
  })
  department: Department;

  @ManyToOne(() => Team, (team) => team.users, { onDelete: 'SET NULL' })
  team: Team;

  @BeforeInsert()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
  }

  @BeforeInsert()
  async hashPassword() {
    try {
      if (this.password_digest) {
        this.password_digest = await bcrypt.hash(this.password_digest, 10);
      }
    } catch (error) {
      throw new BadRequestException('Error hashing password');
    }
  }
}
