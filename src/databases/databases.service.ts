import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Database } from '../database/entities/database.entity';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import * as crypto from 'crypto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

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

  async create(
    createDatabaseDto: CreateDatabaseDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Database> {
    const dataToSave = { ...createDatabaseDto };

    dataToSave.credentialsEncrypted = this.encrypt(
      dataToSave.credentialsEncrypted,
    );

    const databaseData = withUserOwnership(
      {
      ...dataToSave,
      credentialsEncrypted: dataToSave.credentialsEncrypted,
      },
      userDepartmentId,
      userTeamId,
    );

    const database = this.databasesRepository.create(databaseData);

    return this.databasesRepository.save(database);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.databasesRepository
      .createQueryBuilder('db')
      .where('db.requiredLevel <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'db',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Database[]> {
    const databases = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();

    return databases.map((db) => {
      db.credentialsEncrypted = this.decrypt(db.credentialsEncrypted);
      return db;
    });
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Database> {
    const database = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('db.id = :id', { id })
      .getOne();

    if (!database) {
      throw new NotFoundException(`Database com ID ${id} não encontrada.`);
    }

    database.credentialsEncrypted = this.decrypt(database.credentialsEncrypted);

    return database;
  }

  async update(
    id: string,
    updateDatabaseDto: UpdateDatabaseDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Database> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = { ...updateDatabaseDto };

    if (updateData.credentialsEncrypted) {
      updateData.credentialsEncrypted = this.encrypt(
        updateData.credentialsEncrypted,
      );
    }

    const scopedUpdateData = withUserOwnership(
      updateData,
      userDepartmentId,
      userTeamId,
    );

    await this.databasesRepository.update(id, scopedUpdateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.databasesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Database com ID ${id} não encontrada.`);
    }
  }
}
