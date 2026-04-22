import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from '../database/entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UsersService } from '../users/users.service';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class ProcessesService {
  constructor(
    @InjectRepository(Process)
    private processesRepository: Repository<Process>,
    private usersService: UsersService,
  ) {}

  async create(
    createProcessDto: CreateProcessDto,
    createdById: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Process> {
    const userReference = this.usersService.getUserReference(createdById);

    const processData = withUserOwnership(
      {
        ...createProcessDto,
        createdBy: userReference,
      },
      userDepartmentId,
      userTeamId,
    );

    const process = this.processesRepository.create(processData);

    return this.processesRepository.save(process);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.processesRepository
      .createQueryBuilder('process')
      .where('process.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('process.createdBy', 'createdBy')
      .leftJoinAndSelect('process.steps', 'steps');

    return applyResourceScope(
      query,
      'process',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Process[]> {
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
  ): Promise<Process> {
    const process = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('process.id = :id', { id })
      .getOne();

    if (!process) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }

    return process;
  }

  async findOneInternal(id: string): Promise<Process> {
    const process = await this.processesRepository.findOne({ where: { id } });

    if (!process) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }

    return process;
  }

  getProcessReference(id: string): Process {
    return this.processesRepository.create({ id });
  }

  async update(
    id: string,
    updateProcessDto: UpdateProcessDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Process> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      { ...updateProcessDto },
      userDepartmentId,
      userTeamId,
    );
    await this.processesRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.processesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }
  }
}
