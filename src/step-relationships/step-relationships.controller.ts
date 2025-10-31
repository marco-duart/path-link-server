import {
  Controller,
  Post,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
  Body,
  Get,
} from '@nestjs/common';
import { StepRelationshipsService } from './step-relationships.service';
import { CreateStepRelationshipDto } from './dto/create-step-relationship.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../decorators/roles.decorator';
import { getLevelByName } from '../enums/role.enum';
import { CurrentUser } from '../decorators/current-user.decorator';

@UseGuards(AuthGuard)
@Controller('step-relationships')
export class StepRelationshipsController {
  constructor(
    private readonly stepRelationshipsService: StepRelationshipsService,
  ) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(
    @Body() createDto: CreateStepRelationshipDto,
    @CurrentUser('roleName') roleName: string,
  ) {
    const userLevel = getLevelByName(roleName);
    return this.stepRelationshipsService.create(createDto, userLevel);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stepRelationshipsService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(
    @Param('id', ParseIntPipe) id: number,
    @CurrentUser('roleName') roleName: string,
  ) {
    const userLevel = getLevelByName(roleName);
    return this.stepRelationshipsService.remove(id, userLevel);
  }
}
