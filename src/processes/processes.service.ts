import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Process } from '../database/entities/process.entity';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { UsersService } from '../users/users.service';

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

  async findAll(userLevel: number): Promise<Process[]> {
    return this.processesRepository
      .createQueryBuilder('process')
      .where('process.required_level <= :userLevel', { userLevel })
      .leftJoinAndSelect('process.createdBy', 'createdBy')
      .getMany();
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
