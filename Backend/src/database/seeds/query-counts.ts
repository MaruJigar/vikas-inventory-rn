import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { DataSource } from 'typeorm';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const ds = app.get(DataSource);

  const q = async (sql: string) => {
    const res = await ds.query(sql);
    return res[0].count;
  };

  console.log('--- DB COUNTS ---');
  console.log('Users:', await q('SELECT COUNT(*) FROM users'));
  console.log('Manufacturers:', await q('SELECT COUNT(*) FROM manufacturers'));
  console.log('Distributors:', await q('SELECT COUNT(*) FROM distributors'));
  console.log('Salesmen:', await q('SELECT COUNT(*) FROM salesmen'));
  console.log('Shops:', await q('SELECT COUNT(*) FROM shops'));
  console.log('Categories:', await q('SELECT COUNT(*) FROM product_categories'));
  console.log('Products:', await q('SELECT COUNT(*) FROM products'));
  console.log('Inventory:', await q('SELECT COUNT(*) FROM distributor_inventory'));
  console.log('Visits:', await q('SELECT COUNT(*) FROM shop_visits'));
  console.log('Orders:', await q('SELECT COUNT(*) FROM orders'));
  console.log('Order Items:', await q('SELECT COUNT(*) FROM order_items'));
  console.log('Approvals:', await q('SELECT COUNT(*) FROM approval_requests'));
  console.log('Uploads:', await q('SELECT COUNT(*) FROM uploaded_files'));

  await app.close();
  process.exit(0);
}
bootstrap();
