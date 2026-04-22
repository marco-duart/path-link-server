import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../database/entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import * as crypto from 'crypto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class AccountsService {
  private readonly algorithm = 'aes-256-cbc';
  private readonly encryptionKey: Buffer;
  private readonly iv: Buffer;

  constructor(
    @InjectRepository(Account)
    private accountsRepository: Repository<Account>,
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

  private mapAccountDtoToEntityData(
    dto: CreateAccountDto | UpdateAccountDto,
  ): Partial<Account> {
    const { twoFactorQrAssetId, ...rest } = dto as CreateAccountDto &
      UpdateAccountDto;

    const entityData: Partial<Account> = { ...rest };

    if (twoFactorQrAssetId !== undefined) {
      entityData.twoFactorQrAsset = twoFactorQrAssetId
        ? ({ id: twoFactorQrAssetId } as any)
        : null;
    }

    return entityData;
  }

  async create(
    createAccountDto: CreateAccountDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Account> {
    const accountData = withUserOwnership(
      this.mapAccountDtoToEntityData(createAccountDto),
      userDepartmentId,
      userTeamId,
    );

    if (accountData.passwordEncrypted) {
      accountData.passwordEncrypted = this.encrypt(
        accountData.passwordEncrypted,
      );
    }

    const account = this.accountsRepository.create(accountData);
    return this.accountsRepository.save(account);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.accountsRepository
      .createQueryBuilder('account')
      .where('account.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('account.twoFactorQrAsset', 'twoFactorQrAsset');

    return applyResourceScope(
      query,
      'account',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Account[]> {
    const accounts = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();

    return accounts.map((a) => {
      if (a.passwordEncrypted) {
        a.passwordEncrypted = this.decrypt(a.passwordEncrypted);
      }
      return a;
    });
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Account> {
    const account = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('account.id = :id', { id })
      .getOne();

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }

    if (account.passwordEncrypted) {
      account.passwordEncrypted = this.decrypt(account.passwordEncrypted);
    }

    return account;
  }

  async update(
    id: string,
    updateAccountDto: UpdateAccountDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Account> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      this.mapAccountDtoToEntityData(updateAccountDto),
      userDepartmentId,
      userTeamId,
    );

    if (updateData.passwordEncrypted) {
      updateData.passwordEncrypted = this.encrypt(updateData.passwordEncrypted);
    }

    await this.accountsRepository.update(id, updateData);
    const updated = await this.findOne(
      id,
      userLevel,
      userDepartmentId,
      userTeamId,
    );

    if (updated.passwordEncrypted) {
      updated.passwordEncrypted = this.decrypt(updated.passwordEncrypted);
    }

    return updated;
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.accountsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }
  }
}
