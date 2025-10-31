import { Module, forwardRef } from '@nestjs/common';
import { StepsService } from './steps.service';
import { StepsController } from './steps.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Step } from '../database/entities/step.entity';
import { ProcessesModule } from '../processes/processes.module';
import { StepAssetsModule } from '../step-assets/step-assets.module';
import { StepRelationshipsModule } from '../step-relationships/step-relationships.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Step]),
    ProcessesModule,
    StepAssetsModule,
    StepRelationshipModule,
  ],
  controllers: [StepsController],
  providers: [StepsService],
  exports: [StepsService],
})
export class StepsModule {}
