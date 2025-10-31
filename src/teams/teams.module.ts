import { Module } from '@nestjs/common';
import { TeamsService } from './teams.service';
import { TeamsController } from './teams.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Team } from '../database/entities/team.entity';
import { DepartmentsModule } from '../departments/departments.module';

@Module({
  imports: [TypeOrmModule.forFeature([Team]), DepartmentsModule],
  controllers: [TeamsController],
  providers: [TeamsService],
  exports: [TeamsService],
})
export class TeamsModule {}
