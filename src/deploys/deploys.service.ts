import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Deploy } from '../database/entities/deploy.entity';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import { getLevelByName } from '../enums/role.enum';

@Injectable()
export class DeploysService {
  constructor(
    @InjectRepository(Deploy)
    private deploysRepository: Repository<Deploy>,
  ) {}

  async create(createDeployDto: CreateDeployDto): Promise<Deploy> {
    const deploy = this.deploysRepository.create(createDeployDto);
    return this.deploysRepository.save(deploy);
  }

  async findAll(
    userLevel: number,
    userRoleName: string,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Deploy[]> {
    const isAdmin = getLevelByName('Admin') === userLevel;

    const query = this.deploysRepository
      .createQueryBuilder('deploy')
      .leftJoinAndSelect('deploy.credentials', 'credentials')
      .leftJoinAndSelect('deploy.department', 'department')
      .leftJoinAndSelect('deploy.team', 'team')
      .where('deploy.required_level <= :userLevel', { userLevel });

    if (!isAdmin && userDepartmentId && userTeamId) {
      query.andWhere(
        '(deploy.department_id = :deptId AND deploy.team_id = :teamId)',
        { deptId: userDepartmentId, teamId: userTeamId },
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Deploy> {
    const deploy = await this.deploysRepository.findOne({
      where: { id },
      relations: ['credentials', 'department', 'team'],
    });

    if (!deploy) {
      throw new NotFoundException(`Deploy com ID ${id} não encontrado.`);
    }

    return deploy;
  }

  async update(id: string, updateDeployDto: UpdateDeployDto): Promise<Deploy> {
    await this.findOne(id);
    await this.deploysRepository.update(id, updateDeployDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const deploy = await this.findOne(id);
    await this.deploysRepository.remove(deploy);
  }

  async findByType(type: string): Promise<Deploy[]> {
    return this.deploysRepository.find({
      where: { type },
      relations: ['credentials', 'department', 'team'],
    });
  }

  async findByEnvironment(environment: string): Promise<Deploy[]> {
    return this.deploysRepository.find({
      where: { environment },
      relations: ['credentials', 'department', 'team'],
    });
  }
}
