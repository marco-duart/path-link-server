import { Module } from '@nestjs/common';
import { EnvironmentVariablesService } from './environment-variables.service';
import { EnvironmentVariablesController } from './environment-variables.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { EnvironmentVariable } from '../database/entities/environment-variable.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([EnvironmentVariable]), AuthModule],
  controllers: [EnvironmentVariablesController],
  providers: [EnvironmentVariablesService],
  exports: [EnvironmentVariablesService],
})
export class EnvironmentVariablesModule {}
