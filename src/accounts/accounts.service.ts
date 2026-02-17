import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Account } from '../database/entities/account.entity';
import { CreateAccountDto } from './dto/create-account.dto';
import { UpdateAccountDto } from './dto/update-account.dto';
import * as crypto from 'crypto';
import { getLevelByName } from '../enums/role.enum';

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

  async create(createAccountDto: CreateAccountDto): Promise<Account> {
    const accountData = { ...createAccountDto };

    if (accountData.passwordEncrypted) {
      accountData.passwordEncrypted = this.encrypt(
        accountData.passwordEncrypted,
      );
    }

    const account = this.accountsRepository.create(accountData);
    return this.accountsRepository.save(account);
  }

  async findAll(
    userLevel: number,
    roleName: string,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Account[]> {
    const isAdmin = getLevelByName('Admin') === userLevel;

    const query = this.accountsRepository
      .createQueryBuilder('account')
      .where('account.required_level <= :userLevel', { userLevel });

    if (!isAdmin && userDepartmentId && userTeamId) {
      query.andWhere(
        '(account.department_id = :deptId AND account.team_id = :teamId)',
        { deptId: userDepartmentId, teamId: userTeamId },
      );
    }

    const accounts = await query.getMany();

    return accounts.map((a) => {
      if (a.passwordEncrypted) {
        a.passwordEncrypted = this.decrypt(a.passwordEncrypted);
      }
      return a;
    });
  }

  async findOne(id: string): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } });

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
  ): Promise<Account> {
    const account = await this.accountsRepository.findOne({ where: { id } });

    if (!account) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }

    const updateData = { ...updateAccountDto };

    if (updateData.passwordEncrypted) {
      updateData.passwordEncrypted = this.encrypt(updateData.passwordEncrypted);
    }

    await this.accountsRepository.update(id, updateData);
    const updated = await this.accountsRepository.findOneOrFail({
      where: { id },
    });

    if (updated.passwordEncrypted) {
      updated.passwordEncrypted = this.decrypt(updated.passwordEncrypted);
    }

    return updated;
  }

  async remove(id: string): Promise<void> {
    const result = await this.accountsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Account with ID ${id} not found.`);
    }
  }
}
