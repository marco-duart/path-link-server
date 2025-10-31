import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
  IsBoolean,
  IsUUID,
} from 'class-validator';

export class CreateStepDto {
  @IsUUID()
  @IsNotEmpty()
  processId: string;

  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  stepNumber: number;

  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  instructions: string;
  @IsString()
  @IsOptional()
  expectedResult?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsBoolean()
  @IsOptional()
  isOptional?: boolean;
}
