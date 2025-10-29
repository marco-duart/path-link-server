import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repository as RepositoryEntity } from '../database/entities/repository.entity';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectRepository(RepositoryEntity)
    private repositoriesRepository: Repository<RepositoryEntity>,
  ) {}

  async create(
    createRepositoryDto: CreateRepositoryDto,
  ): Promise<RepositoryEntity> {
    const repository = this.repositoriesRepository.create(createRepositoryDto);
    return this.repositoriesRepository.save(repository);
  }

  async findAll(userLevel: number): Promise<RepositoryEntity[]> {
    return this.repositoriesRepository
      .createQueryBuilder('repo')
      .where('repo.required_level <= :userLevel', { userLevel })
      .getMany();
  }

  async findOne(id: string): Promise<RepositoryEntity> {
    const repository = await this.repositoriesRepository.findOne({
      where: { id },
    });

    if (!repository) {
      throw new NotFoundException(`Repository com ID ${id} não encontrado.`);
    }

    return repository;
  }

  async update(
    id: string,
    updateRepositoryDto: UpdateRepositoryDto,
  ): Promise<RepositoryEntity> {
    const repository = await this.repositoriesRepository.findOne({
      where: { id },
    });

    if (!repository) {
      throw new NotFoundException(`Repository com ID ${id} não encontrado.`);
    }

    await this.repositoriesRepository.update(id, updateRepositoryDto);
    return this.repositoriesRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.repositoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Repository com ID ${id} não encontrado.`);
    }
  }
}
