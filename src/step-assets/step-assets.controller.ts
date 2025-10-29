import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  ParseIntPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { StepAssetsService } from './step-assets.service';
import { CreateStepAssetDto } from './dto/create-step-asset.dto';
import { UpdateStepAssetDto } from './dto/update-step-asset.dto';
import { AuthGuard } from '../auth/guards/auth.guard';
import { RoleGuard } from '../auth/guards/role.guard';
import { Roles } from '../decorators/roles.decorator';

@UseGuards(AuthGuard)
@Controller('step-assets')
export class StepAssetsController {
  constructor(private readonly stepAssetsService: StepAssetsService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createStepAssetDto: CreateStepAssetDto) {
    return this.stepAssetsService.create(createStepAssetDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.stepAssetsService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStepAssetDto: UpdateStepAssetDto,
  ) {
    return this.stepAssetsService.update(id, updateStepAssetDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.stepAssetsService.remove(id);
  }

  @Get('/step/:stepId')
  findByStepId(@Param('stepId', ParseIntPipe) stepId: number) {
    return this.stepAssetsService.findByStepId(stepId);
  }
}
