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
import { LinksService } from './links.service';
import { CreateLinkDto } from './dto/create-link.dto';
import { UpdateLinkDto } from './dto/update-link.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { getLevelByName } from '../enums/role.enum';
import { Roles } from '../decorators/roles.decorator';
import { JwtPayload } from '../auth/jwt/dto/jwt-payload.dto';

@UseGuards(AuthGuard)
@Controller('links')
export class LinksController {
  constructor(private readonly linksService: LinksService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createLinkDto: CreateLinkDto, @CurrentUser() user: JwtPayload) {
    return this.linksService.create(
      createLinkDto,
      user.departmentId,
      user.teamId,
    );
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.linksService.findAll(
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }

  @Get(':id')
  findOne(@Param('id') id: string, @CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.linksService.findOne(
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
    @Body() updateLinkDto: UpdateLinkDto,
    @CurrentUser() user: JwtPayload,
  ) {
    const userLevel = getLevelByName(user.roleName);
    return this.linksService.update(
      id,
      updateLinkDto,
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
    return this.linksService.remove(
      id,
      userLevel,
      user.departmentId,
      user.teamId,
    );
  }
}
