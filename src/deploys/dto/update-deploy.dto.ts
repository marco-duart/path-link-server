import {
  IsString,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { RoleHierarchy } from '../../enums/role.enum';

export class UpdateDeployDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  environment?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  endpoint?: string;

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
  @IsOptional()
  @Min(RoleHierarchy.Auxiliar)
  requiredLevel?: number;
}
