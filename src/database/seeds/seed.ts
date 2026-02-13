import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '../entities/department.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';
import { Process } from '../entities/process.entity';
import { Repository } from '../entities/repository.entity';
import { Database } from '../entities/database.entity';
import { Account } from '../entities/account.entity';
import { RoleHierarchy } from '../../enums/role.enum';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting seed...');

  try {
    console.log('🧹 Cleaning old data...');
    const tables = ['accounts', 'repositories', 'databases', 'processes', 'user', 'team', 'departments'];
    
    for (const table of tables) {
      try {
        await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE`);
        console.log(`✅ Cleared ${table}`);
      } catch (error) {
        console.log(`⏭️  Skipped ${table} (not created yet)`);
      }
    }

    const deptRepo = dataSource.getRepository(Department);
    const departments = await deptRepo.save([
      { name: 'TI' },
      { name: 'Operações' },
      { name: 'Gestão' },
    ]);
    console.log('✅ Departments created:', departments.length);

    const teamRepo = dataSource.getRepository(Team);
    const teams = await teamRepo.save([
      { name: 'Backend', department: departments[0] },
      { name: 'Frontend', department: departments[0] },
      { name: 'DevOps', department: departments[0] },
      { name: 'Suporte', department: departments[1] },
      { name: 'Planejamento', department: departments[2] },
    ]);
    console.log('✅ Teams created:', teams.length);

    const userRepo = dataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const users = await userRepo.save([
      {
        name: 'admin',
        email: 'admin@example.com',
        passwordDigest: passwordHash,
        department: departments[0],
        team: teams[0],
        roleLevel: 99,
      },
      {
        name: 'gerente',
        email: 'gerente@example.com',
        passwordDigest: passwordHash,
        department: departments[0],
        team: teams[1],
        roleLevel: 50,
      },
      {
        name: 'usuario1',
        email: 'usuario1@example.com',
        passwordDigest: passwordHash,
        department: departments[0],
        team: teams[0],
        roleLevel: 10,
      },
      {
        name: 'usuario2',
        email: 'usuario2@example.com',
        passwordDigest: passwordHash,
        department: departments[1],
        team: teams[3],
        roleLevel: 10,
      },
    ]);
    console.log('✅ Users created:', users.length);

    const processRepo = dataSource.getRepository(Process);
    const processes = await processRepo.save([
      {
        name: 'Desenvolvimento de Features',
        description: 'Processo de desenvolvimento de novas funcionalidades',
        category: 'Desenvolvimento',
        isActive: true,
      },
      {
        name: 'Revisão de Código',
        description: 'Processo de revisão e deploy de código',
        category: 'QA',
        isActive: true,
      },
      {
        name: 'Suporte Técnico',
        description: 'Processo de atendimento ao cliente',
        category: 'Suporte',
        isActive: true,
      },
    ]);
    console.log('✅ Processes created:', processes.length);

    const repoRepo = dataSource.getRepository(Repository);
    const repositories = await repoRepo.save([
      {
        name: 'api-main',
        url: 'https://github.com/example/api-main',
        techStack: 'NestJS, TypeScript, PostgreSQL',
        description: 'Repositório principal da API',
        requiredLevel: 10,
      },
      {
        name: 'web-frontend',
        url: 'https://github.com/example/web-frontend',
        techStack: 'React, Typescript, Redux',
        description: 'Aplicação frontend web',
        requiredLevel: 20,
      },
      {
        name: 'mobile-app',
        url: 'https://github.com/example/mobile-app',
        techStack: 'React Native, TypeScript',
        description: 'Aplicação mobile',
        requiredLevel: 30,
      },
    ]);
    console.log('✅ Repositories created:', repositories.length);

    const dbRepo = dataSource.getRepository(Database);
    const databases = await dbRepo.save([
      {
        name: 'Production DB',
        type: 'PostgreSQL',
        host: 'db-prod.example.com',
        port: 5432,
        credentialsEncrypted: 'encrypted_credentials_1',
        notes: 'Database de produção principal',
        requiredLevel: RoleHierarchy.Auxiliar,
      },
      {
        name: 'Staging DB',
        type: 'PostgreSQL',
        host: 'db-staging.example.com',
        port: 5432,
        credentialsEncrypted: 'encrypted_credentials_2',
        notes: 'Database de homologação',
        requiredLevel: RoleHierarchy.Assistente,
      },
      {
        name: 'Development DB',
        type: 'PostgreSQL',
        host: 'localhost',
        port: 5432,
        credentialsEncrypted: 'encrypted_credentials_3',
        notes: 'Database local de desenvolvimento',
        requiredLevel: RoleHierarchy.Auxiliar,
      },
    ]);
    console.log('✅ Databases created:', databases.length);

    const accountRepo = dataSource.getRepository(Account);
    const accounts = await accountRepo.save([
      {
        name: 'GitHub Account',
        type: 'GitHub',
        username: 'github-user',
        passwordEncrypted: 'encrypted_password_1',
        url: 'https://github.com',
        notes: 'Conta GitHub corporativa',
      },
      {
        name: 'AWS Account',
        type: 'AWS',
        username: 'aws-admin',
        passwordEncrypted: 'encrypted_password_2',
        url: 'https://aws.amazon.com',
        notes: 'Conta AWS de produção',
      },
      {
        name: 'Slack Workspace',
        type: 'Slack',
        username: 'workspace-admin',
        passwordEncrypted: 'encrypted_password_3',
        url: 'https://slack.com',
        notes: 'Workspace Slack corporativo',
      },
    ]);
    console.log('✅ Accounts created:', accounts.length);

    console.log('\n✅ Seed completed successfully! 🎉');
    console.log('\nTest Credentials:');
    console.log('  Email: admin@example.com');
    console.log('  Password: Password123!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
