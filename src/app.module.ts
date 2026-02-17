import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { AccountsModule } from './accounts/accounts.module';
import { AssetsModule } from './assets/assets.module';
import { UsersModule } from './users/users.module';
import { ConfigurationItemsModule } from './configuration-items/configuration-items.module';
import { DatabasesModule } from './databases/databases.module';
import { DepartmentsModule } from './departments/departments.module';
import { EnvironmentVariablesModule } from './environment-variables/environment-variables.module';
import { LinksModule } from './links/links.module';
import { TeamsModule } from './teams/teams.module';
import { RepositoriesModule } from './repositories/repositories.module';
import { StepAssetsModule } from './step-assets/step-assets.module';
import { StepsModule } from './steps/steps.module';
import { ProcessesModule } from './processes/processes.module';
import { StepRelationshipsModule } from './step-relationships/step-relationships.module';
import { DeploysModule } from './deploys/deploys.module';

@Module({
  imports: [
    DatabaseModule,
    ConfigModule.forRoot({ isGlobal: true }),
    AuthModule,
    AccountsModule,
    AssetsModule,
    UsersModule,
    ConfigurationItemsModule,
    DatabasesModule,
    DepartmentsModule,
    EnvironmentVariablesModule,
    LinksModule,
    TeamsModule,
    RepositoriesModule,
    StepAssetsModule,
    StepsModule,
    ProcessesModule,
    StepRelationshipsModule,
    DeploysModule,
  ],
})
export class AppModule {}
