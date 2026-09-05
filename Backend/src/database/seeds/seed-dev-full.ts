import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../user/user.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const getRepo = <Entity extends ObjectLiteral>(
    entityClass: new () => Entity,
  ): Repository<Entity> => {
    return app.get(getRepositoryToken(entityClass));
  };

  const dataSource = app.get(DataSource);
  const userRepo = getRepo(User);

  console.log('[SEED] Starting Production Master Seeding Process...');

  // --- WIPE ALL BUSINESS/TRANSACTIONAL DATA ---
  console.log('[SEED] Wiping existing business/transactional data...');
  const entities = [
    'order_items',
    'orders',
    'shop_visits',
    'distributor_inventory',
    'manufacturer_inventory',
    'shops',
    'products',
    'product_categories',
    'salesmen',
    'manufacturer_distributors',
    'distributors',
    'manufacturers',
    'approval_requests',
    'uploaded_files',
    'location_logs',
    'latest_locations',
    'working_days',
  ];
  
  for (const table of entities) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (e) {
      // ignore if doesn't exist
    }
  }

  // --- DELETE ALL OTHER USERS EXCEPT SUPER ADMIN ---
  console.log('[SEED] Cleaning up non-super-admin users...');
  try {
    await dataSource.query(`DELETE FROM "users" WHERE email != 'Jigar@avchousehold.com';`);
  } catch (e) {
    console.error('[SEED] Failed to delete non-super-admin users:', e);
  }

  const hash = async (pw: string) => bcrypt.hash(pw, 10);
  const superAdminPassword = 'Jigar@1234';
  const hashedPw = await hash(superAdminPassword);

  // --- SUPER ADMIN ---
  console.log('[SEED] Ensuring SUPER_ADMIN exists...');
  
  const existingAdmin = await userRepo.findOne({
    where: { email: 'Jigar@avchousehold.com' },
  });

  if (existingAdmin) {
    existingAdmin.full_name = 'Jigar Maru';
    existingAdmin.password_hash = hashedPw;
    existingAdmin.role = 'SUPER_ADMIN';
    existingAdmin.approval_status = 'APPROVED';
    existingAdmin.is_active = true;
    await userRepo.save(existingAdmin);
    console.log('[SEED] Updated existing SUPER_ADMIN.');
  } else {
    await userRepo.save(
      userRepo.create({
        full_name: 'Jigar Maru',
        email: 'Jigar@avchousehold.com',
        phone: '9999999999',
        password_hash: hashedPw,
        role: 'SUPER_ADMIN',
        approval_status: 'APPROVED',
        is_active: true,
      }),
    );
    console.log('[SEED] Created new SUPER_ADMIN.');
  }

  console.log(
    '[SEED] Master Production Seeding Finished Successfully!',
  );

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[SEED] Failed to run master seed:', err);
  process.exit(1);
});
