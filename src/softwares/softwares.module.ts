import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Software } from '../database/entities/software.entity';
import { SoftwaresService } from './softwares.service';
import { SoftwaresController } from './softwares.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Software]), AuthModule],
  controllers: [SoftwaresController],
  providers: [SoftwaresService],
  exports: [SoftwaresService],
})
export class SoftwaresModule {}
