import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Department } from '../entities/department.entity';
import { Team } from '../entities/team.entity';
import { User } from '../entities/user.entity';

async function seed() {
  const app = await NestFactory.create(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🌱 Starting seed...');

  try {
    console.log('🧹 Cleaning old data...');
    const tables = ['accounts', 'repositories', 'databases', 'links', 'configuration_items', 'environment_variables', 'processes', 'user', 'team', 'departments', 'assets', 'step_asset', 'step', 'step_relationship'];
    
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
    ]);
    console.log('✅ Departments created:', departments.length);

    const teamRepo = dataSource.getRepository(Team);
    const teams = await teamRepo.save([
      { name: 'Infra', department: departments[0] },
      { name: 'Dev', department: departments[0] },
    ]);
    console.log('✅ Teams created:', teams.length);

    const userRepo = dataSource.getRepository(User);
    const passwordHash = await bcrypt.hash('Password123!', 10);
    const users = await userRepo.save([
      {
        name: 'admin-dev',
        email: 'admin-dev@ibccoaching.com.br',
        passwordDigest: passwordHash,
        department: departments[0],
        team: teams[1],
        roleLevel: 99,
      },
      {
        name: 'admin-infra',
        email: 'admin-infra@ibccoaching.com.br',
        passwordDigest: passwordHash,
        department: departments[0],
        team: teams[0],
        roleLevel: 99,
      },
    ]);
    console.log('✅ Users created:', users.length);

    console.log('\n✅ Seed completed successfully! 🎉');
    console.log('\nTest Credentials:');
    console.log('  Dev Admin:');
    console.log('    Email: admin-dev@example.com');
    console.log('    Password: Password123!');
    console.log('  Infra Admin:');
    console.log('    Email: admin-infra@example.com');
    console.log('    Password: Password123!');
  } catch (error) {
    console.error('❌ Seed failed:', error);
  } finally {
    await app.close();
  }
}

seed();
