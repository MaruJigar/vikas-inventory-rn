import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const res = await ds.query(`SELECT id, email, phone, role, approval_status, is_active, deleted_at FROM users WHERE email = 'admin@vikassales.local'`);
  console.log('--- USER DATA ---');
  console.log(res);

  const res2 = await ds.query(`SELECT password_hash FROM users WHERE email = 'admin@vikassales.local'`);
  console.log('--- HASH EXISTS ---');
  console.log(!!res2[0]?.password_hash);

  await app.close();
  process.exit(0);
}
bootstrap();
