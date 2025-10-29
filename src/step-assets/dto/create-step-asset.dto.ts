import {
  IsString,
  IsOptional,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateStepAssetDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  stepId: number;

  @IsUUID()
  @IsNotEmpty()
  assetId: string;

  @IsString()
  @IsOptional()
  caption?: string;
}
