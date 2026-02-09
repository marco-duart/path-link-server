import { Module, forwardRef } from '@nestjs/common';
import { ProcessesService } from './processes.service';
import { ProcessesController } from './processes.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Process } from '../database/entities/process.entity';
import { UsersModule } from '../users/users.module';
import { StepsModule } from '../steps/steps.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [TypeOrmModule.forFeature([Process]), UsersModule, forwardRef(() => StepsModule), AuthModule],
  controllers: [ProcessesController],
  providers: [ProcessesService],
  exports: [ProcessesService],
})
export class ProcessesModule {}
