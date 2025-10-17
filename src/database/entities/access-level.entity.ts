import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Account } from './account.entity';
import { User } from './user.entity';
import { Process } from './process.entity';


@Entity('access_levels')
export class AccessLevel {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @OneToMany(() => Account, (account) => account.accessLevel)
  accounts: Account[];

  @OneToMany(() => User, (user) => user.accessLevel)
  users: User[];

  @OneToMany(() => Process, (process) => process.accessLevel)
  processes: Process[];
}
