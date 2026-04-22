import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Query,
} from '@nestjs/common';
import { LogisticsService } from './logistics.service';
import { CreateMachineDto } from './dto/create-machine.dto';
import { UpdateMachineDto } from './dto/update-machine.dto';
import { FindMachinesQueryDto } from './dto/find-machines-query.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('logistics/machines')
export class LogisticsController {
  constructor(private readonly logisticsService: LogisticsService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createMachineDto: CreateMachineDto, @CurrentUser() user: JwtPayload) {
    return this.logisticsService.create(
      createMachineDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload, @Query() query: FindMachinesQueryDto) {
    const userLevel = getLevelByName(user.roleName);
    return this.logisticsService.findAll(
      userLevel,
      query,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.logisticsService.findOne(
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
    @Body() updateMachineDto: UpdateMachineDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.logisticsService.update(
      id,
      updateMachineDto,
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
    return this.logisticsService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
