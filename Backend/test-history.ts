import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { WorkingDayService } from './src/working-day/working-day.service';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const service = app.get(WorkingDayService);
  const dataSource = app.get(DataSource);
  
  // Find a super admin
  const user = await dataSource.query(`SELECT id FROM users WHERE role = 'SUPER_ADMIN' LIMIT 1`);
  if (!user.length) {
    console.log('No super admin found');
    process.exit(1);
  }
  
  console.log('Super admin id:', user[0].id);
  const res = await service.getHistory(user[0].id, 'SUPER_ADMIN', {});
  console.log(JSON.stringify(res, null, 2));
  process.exit(0);
}
bootstrap();
