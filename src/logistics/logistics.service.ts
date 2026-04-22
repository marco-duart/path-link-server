import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Machine } from '../database/entities/machine.entity';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { FindMachinesQueryDto } from './dto/find-machines-query.dto';
import {
  applyResourceScope,
  withUserOwnership,
} from '../common/utils/resource-scope';

@Injectable()
export class LogisticsService {
  constructor(
    @InjectRepository(Machine)
    private machinesRepository: Repository<Machine>,
  ) {}

  private mapMachineDtoToEntityData(
    dto: CreateMachineDto | UpdateMachineDto,
  ): Partial<Machine> {
    const { departmentId, teamId, ...rest } = dto as CreateMachineDto &
      UpdateMachineDto;

    const entityData: Partial<Machine> = { ...rest };

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
    createMachineDto: CreateMachineDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Machine> {
    const machineData = withUserOwnership(
      this.mapMachineDtoToEntityData(createMachineDto),
      userDepartmentId,
      userTeamId,
    );

    if (!machineData.deviceType) {
      machineData.deviceType = machineData.isPda ? 'pda' : 'other';
    }

    if (!machineData.status) {
      machineData.status = 'available';
    }

    const machine = this.machinesRepository.create(machineData);
    return this.machinesRepository.save(machine);
  }

  private buildScopedQuery(
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ) {
    const query = this.machinesRepository
      .createQueryBuilder('machine')
      .leftJoinAndSelect('machine.department', 'department')
      .leftJoinAndSelect('machine.team', 'team')
      .where('machine.required_level <= :userLevel', { userLevel });

    return applyResourceScope(
      query,
      'machine',
      userLevel,
      userDepartmentId,
      userTeamId,
    );
  }

  async findAll(
    userLevel: number,
    queryDto: FindMachinesQueryDto,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Machine[]> {
    const query = this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    );

    if (queryDto.search) {
      query.andWhere(
        '(machine.asset_tag ILIKE :search OR machine.assignee ILIKE :search OR machine.cpu ILIKE :search OR machine.room ILIKE :search)',
        { search: `%${queryDto.search}%` },
      );
    }

    if (queryDto.status) {
      query.andWhere('machine.status = :status', { status: queryDto.status });
    }

    if (queryDto.isPda !== undefined) {
      query.andWhere('machine.is_pda = :isPda', { isPda: queryDto.isPda });
    }

    if (queryDto.deviceType) {
      query.andWhere('machine.device_type ILIKE :deviceType', {
        deviceType: `%${queryDto.deviceType}%`,
      });
    }

    if (queryDto.room) {
      query.andWhere('machine.room ILIKE :room', { room: `%${queryDto.room}%` });
    }

    if (queryDto.assignee) {
      query.andWhere('machine.assignee ILIKE :assignee', {
        assignee: `%${queryDto.assignee}%`,
      });
    }

    if (queryDto.cpu) {
      query.andWhere('machine.cpu ILIKE :cpu', { cpu: `%${queryDto.cpu}%` });
    }

    if (queryDto.storageType) {
      query.andWhere('machine.storage_type = :storageType', {
        storageType: queryDto.storageType,
      });
    }

    if (queryDto.minRamGb !== undefined) {
      query.andWhere('machine.ram_gb >= :minRamGb', {
        minRamGb: queryDto.minRamGb,
      });
    }

    if (queryDto.maxRamGb !== undefined) {
      query.andWhere('machine.ram_gb <= :maxRamGb', {
        maxRamGb: queryDto.maxRamGb,
      });
    }

    if (queryDto.minStorageGb !== undefined) {
      query.andWhere('machine.storage_gb >= :minStorageGb', {
        minStorageGb: queryDto.minStorageGb,
      });
    }

    if (queryDto.maxStorageGb !== undefined) {
      query.andWhere('machine.storage_gb <= :maxStorageGb', {
        maxStorageGb: queryDto.maxStorageGb,
      });
    }

    if (queryDto.hasMonitor !== undefined) {
      if (queryDto.hasMonitor) {
        query.andWhere(
          "machine.monitor_info IS NOT NULL AND TRIM(machine.monitor_info) <> ''",
        );
      } else {
        query.andWhere(
          "machine.monitor_info IS NULL OR TRIM(machine.monitor_info) = ''",
        );
      }
    }

    const sortBy = queryDto.sortBy || 'updatedAt';
    const sortOrder = queryDto.sortOrder || 'DESC';

    const sortableColumns: Record<string, string> = {
      assetTag: 'machine.asset_tag',
      status: 'machine.status',
      room: 'machine.room',
      updatedAt: 'machine.updated_at',
      createdAt: 'machine.created_at',
    };

    query.orderBy(sortableColumns[sortBy], sortOrder);

    return query.getMany();
  }

  async findOne(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Machine> {
    const machine = await this.buildScopedQuery(
      userLevel,
      userDepartmentId,
      userTeamId,
    )
      .andWhere('machine.id = :id', { id })
      .getOne();

    if (!machine) {
      throw new NotFoundException(`Machine com ID ${id} não encontrada.`);
    }

    return machine;
  }

  async update(
    id: string,
    updateMachineDto: UpdateMachineDto,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<Machine> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const updateData = withUserOwnership(
      this.mapMachineDtoToEntityData(updateMachineDto),
      userDepartmentId,
      userTeamId,
    );

    await this.machinesRepository.update(id, updateData);
    return this.findOne(id, userLevel, userDepartmentId, userTeamId);
  }

  async remove(
    id: string,
    userLevel: number,
    userDepartmentId?: string,
    userTeamId?: number,
  ): Promise<void> {
    await this.findOne(id, userLevel, userDepartmentId, userTeamId);
    const result = await this.machinesRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Machine com ID ${id} não encontrada.`);
    }
  }
}
