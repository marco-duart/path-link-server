import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { StepsService } from './steps.service';
import { CreateStepDto } from './dto/create-step.dto';
import { UpdateStepDto } from './dto/update-step.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('steps')
export class StepsController {
  constructor(private readonly stepsService: StepsService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(
    @Body() createStepDto: CreateStepDto,
    @CurrentUser('roleName') roleName: string,
  ) {
    const userLevel = getLevelByName(roleName);
    return this.stepsService.create(createStepDto, userLevel);
  }

  @Get('/process/:processId')
  findByProcessId(@Param('processId') processId: string) {
    return this.stepsService.findByProcessId(processId);
  }

  @Get(':id')
  async findOne(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('roleName') roleName: string,
  ) {
    const step = await this.stepsService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < step.process.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar o Processo pai.',
        HttpStatus.FORBIDDEN,
      );
    }
    return step;
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStepDto: UpdateStepDto,
    @CurrentUser('roleName') roleName: string,
  ) {
    const userLevel = getLevelByName(roleName);
    return this.stepsService.update(id, updateStepDto, userLevel);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Delete(':id')
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('roleName') roleName: string,
  ) {
    const userLevel = getLevelByName(roleName);
    return this.stepsService.remove(id, userLevel);
  }
}
