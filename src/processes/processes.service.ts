import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from '../database/entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UsersService } from '../users/users.service';
import { getLevelByName } from '../enums/role.enum';

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
  ): Promise<Process> {
    const userReference = this.usersService.getUserReference(createdById);

    const process = this.processesRepository.create({
      ...createProcessDto,
      createdBy: userReference,
    });

    return this.processesRepository.save(process);
  }

  async findAll(
    userLevel: number,
    roleName: string,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Process[]> {
    const isAdmin = getLevelByName('Admin') === userLevel;

    const query = this.processesRepository
      .createQueryBuilder('process')
      .where('process.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('process.createdBy', 'createdBy');

    if (!isAdmin && userDepartmentId && userTeamId) {
      query.andWhere(
        '(process.department_id = :deptId AND process.team_id = :teamId)',
        { deptId: userDepartmentId, teamId: userTeamId },
      );
    }

    return query.getMany();
  }

  async findOne(id: string): Promise<Process> {
    const process = await this.processesRepository.findOne({
      where: { id },
      relations: ['createdBy', 'steps'],
    });

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
  ): Promise<Process> {
    const process = await this.processesRepository.findOne({ where: { id } });

    if (!process) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }

    await this.processesRepository.update(id, updateProcessDto);
    return this.processesRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: string): Promise<void> {
    const result = await this.processesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Processo com ID ${id} não encontrado.`);
    }
  }
}
