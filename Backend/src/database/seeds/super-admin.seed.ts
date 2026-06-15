import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from '../../user/user.entity';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const userRepository = app.get<Repository<User>>(getRepositoryToken(User));

  const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
  const superAdminPhone = process.env.SUPER_ADMIN_PHONE;
  const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;
  const superAdminName = process.env.SUPER_ADMIN_NAME;

  if (!superAdminEmail || !superAdminPassword) {
    console.error(
      'SUPER_ADMIN_EMAIL and SUPER_ADMIN_PASSWORD must be defined in the environment variables.',
    );
    await app.close();
    process.exit(1);
  }

  const existingAdmin = await userRepository.findOne({
    where: [{ role: 'SUPER_ADMIN' }, { email: superAdminEmail }],
  });

  if (existingAdmin) {
    console.log(
      `[SEED] SUPER_ADMIN already exists (Email: ${existingAdmin.email}, Role: ${existingAdmin.role}). Skipping creation.`,
    );
  } else {
    console.log('[SEED] Creating new SUPER_ADMIN user...');

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    const superAdmin = userRepository.create({
      full_name: superAdminName || 'System Administrator',
      email: superAdminEmail,
      phone: superAdminPhone || '9999999999',
      password_hash: hashedPassword,
      role: 'SUPER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true,
    });

    await userRepository.save(superAdmin);

    console.log(
      `[SEED] Successfully created SUPER_ADMIN (Email: ${superAdminEmail}).`,
    );
  }

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[SEED] Failed to run SUPER_ADMIN seed:', err);
  process.exit(1);
});
