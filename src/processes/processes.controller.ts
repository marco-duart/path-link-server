import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { CreateProcessDto } from './dto/create-process.dto';
import { UpdateProcessDto } from './dto/update-process.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('processes')
export class ProcessesController {
  constructor(private readonly processesService: ProcessesService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(
    @Body() createProcessDto: CreateProcessDto,
    @CurrentUser('user') createdById: number,
  ) {
    return this.processesService.create(createProcessDto, createdById);
  }

  @Get()
  findAll(@CurrentUser('roleName') roleName: string) {
    const userLevel = getLevelByName(roleName);
    return this.processesService.findAll(userLevel);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('roleName') roleName: string,
  ) {
    const process = await this.processesService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < process.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar este Processo.',
        HttpStatus.FORBIDDEN,
      );
    }
    return process;
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateProcessDto: UpdateProcessDto) {
    return this.processesService.update(id, updateProcessDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.processesService.remove(id);
  }
}
