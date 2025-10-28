import { IsNumber, IsOptional, Min } from 'class-validator';

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
  @IsNumber()
  @IsOptional()
  @Min(10)
  requiredLevel?: number;
}
