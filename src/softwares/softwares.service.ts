import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Software } from '../database/entities/software.entity';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class SoftwaresService {
  constructor(
    @InjectRepository(Software)
    private softwaresRepository: Repository<Software>,
  ) {}

  private mapSoftwareDtoToEntityData(
    dto: CreateSoftwareDto | UpdateSoftwareDto,
  ): Partial<Software> {
    const { departmentId, teamId, ...rest } = dto as CreateSoftwareDto &
      UpdateSoftwareDto;

    const entityData: Partial<Software> = { ...rest };

    if (departmentId !== undefined) {
      entityData.department = departmentId
        ? ({ id: departmentId } as any)
        : null;
    }

    if (teamId !== undefined) {
      entityData.team = teamId ? ({ id: teamId } as any) : null;
    }

    return entityData;
  }

  async create(
    createSoftwareDto: CreateSoftwareDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Software> {
    const softwareData = withUserOwnership(
      this.mapSoftwareDtoToEntityData(createSoftwareDto),
      userDepartmentId,
      userTeamId,
    );
    const software = this.softwaresRepository.create(softwareData);
    return this.softwaresRepository.save(software);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.softwaresRepository
      .createQueryBuilder('software')
      .leftJoinAndSelect('software.department', 'department')
      .leftJoinAndSelect('software.team', 'team')
      .where('software.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'software',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Software[]> {
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
  ): Promise<Software> {
    const software = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('software.id = :id', { id })
      .getOne();

    if (!software) {
      throw new NotFoundException(`Software com ID ${id} não encontrado.`);
    }

    return software;
  }

  async update(
    id: string,
    updateSoftwareDto: UpdateSoftwareDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Software> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      this.mapSoftwareDtoToEntityData(updateSoftwareDto),
      userDepartmentId,
      userTeamId,
    );

    await this.softwaresRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.softwaresRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Software com ID ${id} não encontrado.`);
    }
  }
}
