import { Module } from '@nestjs/common';
import { DeploysService } from './deploys.service';
import { DeploysController } from './deploys.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Deploy } from '../database/entities/deploy.entity';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Deploy]), AuthModule],
  controllers: [DeploysController],
  providers: [DeploysService],
  exports: [DeploysService],
})
export class DeploysModule {}
