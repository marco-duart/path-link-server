import { IsEmail, IsNotEmpty, IsString, IsNumber } from 'class-validator';

export class RegisterDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;

  @IsNumber()
  @IsNotEmpty()
  departmentId: number;

  @IsNumber()
  @IsNotEmpty()
  teamId?: number;

  @IsNumber()
  @IsNotEmpty()
  accessLevelId: number;
}
