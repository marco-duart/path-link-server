import { PartialType } from '@nestjs/swagger';
import { CreateEnvironmentVariableDto } from './create-environment-variable.dto';

export class UpdateEnvironmentVariableDto extends PartialType(CreateEnvironmentVariableDto) {}
