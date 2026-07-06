const fs = require('fs');

const code = `import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from '../../user/user.entity';
import { Manufacturer } from '../../manufacturer/manufacturer.entity';
import { Distributor } from '../../distributor/distributor.entity';
import { ManufacturerDistributor } from '../../distributor/manufacturer-distributor.entity';
import { Salesman } from '../../salesman/salesman.entity';
import { ProductCategory } from '../../product/product-category.entity';
import { Product } from '../../product/product.entity';
import { Shop } from '../../shop/shop.entity';
import { DistributorInventory } from '../../inventory/distributor-inventory.entity';
import { Order } from '../../order/order.entity';
import { OrderItem } from '../../order/order-item.entity';
import { ShopVisit } from '../../visit/shop-visit.entity';
import { Notification } from '../../notification/notification.entity';
import { ApprovalRequest } from '../../approval/approval-request.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const getRepo = (entity) => app.get(getRepositoryToken(entity));

  const userRepo = getRepo(User);
  const mfrRepo = getRepo(Manufacturer);
  const distRepo = getRepo(Distributor);
  const mdRepo = getRepo(ManufacturerDistributor);
  const salesRepo = getRepo(Salesman);
  const catRepo = getRepo(ProductCategory);
  const prodRepo = getRepo(Product);
  const shopRepo = getRepo(Shop);
  const invRepo = getRepo(DistributorInventory);
  const orderRepo = getRepo(Order);
  const itemRepo = getRepo(OrderItem);
  const visitRepo = getRepo(ShopVisit);
  const notifRepo = getRepo(Notification);
  const apprRepo = getRepo(ApprovalRequest);

  console.log('[SEED] Starting Development Seeding Process...');

  const hash = async (pw) => bcrypt.hash(pw, 10);
  const passAdmin = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
  const passMfr = process.env.MANUFACTURER_ADMIN_PASSWORD || 'Password@123';
  const passDist = process.env.DISTRIBUTOR_ADMIN_PASSWORD || 'Password@123';
  const passSales = process.env.SALESMAN_PASSWORD || 'Password@123';

  // 1. SUPER_ADMIN
  let superAdmin = await userRepo.findOne({ where: { role: 'SUPER_ADMIN' } });
  if (!superAdmin) {
    superAdmin = await userRepo.save(userRepo.create({
      full_name: process.env.SUPER_ADMIN_NAME || 'System Administrator',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@vikassales.local',
      phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
      password_hash: await hash(passAdmin),
      role: 'SUPER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true
    }));
  }

  // 2. MANUFACTURER_ADMIN
  let mfrUser = await userRepo.findOne({ where: { role: 'MANUFACTURER_ADMIN' } });
  if (!mfrUser) {
    mfrUser = await userRepo.save(userRepo.create({
      full_name: 'Dev Manufacturer',
      email: process.env.MANUFACTURER_ADMIN_EMAIL || 'manufacturer@vikassales.local',
      phone: '8888888888',
      password_hash: await hash(passMfr),
      role: 'MANUFACTURER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true
    }));
  }
  let mfr = await mfrRepo.findOne({ where: { user_id: mfrUser.id } });
  if (!mfr) {
    mfr = await mfrRepo.save(mfrRepo.create({
      user_id: mfrUser.id,
      company_name: 'Vikas Industries Ltd',
      gst_number: '27AABCU9603R1ZX',
      address: 'Industrial Estate, Mumbai',
      contact_person: 'Mr. Vikas'
    }));
  }

  // 3. DISTRIBUTOR_ADMIN (2)
  const distUsers = [];
  for (let i = 1; i <= 2; i++) {
    const email = i === 1 ? (process.env.DISTRIBUTOR_ADMIN_EMAIL || 'distributor@vikassales.local') : \`distributor\${i}@vikassales.local\`;
    let distUser = await userRepo.findOne({ where: { email } });
    if (!distUser) {
      distUser = await userRepo.save(userRepo.create({
        full_name: \`Dev Distributor \${i}\`,
        email,
        phone: \`777777777\${i}\`,
        password_hash: await hash(passDist),
        role: 'DISTRIBUTOR_ADMIN',
        approval_status: 'APPROVED',
        is_active: true
      }));
    }
    distUsers.push(distUser);
  }

  const dists = [];
  for (const du of distUsers) {
    let dist = await distRepo.findOne({ where: { user_id: du.id } });
    if (!dist) {
      dist = await distRepo.save(distRepo.create({
        user_id: du.id,
        agency_name: \`Agency \${du.full_name}\`,
        gst_number: \`27AABCU000\${du.id.substring(0,2)}R1ZX\`,
        region: 'Maharashtra',
        address: 'Market Yard'
      }));
    }
    dists.push(dist);

    let md = await mdRepo.findOne({ where: { manufacturer_id: mfr.id, distributor_id: dist.id } });
    if (!md) {
      await mdRepo.save(mdRepo.create({
        manufacturer_id: mfr.id,
        distributor_id: dist.id,
        status: 'ACTIVE'
      }));
    }
  }

  // 4. SALESMAN (5)
  const salesUsers = [];
  for (let i = 1; i <= 5; i++) {
    const email = i === 1 ? (process.env.SALESMAN_EMAIL || 'salesman@vikassales.local') : \`salesman\${i}@vikassales.local\`;
    let saleUser = await userRepo.findOne({ where: { email } });
    if (!saleUser) {
      saleUser = await userRepo.save(userRepo.create({
        full_name: \`Dev Salesman \${i}\`,
        email,
        phone: \`666666666\${i}\`,
        password_hash: await hash(passSales),
        role: 'SALESMAN',
        approval_status: 'APPROVED',
        is_active: true
      }));
    }
    salesUsers.push(saleUser);
  }

  const salesmen = [];
  for (let i=0; i<salesUsers.length; i++) {
    const su = salesUsers[i];
    let sm = await salesRepo.findOne({ where: { user_id: su.id } });
    if (!sm) {
      sm = await salesRepo.save(salesRepo.create({
        user_id: su.id,
        distributor_id: dists[i % 2].id, // Alternate distributors
        territory: \`Zone \${i}\`,
        status: 'ACTIVE'
      }));
    }
    salesmen.push(sm);
  }

  // 5. PRODUCTS & CATEGORIES
  console.log('[SEED] Seeding Products...');
  const catNames = ['Electronics', 'FMCG', 'Hardware', 'Automotive', 'Apparel'];
  const cats = [];
  for (const name of catNames) {
    let c = await catRepo.findOne({ where: { name } });
    if (!c) {
      c = await catRepo.save(catRepo.create({ manufacturer_id: mfr.id, name, description: name + ' category' }));
    }
    cats.push(c);
  }

  const prods = [];
  for (let i = 1; i <= 50; i++) {
    const sku = \`SKU-\${1000 + i}\`;
    let p = await prodRepo.findOne({ where: { sku } });
    if (!p) {
      p = await prodRepo.save(prodRepo.create({
        manufacturer_id: mfr.id,
        category_id: cats[i % 5].id,
        name: \`Dev Product \${i}\`,
        sku,
        description: 'Sample description',
        mrp: parseFloat((100 + i * 10).toFixed(2)),
        ptr: parseFloat((80 + i * 8).toFixed(2)),
        gst_percent: 18.00,
        is_active: true
      }));
    }
    prods.push(p);
  }

  // 6. SHOPS
  console.log('[SEED] Seeding Shops...');
  const shops = [];
  for (let i = 1; i <= 20; i++) {
    const mobile = \`55555555\${String(i).padStart(2,'0')}\`;
    let s = await shopRepo.findOne({ where: { mobile } });
    if (!s) {
      s = await shopRepo.save(shopRepo.create({
        salesman_id: salesmen[i % 5].id,
        distributor_id: salesmen[i % 5].distributor_id,
        shop_name: \`Dev Shop \${i}\`,
        owner_name: \`Owner \${i}\`,
        mobile,
        address: \`Shop Address \${i}\`,
        location_lat: 19.0760,
        location_lng: 72.8777,
        status: 'APPROVED'
      }));
    }
    shops.push(s);
  }

  // 7. INVENTORY (10 for each distributor)
  console.log('[SEED] Seeding Inventory...');
  for (const dist of dists) {
    for (let i = 0; i < 10; i++) {
      const p = prods[i];
      let inv = await invRepo.findOne({ where: { distributor_id: dist.id, product_id: p.id } });
      if (!inv) {
        await invRepo.save(invRepo.create({
          distributor_id: dist.id,
          product_id: p.id,
          quantity: 500,
          reorder_level: 50
        }));
      }
    }
  }

  // 8. ORDERS
  console.log('[SEED] Seeding Orders...');
  for (let i = 1; i <= 20; i++) {
    const s = shops[i % 20];
    const sm = salesmen.find(x => x.id === s.salesman_id);
    const d = dists.find(x => x.id === s.distributor_id);
    let o = await orderRepo.findOne({ where: { shop_id: s.id, total_amount: i * 100 } });
    if (!o) {
      o = await orderRepo.save(orderRepo.create({
        shop_id: s.id,
        salesman_id: sm.id,
        distributor_id: d.id,
        total_amount: i * 100,
        status: i % 2 === 0 ? 'DELIVERED' : 'PENDING'
      }));
      // order items
      await itemRepo.save(itemRepo.create({
        order_id: o.id,
        product_id: prods[i].id,
        quantity: 10,
        unit_price: prods[i].ptr,
        total_price: prods[i].ptr * 10
      }));
    }
  }

  // 9. VISITS, NOTIFS, APPROVALS (Minimal mocks)
  let v = await visitRepo.findOne({ where: { shop_id: shops[0].id } });
  if (!v) {
    await visitRepo.save(visitRepo.create({
      shop_id: shops[0].id,
      salesman_id: shops[0].salesman_id,
      distributor_id: shops[0].distributor_id,
      status: 'COMPLETED'
    }));
  }

  let n = await notifRepo.findOne({ where: { user_id: superAdmin.id } });
  if (!n) {
    await notifRepo.save(notifRepo.create({
      user_id: superAdmin.id,
      title: 'Dev Seed Completed',
      message: 'System seeded successfully',
      is_read: false
    }));
  }

  console.log('[SEED] Development Seeding Finished Successfully!');

  await app.close();
  process.exit(0);
}

bootstrap().catch(err => {
  console.error('[SEED] Failed to run Dev seed:', err);
  process.exit(1);
});
`;

fs.writeFileSync('../Backend/src/database/seeds/dev.seed.ts', code);
console.log('dev.seed.ts created');
