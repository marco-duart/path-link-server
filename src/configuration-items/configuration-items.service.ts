import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationItem } from '../database/entities/configuration-item.entity';
import { CreateConfigurationItemDto } from './dto/create-configuration-item.dto';
import { UpdateConfigurationItemDto } from './dto/update-configuration-item.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class ConfigurationItemsService {
  constructor(
    @InjectRepository(ConfigurationItem)
    private configItemsRepository: Repository<ConfigurationItem>,
  ) {}

  async create(
    createConfigItemDto: CreateConfigurationItemDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<ConfigurationItem> {
    const configItemData = withUserOwnership(
      { ...createConfigItemDto },
      userDepartmentId,
      userTeamId,
    );
    const configItem = this.configItemsRepository.create(configItemData);
    return this.configItemsRepository.save(configItem);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.configItemsRepository
      .createQueryBuilder('configItem')
      .where('configItem.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'configItem',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<ConfigurationItem[]> {
    return this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    ).getMany();
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<ConfigurationItem> {
    const configItem = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('configItem.id = :id', { id })
      .getOne();

    if (!configItem) {
      throw new NotFoundException(
        `Configuration Item com ID ${id} não encontrado.`,
      );
    }

    return configItem;
  }

  async update(
    id: string,
    updateConfigItemDto: UpdateConfigurationItemDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<ConfigurationItem> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      { ...updateConfigItemDto },
      userDepartmentId,
      userTeamId,
    );
    await this.configItemsRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.configItemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Configuration Item com ID ${id} não encontrado.`,
      );
    }
  }
}
