import { Module } from '@nestjs/common';
import { EnvironmentVariablesService } from './environment-variables.service';
import { EnvironmentVariablesController } from './environment-variables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariable } from '../database/entities/environment-variable.entity';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentVariable])],
  controllers: [EnvironmentVariablesController],
  providers: [EnvironmentVariablesService],
  exports: [EnvironmentVariablesService],
})
export class EnvironmentVariablesModule {}
