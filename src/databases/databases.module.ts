import { Module } from '@nestjs/common';
import { DatabasesService } from './databases.service';
import { DatabasesController } from './databases.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Database } from '../database/entities/database.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Database])],
  controllers: [DatabasesController],
  providers: [DatabasesService],
  exports: [DatabasesService],
})
export class DatabasesModule {}
