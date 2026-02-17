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
  create(@Body() createLinkDto: CreateLinkDto) {
    return this.linksService.create(createLinkDto);
  }

  @Get()
  findAll(@CurrentUser() user: JwtPayload) {
    const userLevel = getLevelByName(user.roleName);
    return this.linksService.findAll(
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
    const link = await this.linksService.findOne(id);
    const userLevel = getLevelByName(roleName);

    if (userLevel < link.requiredLevel) {
      throw new HttpException(
        'Acesso negado. Nível de Role insuficiente para visualizar este Link.',
        HttpStatus.FORBIDDEN,
      );
    }
    return link;
  }

  @UseGuards(RoleGuard)
  @Roles('Coordenador')
  @Patch(':id')
  update(@Param('id') id: string, @Body() updateLinkDto: UpdateLinkDto) {
    return this.linksService.update(id, updateLinkDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Gerente')
  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.linksService.remove(id);
  }
}
