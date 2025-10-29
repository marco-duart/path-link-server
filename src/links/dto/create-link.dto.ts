import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsUrl,
} from 'class-validator';
import { RoleHierarchy } from '../../enums/role.enum';

export class CreateLinkDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUrl()
  @IsNotEmpty()
  url: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(RoleHierarchy.Auxiliar)
  requiredLevel: number;
}
