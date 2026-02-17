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
import { RepositoriesService } from './repositories.service';
import { CreateRepositoryDto } from './dto/create-repository.dto';
import { UpdateRepositoryDto } from './dto/update-repository.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('repositories')
export class RepositoriesController {
  constructor(private readonly repositoriesService: RepositoriesService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createRepositoryDto: CreateRepositoryDto) {
    return this.repositoriesService.create(createRepositoryDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.repositoriesService.findAll(
      userLevel,
      user.roleName,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('roleName') roleName: string,
  ) {
    const repository = await this.repositoriesService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < repository.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar este Repositório.',
        HttpStatus.FORBIDDEN,
      );
    }
    return repository;
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateRepositoryDto: UpdateRepositoryDto,
  ) {
    return this.repositoriesService.update(id, updateRepositoryDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.repositoriesService.remove(id);
  }
}
