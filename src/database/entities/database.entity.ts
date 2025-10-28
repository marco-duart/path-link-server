import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('databases')
export class Database {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 100 })
  type: string;

  @Column({ type: 'varchar', length: 255 })
  host: string;

  @Column({ type: 'int' })
  port: number;

  @Column({ type: 'varchar', length: 255, name: 'credentials_encrypted' })
  credentialsEncrypted: string;

  @Column({ type: 'text', nullable: true })
  notes: string;

  @Column({
    type: 'integer',
    default: 10,
    name: 'required_level',
  })
  requiredLevel: number;
}
