import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsUrl,
  IsUUID,
} from 'class-validator';
import { RoleHierarchy } from '../../enums/role.enum';

export class CreateSoftwareDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl({ require_tld: false })
  @IsNotEmpty()
  downloadUrl: string;

  @IsString()
  @IsOptional()
  version?: string;

  @IsString()
  @IsOptional()
  description?: string;

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
