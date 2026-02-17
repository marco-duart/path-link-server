import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { RoleHierarchy } from '../../enums/role.enum';

export class CreateDeployDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  environment: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsNotEmpty()
  endpoint: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsUUID()
  @IsOptional()
  credentialsId?: string;

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
