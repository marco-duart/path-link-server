import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EnvironmentVariable } from '../database/entities/environment-variable.entity';
import { CreateEnvironmentVariableDto } from './dto/create-environment-variable.dto';
import { UpdateEnvironmentVariableDto } from './dto/update-environment-variable.dto';
import * as crypto from 'crypto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class EnvironmentVariablesService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor(
    @InjectRepository(EnvironmentVariable)
    private envVarRepository: Repository<EnvironmentVariable>,
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
    createEnvVarDto: CreateEnvironmentVariableDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<EnvironmentVariable> {
    const dataToSave = { ...createEnvVarDto };

    const encryptedValue = this.encrypt(dataToSave.value);

    const envVarData = withUserOwnership(
      {
      ...dataToSave,
      valueEncrypted: encryptedValue,
      },
      userDepartmentId,
      userTeamId,
    );

    const envVar = this.envVarRepository.create(envVarData);

    return this.envVarRepository.save(envVar);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.envVarRepository
      .createQueryBuilder('envVar')
      .where('envVar.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'envVar',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<EnvironmentVariable[]> {
    const envVars = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();

    return envVars.map((envVar) => {
      envVar.valueEncrypted = this.decrypt(envVar.valueEncrypted);
      return envVar;
    });
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<EnvironmentVariable> {
    const envVar = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('envVar.id = :id', { id })
      .getOne();

    if (!envVar) {
      throw new NotFoundException(
        `Environment Variable com ID ${id} não encontrada.`,
      );
    }

    envVar.valueEncrypted = this.decrypt(envVar.valueEncrypted);

    return envVar;
  }

  async update(
    id: string,
    updateEnvVarDto: UpdateEnvironmentVariableDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<EnvironmentVariable> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);

    const updateData = {};

    if (updateEnvVarDto.value) {
      (updateData as any).valueEncrypted = this.encrypt(updateEnvVarDto.value);
      delete updateEnvVarDto.value;
    }

    Object.assign(updateData, updateEnvVarDto);

    const scopedUpdateData = withUserOwnership(
      updateData as Record<string, any>,
      userDepartmentId,
      userTeamId,
    );

    await this.envVarRepository.update(id, scopedUpdateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.envVarRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Environment Variable com ID ${id} não encontrada.`,
      );
    }
  }
}
