import { Module } from '@nestjs/common';
import { ConfigurationItemsService } from './configuration-items.service';
import { ConfigurationItemsController } from './configuration-items.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigurationItem } from '../database/entities/configuration-item.entity';

@Module({
  imports: [TypeOrmModule.forFeature([ConfigurationItem])],
  controllers: [ConfigurationItemsController],
  providers: [ConfigurationItemsService],
  exports: [ConfigurationItemsService],
})
export class ConfigurationItemsModule {}