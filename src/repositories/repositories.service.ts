import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repository as RepositoryEntity } from '../database/entities/repository.entity';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class RepositoriesService {
  constructor(
    @InjectRepository(RepositoryEntity)
    private repositoriesRepository: Repository<RepositoryEntity>,
  ) {}

  async create(
    createRepositoryDto: CreateRepositoryDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<RepositoryEntity> {
    const repositoryData = withUserOwnership(
      { ...createRepositoryDto },
      userDepartmentId,
      userTeamId,
    );
    const repository = this.repositoriesRepository.create(repositoryData);
    return this.repositoriesRepository.save(repository);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.repositoriesRepository
      .createQueryBuilder('repo')
      .where('repo.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'repo',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<RepositoryEntity[]> {
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
  ): Promise<RepositoryEntity> {
    const repository = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('repo.id = :id', { id })
      .getOne();

    if (!repository) {
      throw new NotFoundException(`Repository com ID ${id} não encontrado.`);
    }

    return repository;
  }

  async update(
    id: string,
    updateRepositoryDto: UpdateRepositoryDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<RepositoryEntity> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      { ...updateRepositoryDto },
      userDepartmentId,
      userTeamId,
    );
    await this.repositoriesRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.repositoriesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Repository com ID ${id} não encontrado.`);
    }
  }
}
