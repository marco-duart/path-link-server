import { Module, forwardRef } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StepRelationship } from '../database/entities/step-relationship.entity';
import { StepRelationshipsService } from './step-relationships.service';
import { StepRelationshipsController } from './step-relationships.controller';
import { StepsModule } from '../steps/steps.module';
import { AccountsModule } from '../accounts/accounts.module';
import { AssetsModule } from '../assets/assets.module';
import { ConfigurationItemsModule } from '../configuration-items/configuration-items.module';
import { DatabasesModule } from '../databases/databases.module';
import { EnvironmentVariablesModule } from '../environment-variables/environment-variables.module';
import { LinksModule } from '../links/links.module';
import { RepositoriesModule } from '../repositories/repositories.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([StepRelationship]),
    StepsModule,
    AccountsModule,
    AssetsModule,
    ConfigurationItemsModule,
    DatabasesModule,
    EnvironmentVariablesModule,
    LinksModule,
    RepositoriesModule,
  ],
  controllers: [StepRelationshipsController],
  providers: [StepRelationshipsService],
  exports: [StepRelationshipsService],
})
export class StepRelationshipsModule {}
