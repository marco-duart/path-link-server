import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
} from '@nestjs/common';
import { EnvironmentVariablesService } from './environment-variables.service';
import { CreateEnvironmentVariableDto } from './dto/create-environment-variable.dto';
import { UpdateEnvironmentVariableDto } from './dto/update-environment-variable.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('environment-variables')
export class EnvironmentVariablesController {
  constructor(private readonly envVarService: EnvironmentVariablesService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(
    @Body() createEnvVarDto: CreateEnvironmentVariableDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.envVarService.create(
      createEnvVarDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.envVarService.findAll(
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.envVarService.findOne(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateEnvVarDto: UpdateEnvironmentVariableDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.envVarService.update(
      id,
      updateEnvVarDto,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.envVarService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
