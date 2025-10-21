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
import { AccessLevel } from './access-level.entity';
import { BadRequestException } from '@nestjs/common';

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

  @ManyToOne(() => Department, (department) => department.users, {
    onDelete: 'SET NULL',
  })
  department: Department;

  @ManyToOne(() => Team, (team) => team.users, { onDelete: 'SET NULL' })
  team: Team;

  @ManyToOne(() => AccessLevel, (accessLevel) => accessLevel.users, {
    nullable: false,
  })
  accessLevel: AccessLevel;

  @BeforeInsert()
  normalizeEmail() {
    this.email = this.email.toLowerCase();
  }

  // @BeforeInsert()
  // async setDefaultAccessLevel() {
  //   if (!this.accessLevel) {
  //     const defaultAccessLevel = await AccessLevel.getDefault();
  //     this.accessLevel = defaultAccessLevel;
  //   }
  // }

  @BeforeInsert()
  async hashPassword() {
    try {
      this.password_digest = await bcrypt.hash(this.password_digest, 10);
    } catch (error) {
      throw new BadRequestException('Error hashing password');
    }
  }
}
