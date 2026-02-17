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
  Query,
} from '@nestjs/common';
import { DeploysService } from './deploys.service';
import { CreateDeployDto } from './dto/create-deploy.dto';
import { UpdateDeployDto } from './dto/update-deploy.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from 'src/decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('deploys')
export class DeploysController {
  constructor(private readonly deploysService: DeploysService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createDeployDto: CreateDeployDto) {
    return this.deploysService.create(createDeployDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.deploysService.findAll(
      userLevel,
      user.roleName,
      user.departmentId,
      user.teamId,
    );
  }

  @Get('type/:type')
  findByType(@Param('type') type: string) {
    return this.deploysService.findByType(type);
  }

  @Get('environment/:environment')
  findByEnvironment(@Param('environment') environment: string) {
    return this.deploysService.findByEnvironment(environment);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('roleName') roleName: string,
  ) {
    const deploy = await this.deploysService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < deploy.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar este Deploy.',
        HttpStatus.FORBIDDEN,
      );
    }
    return deploy;
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateDeployDto: UpdateDeployDto,
  ) {
    return this.deploysService.update(id, updateDeployDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.deploysService.remove(id);
  }
}
