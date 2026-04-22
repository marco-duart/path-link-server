import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deploy } from '../database/entities/deploy.entity';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class DeploysService {
  constructor(
    @InjectRepository(Deploy)
    private deploysRepository: Repository<Deploy>,
  ) {}

  private mapDeployDtoToEntityData(
    dto: CreateDeployDto | UpdateDeployDto,
  ): Partial<Deploy> {
    const { credentialsId, ...rest } = dto as CreateDeployDto & UpdateDeployDto;

    const entityData: Partial<Deploy> = { ...rest };

    if (credentialsId !== undefined) {
      entityData.credentials = credentialsId
        ? ({ id: credentialsId } as any)
        : null;
    }

    return entityData;
  }

  async create(
    createDeployDto: CreateDeployDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy> {
    const deployData = withUserOwnership(
      this.mapDeployDtoToEntityData(createDeployDto),
      userDepartmentId,
      userTeamId,
    );
    const deploy = this.deploysRepository.create(deployData);
    return this.deploysRepository.save(deploy);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.deploysRepository
      .createQueryBuilder('deploy')
      .leftJoinAndSelect('deploy.credentials', 'credentials')
      .leftJoinAndSelect('deploy.department', 'department')
      .leftJoinAndSelect('deploy.team', 'team')
      .where('deploy.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'deploy',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy[]> {
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
  ): Promise<Deploy> {
    const deploy = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('deploy.id = :id', { id })
      .getOne();

    if (!deploy) {
      throw new NotFoundException(`Deploy com ID ${id} não encontrado.`);
    }

    return deploy;
  }

  async update(
    id: string,
    updateDeployDto: UpdateDeployDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      this.mapDeployDtoToEntityData(updateDeployDto),
      userDepartmentId,
      userTeamId,
    );
    await this.deploysRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    const deploy = await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    await this.deploysRepository.remove(deploy);
  }

  async findByType(
    type: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy[]> {
    return this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('deploy.type = :type', { type })
      .getMany();
  }

  async findByEnvironment(
    environment: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy[]> {
    return this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('deploy.environment = :environment', { environment })
      .getMany();
  }
}
