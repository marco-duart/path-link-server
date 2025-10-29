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
import { EnvironmentVariablesService } from './environment-variables.service';
import { CreateEnvironmentVariableDto } from './dto/create-environment-variable.dto';
import { UpdateEnvironmentVariableDto } from './dto/update-environment-variable.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('environment-variables')
export class EnvironmentVariablesController {
  constructor(private readonly envVarService: EnvironmentVariablesService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createEnvVarDto: CreateEnvironmentVariableDto) {
    return this.envVarService.create(createEnvVarDto);
  }

  @Get()
  findAll(@CurrentUser('roleName') roleName: string) {
    const userLevel = getLevelByName(roleName);
    return this.envVarService.findAll(userLevel);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('roleName') roleName: string,
  ) {
    const envVar = await this.envVarService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < envVar.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar esta Variável de Ambiente.',
        HttpStatus.FORBIDDEN,
      );
    }
    return envVar;
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnvVarDto: UpdateEnvironmentVariableDto,
  ) {
    return this.envVarService.update(id, updateEnvVarDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.envVarService.remove(id);
  }
}
