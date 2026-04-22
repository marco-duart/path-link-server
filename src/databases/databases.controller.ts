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
import { DatabasesService } from './databases.service';
import { CreateDatabaseDto } from './dto/create-database.dto';
import { UpdateDatabaseDto } from './dto/update-database.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('databases')
export class DatabasesController {
  constructor(private readonly databasesService: DatabasesService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(
    @Body() createDatabaseDto: CreateDatabaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    return this.databasesService.create(
      createDatabaseDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.databasesService.findAll(
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.databasesService.findOne(
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
    @Body() updateDatabaseDto: UpdateDatabaseDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.databasesService.update(
      id,
      updateDatabaseDto,
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
    return this.databasesService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
