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
  Logger,
  Query,
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
  private readonly logger = new Logger(StepAssetsController.name);

  constructor(private readonly stepAssetsService: StepAssetsService) {}

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Post()
  create(@Body() createStepAssetDto: CreateStepAssetDto) {
    this.logger.log(
      `[POST /step-assets] Recebido: ${JSON.stringify(createStepAssetDto)}`,
    );
    return this.stepAssetsService.create(createStepAssetDto);
  }

  @Get()
  findByStepId(@Query('stepId', ParseIntPipe) stepId: number) {
    this.logger.log(
      `[GET /step-assets?stepId=${stepId}] Buscando assets do step`,
    );
    return this.stepAssetsService.findByStepId(stepId);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[GET /step-assets/:id=${id}] Buscando asset específico`);
    return this.stepAssetsService.findOne(id);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateStepAssetDto: UpdateStepAssetDto,
  ) {
    this.logger.log(`[PATCH /step-assets/:id=${id}] Atualizando asset`);
    return this.stepAssetsService.update(id, updateStepAssetDto);
  }

  @UseGuards(RoleGuard)
  @Roles('Analista')
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  remove(@Param('id', ParseIntPipe) id: number) {
    this.logger.log(`[DELETE /step-assets/:id=${id}] Deletando asset`);
    return this.stepAssetsService.remove(id);
  }
}
