import { Module } from '@nestjs/common';
import typeOrmConfigAsync from './database.config';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forRootAsync(typeOrmConfigAsync)],
})
export class DatabaseModule {}
