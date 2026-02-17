import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StepAsset } from '../database/entities/step-asset.entity';
import { CreateStepAssetDto } from './dto/create-step-asset.dto';
import { UpdateStepAssetDto } from './dto/update-step-asset.dto';
import { StepsService } from '../steps/steps.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class StepAssetsService {
  private readonly logger = new Logger(StepAssetsService.name);

  constructor(
    @InjectRepository(StepAsset)
    private stepAssetsRepository: Repository<StepAsset>,
    private stepsService: StepsService,
    private assetsService: AssetsService,
  ) {}

  async create(createStepAssetDto: CreateStepAssetDto): Promise<StepAsset> {
    this.logger.log(
      `[create] Iniciando criação de StepAsset: ${JSON.stringify(createStepAssetDto)}`,
    );

    try {
      this.logger.log(
        `[create] Buscando referência do Step: ${createStepAssetDto.stepId}`,
      );
      const stepReference = await this.stepsService.getStepReference(
        createStepAssetDto.stepId,
      );
      this.logger.log(`[create] ✅ Step encontrado: ${stepReference.id}`);

      this.logger.log(`[create] Buscando Asset: ${createStepAssetDto.assetId}`);
      const assetReference = await this.assetsService.findOne(
        createStepAssetDto.assetId,
      );
      this.logger.log(
        `[create] ✅ Asset encontrado: { id: "${assetReference.id}", filename: "${assetReference.filename}", url: "${assetReference.url}", requiredLevel: ${assetReference.requiredLevel} }`,
      );

      const stepAsset = this.stepAssetsRepository.create({
        caption: createStepAssetDto.caption,
        step: stepReference,
        asset: assetReference,
      });

      this.logger.log(
        `[create] Salvando StepAsset no BD com: { stepId: ${createStepAssetDto.stepId}, assetId: "${createStepAssetDto.assetId}", caption: "${createStepAssetDto.caption}" }`,
      );
      const savedStepAsset = await this.stepAssetsRepository.save(stepAsset);
      this.logger.log(
        `[create] ✅ StepAsset criado com sucesso: { id: ${savedStepAsset.id}, caption: "${savedStepAsset.caption}" }`,
      );

      return savedStepAsset;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      this.logger.error(
        `[create] ❌ Erro ao criar StepAsset: ${errorMsg}`,
        error,
      );
      throw error;
    }
  }

  async findByStepId(stepId: number): Promise<StepAsset[]> {
    this.logger.log(`[findByStepId] Buscando StepAssets para Step: ${stepId}`);
    const assets = await this.stepAssetsRepository.find({
      where: { step: { id: stepId } },
      relations: ['asset'],
    });
    this.logger.log(
      `[findByStepId] ✅ ${assets.length} asset(s) encontrado(s) para Step ${stepId}`,
    );

    if (assets.length === 0) {
      this.logger.warn(
        `[findByStepId] ⚠️  Nenhum asset encontrado para o Step ${stepId}`,
      );
      return assets;
    }

    assets.forEach((sa, idx) => {
      if (sa.asset) {
        this.logger.log(
          `[findByStepId] Asset[${idx}]: { stepAssetId: ${sa.id}, caption: "${sa.caption}", asset: { id: "${sa.asset.id}", filename: "${sa.asset.filename}", url: "${sa.asset.url}" } }`,
        );
      } else {
        this.logger.warn(
          `[findByStepId] Asset[${idx}]: ⚠️  stepAssetId=${sa.id} mas o ASSET É NULL!`,
        );
      }
    });

    return assets;
  }

  async findOne(id: number): Promise<StepAsset> {
    const stepAsset = await this.stepAssetsRepository.findOne({
      where: { id },
      relations: ['step', 'asset'],
    });

    if (!stepAsset) {
      throw new NotFoundException(
        `Relacionamento StepAsset com ID ${id} não encontrado.`,
      );
    }

    return stepAsset;
  }

  async update(
    id: number,
    updateStepAssetDto: UpdateStepAssetDto,
  ): Promise<StepAsset> {
    const stepAsset = await this.stepAssetsRepository.findOne({
      where: { id },
    });

    if (!stepAsset) {
      throw new NotFoundException(
        `Relacionamento StepAsset com ID ${id} não encontrado.`,
      );
    }

    await this.stepAssetsRepository.update(id, updateStepAssetDto);
    return this.stepAssetsRepository.findOneOrFail({ where: { id } });
  }

  async remove(id: number): Promise<void> {
    const result = await this.stepAssetsRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(
        `Relacionamento StepAsset com ID ${id} não encontrado.`,
      );
    }
  }
}
