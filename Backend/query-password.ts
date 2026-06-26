import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const res = await ds.query(`SELECT password_hash FROM users WHERE email = 'admin@vikassales.local'`);
  const hash = res[0].password_hash;
  
  const match1 = await bcrypt.compare('Password@123', hash);
  const match2 = await bcrypt.compare('Admin@123', hash);

  console.log('--- PASSWORD MATCH ---');
  console.log('Password@123 :', match1);
  console.log('Admin@123 :', match2);

  await app.close();
  process.exit(0);
}
bootstrap();
