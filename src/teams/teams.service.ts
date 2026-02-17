import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Team } from '../database/entities/team.entity';
import { CreateTeamDto } from './dto/create-team.dto';
import { UpdateTeamDto } from './dto/update-team.dto';
import { DepartmentsService } from '../departments/departments.service';

@Injectable()
export class TeamsService {
  constructor(
    @InjectRepository(Team)
    private teamsRepository: Repository<Team>,
    private departmentsService: DepartmentsService,
  ) {}

  getTeamReference(id: number): Team {
    return this.teamsRepository.create({ id });
  }

  async create(createTeamDto: CreateTeamDto): Promise<Team> {
    const departmentReference = await this.departmentsService.findOne(
      createTeamDto.departmentId,
    );

    if (!departmentReference) {
      throw new NotFoundException(
        `Department com ID ${createTeamDto.departmentId} não encontrado.`,
      );
    }

    const team = this.teamsRepository.create({
      name: createTeamDto.name,
      department: departmentReference,
    });

    return this.teamsRepository.save(team);
  }

  async findAll(): Promise<Team[]> {
    return this.teamsRepository.find({ relations: ['department', 'users'] });
  }

  async findByDepartment(departmentId: string): Promise<Team[]> {
    return this.teamsRepository.find({
      where: { department: { id: departmentId } },
      relations: ['department', 'users'],
    });
  }

  async findOne(id: number): Promise<Team> {
    const team = await this.teamsRepository.findOne({
      where: { id },
      relations: ['department', 'users'],
    });

    if (!team) {
      throw new NotFoundException(`Team com ID ${id} não encontrado.`);
    }

    return team;
  }

  async update(id: number, updateTeamDto: UpdateTeamDto): Promise<Team> {
    const team = await this.teamsRepository.findOne({ where: { id } });

    if (!team) {
      throw new NotFoundException(`Team com ID ${id} não encontrado.`);
    }

    const updateData: any = { ...updateTeamDto };

    if (updateTeamDto.departmentId) {
      const newDepartmentReference = await this.departmentsService.findOne(
        updateTeamDto.departmentId,
      );
      if (!newDepartmentReference) {
        throw new NotFoundException(
          `Department com ID ${updateTeamDto.departmentId} não encontrado.`,
        );
      }
      updateData.department = newDepartmentReference;
      delete updateData.departmentId;
    }

    await this.teamsRepository.update(id, updateData);
    return this.teamsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const result = await this.teamsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`Team com ID ${id} não encontrado.`);
    }
  }
}
