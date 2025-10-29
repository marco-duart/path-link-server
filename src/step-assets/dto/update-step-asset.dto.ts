import { PartialType } from '@nestjs/swagger';
import { CreateStepAssetDto } from './create-step-asset.dto';

export class UpdateStepAssetDto extends PartialType(CreateStepAssetDto) {}
