import {
  IsString,
  IsNotEmpty,
  IsUrl,
  IsOptional,
  IsNumber,
  Min,
  IsUUID,
} from 'class-validator';
import { Transform } from 'class-transformer';
import { RoleHierarchy } from 'src/enums/role.enum';

export class CreateAccountDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  passwordEncrypted?: string;

  @IsUrl()
  @IsOptional()
  url?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @Transform(({ value }) => (value === '' ? null : value))
  @IsOptional()
  @IsUUID()
  twoFactorQrAssetId?: string | null;

  @IsNumber()
  @IsNotEmpty()
  @Min(RoleHierarchy.Auxiliar)
  requiredLevel: number;
}
