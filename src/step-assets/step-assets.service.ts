import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { StepAsset } from '../database/entities/step-asset.entity';
import { CreateStepAssetDto } from './dto/create-step-asset.dto';
import { UpdateStepAssetDto } from './dto/update-step-asset.dto';
import { StepService } from '../steps/steps.service';
import { AssetsService } from '../assets/assets.service';

@Injectable()
export class StepAssetsService {
  constructor(
    @InjectRepository(StepAsset)
    private stepAssetsRepository: Repository<StepAsset>,
    private stepService: StepService,
    private assetService: AssetsService,
  ) {}

  async create(createStepAssetDto: CreateStepAssetDto): Promise<StepAsset> {
    const stepReference = await this.stepService.getStepReference(
      createStepAssetDto.stepId,
    );
    const assetReference = await this.assetService.findOne(
      createStepAssetDto.assetId,
    );

    const stepAsset = this.stepAssetsRepository.create({
      caption: createStepAssetDto.caption,

      step: stepReference,
      asset: assetReference,
    });

    return this.stepAssetsRepository.save(stepAsset);
  }

  async findByStepId(stepId: number): Promise<StepAsset[]> {
    return this.stepAssetsRepository.find({
      where: { step: { id: stepId } },
      relations: ['asset'],
    });
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
