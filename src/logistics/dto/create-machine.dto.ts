import {
  IsIn,
  IsIP,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';
import { RoleHierarchy } from '../../enums/role.enum';

export const MACHINE_STATUSES = [
  'available',
  'in_use',
  'stopped',
  'maintenance',
  'retired',
] as const;

export const STORAGE_TYPES = ['SSD', 'HDD', 'NVME', 'EMMC', 'HYBRID', 'OTHER'] as const;

export class CreateMachineDto {
  @IsString()
  @IsNotEmpty()
  assetTag: string;

  @IsString()
  @IsOptional()
  deviceType?: string;

  @IsString()
  @IsOptional()
  assignee?: string;

  @IsIP()
  @IsOptional()
  ip?: string;

  @IsString()
  @IsOptional()
  cpu?: string;

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(4096)
  ramGb?: number;

  @IsString()
  @IsOptional()
  @IsIn(STORAGE_TYPES)
  storageType?: (typeof STORAGE_TYPES)[number];

  @IsNumber()
  @IsOptional()
  @Min(1)
  @Max(100000)
  storageGb?: number;

  @IsString()
  @IsOptional()
  monitorInfo?: string;

  @IsString()
  @IsOptional()
  room?: string;

  @IsString()
  @IsOptional()
  @IsIn(MACHINE_STATUSES)
  status?: (typeof MACHINE_STATUSES)[number];

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  departmentId?: string;

  @IsNumber()
  @IsOptional()
  teamId?: number;

  @IsNumber()
  @IsNotEmpty()
  @Min(RoleHierarchy.Auxiliar)
  requiredLevel: number;
}
