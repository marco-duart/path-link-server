import { IsString, IsNotEmpty, IsUUID } from 'class-validator';

export class CreateTeamDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsUUID()
  @IsNotEmpty()
  departmentId: string;
}
