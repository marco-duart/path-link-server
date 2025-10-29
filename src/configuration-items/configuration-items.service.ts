import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConfigurationItem } from '../database/entities/configuration-item.entity';
import { CreateConfigurationItemDto } from './dto/create-configuration-item.dto';
import { UpdateConfigurationItemDto } from './dto/update-configuration-item.dto';

@Injectable()
export class ConfigurationItemsService {
  constructor(
    @InjectRepository(ConfigurationItem)
    private configItemsRepository: Repository<ConfigurationItem>,
  ) {}

  async create(createConfigItemDto: CreateConfigurationItemDto): Promise<ConfigurationItem> {
    const configItem = this.configItemsRepository.create(createConfigItemDto);
    return this.configItemsRepository.save(configItem);
  }

  async findAll(userLevel: number): Promise<ConfigurationItem[]> {
    return this.configItemsRepository.createQueryBuilder('configItem')
      .where('configItem.required_level <= :userLevel', { userLevel })
      .getMany();
  }

  async findOne(id: string): Promise<ConfigurationItem> {
    const configItem = await this.configItemsRepository.findOne({ where: { id } });

    if (!configItem) {
      throw new NotFoundException(`Configuration Item com ID ${id} não encontrado.`);
    }

    return configItem;
  }

  async update(id: string, updateConfigItemDto: UpdateConfigurationItemDto): Promise<ConfigurationItem> {
    const configItem = await this.configItemsRepository.findOne({ where: { id } });

    if (!configItem) {
      throw new NotFoundException(`Configuration Item com ID ${id} não encontrado.`);
    }

    await this.configItemsRepository.update(id, updateConfigItemDto);
    return this.configItemsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.configItemsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Configuration Item com ID ${id} não encontrado.`);
    }
  }
}