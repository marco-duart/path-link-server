import {
  IsString,
  IsNotEmpty,
  IsUUID,
  IsNumber,
  Min,
  IsIn,
} from 'class-validator';

export const RELATABLE_MODELS = [
  'Account',
  'Asset',
  'ConfigurationItem',
  'Database',
  'EnvironmentVariable',
  'Link',
  'Repository',
] as const;
export type RelatableModel = (typeof RELATABLE_MODELS)[number];

export class CreateStepRelationshipDto {
  @IsNumber()
  @IsNotEmpty()
  @Min(1)
  stepId: number;

  @IsString()
  @IsNotEmpty()
  @IsIn(RELATABLE_MODELS)
  relatedModel: RelatableModel;

  @IsUUID()
  @IsNotEmpty()
  relatedId: string;
}
