import { Module, forwardRef } from '@nestjs/common';
import { StepAssetsService } from './step-assets.service';
import { StepAssetsController } from './step-assets.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepAsset } from '../database/entities/step-asset.entity';
import { AssetsModule } from '../assets/assets.module';
import { StepsModule } from '../steps/steps.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([StepAsset]), AssetsModule, forwardRef(() => StepsModule), AuthModule],
  controllers: [StepAssetsController],
  providers: [StepAssetsService],
  exports: [StepAssetsService],
})
export class StepAssetsModule {}
