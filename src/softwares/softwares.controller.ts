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
import { SoftwaresService } from './softwares.service';
import { CreateSoftwareDto } from './dto/create-software.dto';
import { UpdateSoftwareDto } from './dto/update-software.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('softwares')
export class SoftwaresController {
  constructor(private readonly softwaresService: SoftwaresService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createSoftwareDto: CreateSoftwareDto, @CurrentUser() user: JwtPayload) {
    return this.softwaresService.create(
      createSoftwareDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.softwaresService.findAll(
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.softwaresService.findOne(
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
    @Body() updateSoftwareDto: UpdateSoftwareDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.softwaresService.update(
      id,
      updateSoftwareDto,
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
    return this.softwaresService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
