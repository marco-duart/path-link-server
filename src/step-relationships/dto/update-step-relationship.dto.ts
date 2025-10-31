import { PartialType } from '@nestjs/swagger';
import { CreateStepRelationshipDto } from './create-step-relationship.dto';

export class UpdateStepRelationshipDto extends PartialType(CreateStepRelationshipDto) {}
