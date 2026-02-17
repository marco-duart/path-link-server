import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Step } from '../database/entities/step.entity';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { ProcessesService } from '../processes/processes.service';
import { RoleHierarchy } from '../enums/role.enum';
import { Process } from 'src/database/entities/process.entity';

@Injectable()
export class StepsService {
  constructor(
    @InjectRepository(Step)
    private stepsRepository: Repository<Step>,
    private processesService: ProcessesService,
  ) {}

  getStepReference(id: number): Step {
    return this.stepsRepository.create({ id });
  }

  async checkProcessEditPermission(
    processId: string,
    userLevel: number,
  ): Promise<Process> {
    const process = await this.processesService.findOne(processId);
    const requiredEditLevel = RoleHierarchy.Analista;

    if (userLevel < requiredEditLevel || userLevel < process.requiredLevel) {
      throw new NotFoundException(
        `Processo com ID ${processId} não encontrado ou permissão insuficiente.`,
      );
    }
    return process;
  }

  async create(createStepDto: CreateStepDto, userLevel: number): Promise<Step> {
    const processReference = await this.checkProcessEditPermission(
      createStepDto.processId,
      userLevel,
    );

    const step = this.stepsRepository.create({
      ...createStepDto,
      process: processReference,
    });

    return this.stepsRepository.save(step);
  }

  async findByProcessId(processId: string): Promise<Step[]> {
    return this.stepsRepository.find({
      where: { process: { id: processId } },
      order: { stepNumber: 'ASC' },
      relations: ['stepAssets', 'stepRelationships'],
    });
  }

  async findOne(id: number): Promise<Step> {
    const step = await this.stepsRepository.findOne({
      where: { id },
      relations: ['process', 'stepAssets', 'stepRelationships'],
    });

    if (!step) {
      throw new NotFoundException(`Step com ID ${id} não encontrado.`);
    }

    return step;
  }

  async update(
    id: number,
    updateStepDto: UpdateStepDto,
    userLevel: number,
  ): Promise<Step> {
    const step = await this.stepsRepository.findOne({
      where: { id },
      relations: ['process'],
    });

    if (!step) {
      throw new NotFoundException(`Step com ID ${id} não encontrado.`);
    }

    const processIdToCheck = updateStepDto.processId || step.process.id;
    await this.checkProcessEditPermission(processIdToCheck, userLevel);

    const updateData: any = { ...updateStepDto };

    if (updateStepDto.processId) {
      updateData.process = this.processesService.getProcessReference(
        updateStepDto.processId,
      );
      delete updateData.processId;
    }

    await this.stepsRepository.update(id, updateData);
    return this.stepsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number, userLevel: number): Promise<void> {
    const step = await this.stepsRepository.findOne({
      where: { id },
      relations: ['process'],
    });

    if (!step) {
      throw new NotFoundException(`Step com ID ${id} não encontrado.`);
    }

    await this.checkProcessEditPermission(step.process.id, userLevel);

    const result = await this.stepsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Step com ID ${id} não encontrado no DB.`);
    }
  }
}
