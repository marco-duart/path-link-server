import { IsNumber, IsOptional, IsString } from 'class-validator';
import { RoleNames } from '../../enums/role.enum';

export class UserResponseDto {
  @IsNumber()
  id: number;

  @IsString()
  name: string;

  @IsString()
  email: string;

  @IsString()
  roleName: RoleNames;

  @IsOptional()
  department?: { id: number; name: string };

  @IsOptional()
  team?: { id: number; name: string };
}
