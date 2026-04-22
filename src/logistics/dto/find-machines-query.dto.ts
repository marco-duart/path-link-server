import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator';
import { MACHINE_STATUSES, STORAGE_TYPES } from './create-machine.dto';

export class FindMachinesQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsString()
  @IsIn(MACHINE_STATUSES)
  status?: (typeof MACHINE_STATUSES)[number];

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  isPda?: boolean;

  @IsOptional()
  @IsString()
  deviceType?: string;

  @IsOptional()
  @IsString()
  room?: string;

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  cpu?: string;

  @IsOptional()
  @IsString()
  @IsIn(STORAGE_TYPES)
  storageType?: (typeof STORAGE_TYPES)[number];

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4096)
  minRamGb?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(4096)
  maxRamGb?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100000)
  minStorageGb?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100000)
  maxStorageGb?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasMonitor?: boolean;

  @IsOptional()
  @IsString()
  @IsIn(['assetTag', 'status', 'room', 'updatedAt', 'createdAt'])
  sortBy?: 'assetTag' | 'status' | 'room' | 'updatedAt' | 'createdAt';

  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';
}
