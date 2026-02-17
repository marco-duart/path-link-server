import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Repository as RepositoryEntity } from '../database/entities/repository.entity';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { getLevelByName } from '../enums/role.enum';

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

  async findAll(
    userLevel: number,
    roleName: string,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<RepositoryEntity[]> {
    const isAdmin = getLevelByName('Admin') === userLevel;

    const query = this.repositoriesRepository
      .createQueryBuilder('repo')
      .where('repo.required_level <= :userLevel', { userLevel });

    if (!isAdmin && userDepartmentId && userTeamId) {
      query.andWhere(
        '(repo.department_id = :deptId AND repo.team_id = :teamId)',
        { deptId: userDepartmentId, teamId: userTeamId },
      );
    }

    return query.getMany();
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
