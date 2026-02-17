import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from '../database/entities/database.entity';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import * as crypto from 'crypto';
import { getLevelByName } from '../enums/role.enum';

@Injectable()
export class DatabasesService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor(
    @InjectRepository(Database)
    private databasesRepository: Repository<Database>,
  ) {
    const key = process.env.ENCRYPTION_KEY;
    this.encryptionKey = crypto
      .createHash('sha256')
      .update(String(key))
      .digest();
    this.iv = crypto.randomBytes(16);
  }

  private encrypt(text: string): string {
    if (!text) return text;
    const cipher = crypto.createCipheriv(
      this.algorithm,
      this.encryptionKey,
      this.iv,
    );
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    return `${this.iv.toString('hex')}:${encrypted}`;
  }

  private decrypt(text: string): string {
    if (!text) return text;
    try {
      const parts = text.split(':');
      if (parts.length !== 2) return text;
      const iv = Buffer.from(parts[0], 'hex');
      const encryptedText = parts[1];
      const decipher = crypto.createDecipheriv(
        this.algorithm,
        this.encryptionKey,
        iv,
      );
      let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
      decrypted += decipher.final('utf8');
      return decrypted;
    } catch (e) {
      console.error('Decryption failed:', e);
      return '[Decryption Error]';
    }
  }

  async create(createDatabaseDto: CreateDatabaseDto): Promise<Database> {
    const dataToSave = { ...createDatabaseDto };

    dataToSave.credentialsEncrypted = this.encrypt(
      dataToSave.credentialsEncrypted,
    );

    const database = this.databasesRepository.create({
      ...dataToSave,
      credentialsEncrypted: dataToSave.credentialsEncrypted,
    });

    return this.databasesRepository.save(database);
  }

  async findAll(
    userLevel: number,
    roleName: string,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Database[]> {
    const isAdmin = getLevelByName('Admin') === userLevel;

    const query = this.databasesRepository
      .createQueryBuilder('db')
      .where('db.requiredLevel <= :userLevel', { userLevel });

    if (!isAdmin && userDepartmentId && userTeamId) {
      query.andWhere(
        '(db.department_id = :deptId AND db.team_id = :teamId)',
        { deptId: userDepartmentId, teamId: userTeamId },
      );
    }

    const databases = await query.getMany();

    return databases.map((db) => {
      db.credentialsEncrypted = this.decrypt(db.credentialsEncrypted);
      return db;
    });
  }

  async findOne(id: string): Promise<Database> {
    const database = await this.databasesRepository.findOne({ where: { id } });

    if (!database) {
      throw new NotFoundException(`Database com ID ${id} não encontrada.`);
    }

    database.credentialsEncrypted = this.decrypt(database.credentialsEncrypted);

    return database;
  }

  async update(
    id: string,
    updateDatabaseDto: UpdateDatabaseDto,
  ): Promise<Database> {
    const database = await this.databasesRepository.findOne({ where: { id } });

    if (!database) {
      throw new NotFoundException(`Database com ID ${id} não encontrada.`);
    }

    const updateData = { ...updateDatabaseDto };

    if (updateData.credentialsEncrypted) {
      updateData.credentialsEncrypted = this.encrypt(
        updateData.credentialsEncrypted,
      );
    }

    await this.databasesRepository.update(id, updateData);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.databasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Database com ID ${id} não encontrada.`);
    }
  }
}
