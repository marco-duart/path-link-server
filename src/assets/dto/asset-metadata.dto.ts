import { IsNumber, IsOptional, Min } from 'class-validator';
import { Type } from 'class-transformer';

export interface UploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  destination: string;
  filename: string;
  path: string;
}

export class AssetMetadataDto {
  @Type(() => Number)
  @IsOptional()
  @Min(10)
  requiredLevel?: number;
}
