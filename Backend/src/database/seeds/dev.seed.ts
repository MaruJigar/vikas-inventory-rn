import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository } from 'typeorm';
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
import { City } from '../../region/entities/city.entity';
import { State } from '../../region/entities/state.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const getRepo = <Entity extends ObjectLiteral>(
    entityClass: new () => Entity,
  ): Repository<Entity> => {
    return app.get(getRepositoryToken(entityClass));
  };

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

  const hash = async (pw: string) => bcrypt.hash(pw, 10);
  const passAdmin = process.env.SUPER_ADMIN_PASSWORD || 'Admin@123';
  const passMfr = process.env.MANUFACTURER_ADMIN_PASSWORD || 'Password@123';
  const passDist = process.env.DISTRIBUTOR_ADMIN_PASSWORD || 'Password@123';
  const passSales = process.env.SALESMAN_PASSWORD || 'Password@123';

  // 1. SUPER_ADMIN
  let superAdmin = await userRepo.findOne({ where: { role: 'SUPER_ADMIN' } });
  if (!superAdmin) {
    const adminDraft = userRepo.create({
      full_name: process.env.SUPER_ADMIN_NAME || 'System Administrator',
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@vikassales.local',
      phone: process.env.SUPER_ADMIN_PHONE || '9999999999',
      password_hash: await hash(passAdmin),
      role: 'SUPER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true,
    });
    superAdmin = await userRepo.save(adminDraft);
  }
  if (!superAdmin) throw new Error('Failed to seed Super Admin');

  // 2. MANUFACTURER_ADMIN
  let mfrUser = await userRepo.findOne({
    where: { role: 'MANUFACTURER_ADMIN' },
  });
  if (!mfrUser) {
    const mfrUserDraft = userRepo.create({
      full_name: 'Dev Manufacturer',
      email:
        process.env.MANUFACTURER_ADMIN_EMAIL || 'manufacturer@vikassales.local',
      phone: '8888888888',
      password_hash: await hash(passMfr),
      role: 'MANUFACTURER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true,
    });
    mfrUser = await userRepo.save(mfrUserDraft);
  }
  if (!mfrUser) throw new Error('Failed to seed Manufacturer User');

  let mfr = await mfrRepo.findOne({ where: { user_id: mfrUser.id } });
  if (!mfr) {
    const mfrDraft = mfrRepo.create({
      user_id: mfrUser.id,
      company_name: 'Vikas Industries Ltd',
      gst_number: '27AABCU9603R1ZX',
      address: 'Industrial Estate, Mumbai',
      contact_person: 'Mr. Vikas',
      phone: '8888888888',
      email: mfrUser.email,
      city: 'Mumbai',
      state: 'Maharashtra',
      country: 'India',
      is_active: true,
    });
    mfr = await mfrRepo.save(mfrDraft);
  }
  if (!mfr) throw new Error('Failed to seed Manufacturer');

  // 3. DISTRIBUTOR_ADMIN (2)
  const distUsers: User[] = [];
  for (let i = 1; i <= 2; i++) {
    const email =
      i === 1
        ? process.env.DISTRIBUTOR_ADMIN_EMAIL || 'distributor@vikassales.local'
        : `distributor${i}@vikassales.local`;
    let distUser = await userRepo.findOne({ where: { email } });
    if (!distUser) {
      const distUserDraft = userRepo.create({
        full_name: `Dev Distributor ${i}`,
        email,
        phone: `777777777${i}`,
        password_hash: await hash(passDist),
        role: 'DISTRIBUTOR_ADMIN',
        approval_status: 'APPROVED',
        is_active: true,
      });
      distUser = await userRepo.save(distUserDraft);
    }
    if (!distUser) throw new Error(`Failed to seed Distributor User ${i}`);
    distUsers.push(distUser);
  }

  const dists: Distributor[] = [];
  for (const du of distUsers) {
    let dist = await distRepo.findOne({ where: { user_id: du.id } });
    if (!dist) {
      const distDraft = distRepo.create({
        user_id: du.id,
        business_name: `Agency ${du.full_name}`,
        owner_name: du.full_name,
        phone: du.phone,
        email: du.email,
        gst_number: `27AABCU000${du.id.substring(0, 2)}R1ZX`,
        city: 'Pune',
        state: 'Maharashtra',
        address: 'Market Yard',
        country: 'India',
        approval_status: 'APPROVED',
        approved_by_user_id: superAdmin.id,
        approved_at: new Date(),
        is_active: true,
      });
      dist = await distRepo.save(distDraft);
    }
    if (!dist) throw new Error('Failed to seed Distributor');
    dists.push(dist);

    const md = await mdRepo.findOne({
      where: { manufacturer_id: mfr.id, distributor_id: dist.id },
    });
    if (!md) {
      const mdDraft = mdRepo.create({
        manufacturer_id: mfr.id,
        distributor_id: dist.id,
        status: 'ACTIVE',
        approved_by_user_id: superAdmin.id,
        approved_at: new Date(),
      });
      await mdRepo.save(mdDraft);
    }
  }

  // 4. SALESMAN (5)
  const salesUsers: User[] = [];
  for (let i = 1; i <= 5; i++) {
    const email =
      i === 1
        ? process.env.SALESMAN_EMAIL || 'salesman@vikassales.local'
        : `salesman${i}@vikassales.local`;
    let saleUser = await userRepo.findOne({ where: { email } });
    if (!saleUser) {
      const saleUserDraft = userRepo.create({
        full_name: `Dev Salesman ${i}`,
        email,
        phone: `666666666${i}`,
        password_hash: await hash(passSales),
        role: 'SALESMAN',
        approval_status: 'APPROVED',
        is_active: true,
      });
      saleUser = await userRepo.save(saleUserDraft);
    }
    if (!saleUser) throw new Error(`Failed to seed Salesman User ${i}`);
    salesUsers.push(saleUser);
  }

  const salesmen: Salesman[] = [];
  for (let i = 0; i < salesUsers.length; i++) {
    const su = salesUsers[i];
    let sm = await salesRepo.findOne({ where: { user_id: su.id } });
    if (!sm) {
      const smDraft = salesRepo.create({
        user_id: su.id,
        full_name: su.full_name,
        phone: su.phone,
        email: su.email,
        distributor_id: dists[i % 2].id, // Alternate distributors
        approval_status: 'APPROVED',
        approved_by_user_id: superAdmin.id,
        approved_at: new Date(),
        is_active: true,
      });
      sm = await salesRepo.save(smDraft);
    }
    if (!sm) throw new Error('Failed to seed Salesman');
    salesmen.push(sm);
  }

  // 5. PRODUCTS & CATEGORIES
  console.log('[SEED] Seeding Products...');
  const catNames = ['Electronics', 'FMCG', 'Hardware', 'Automotive', 'Apparel'];
  const cats: ProductCategory[] = [];
  for (const name of catNames) {
    let c = await catRepo.findOne({ where: { name } });
    if (!c) {
      const insertResult = await catRepo.createQueryBuilder()
        .insert()
        .into(ProductCategory)
        .values({ name })
        .returning('id')
        .execute();
      c = await catRepo.findOne({ where: { id: insertResult.identifiers[0].id } });
    }
    if (!c) throw new Error('Failed to seed Product Category');
    cats.push(c);
  }

  const prods: Product[] = [];
  for (let i = 1; i <= 50; i++) {
    const sku = `SKU-${1000 + i}`;
    let p = await prodRepo.findOne({ where: { sku } });
    if (!p) {
      const prodDraft = prodRepo.create({
        product_source: 'INTERNAL',
        manufacturer_id: mfr.id,
        category_id: cats[i % 5].id,
        name: `Dev Product ${i}`,
        sku,
        description: 'Sample description',
        mrp: parseFloat((100 + i * 10).toFixed(2)),
        gst_percent: 18.0,
        distributor_discount_percent: 0,
        special_discount_percent: 0,
        is_active: true,
      });
      p = await prodRepo.save(prodDraft);
    }
    if (!p) throw new Error('Failed to seed Product');
    prods.push(p);
  }

  // 6. SHOPS
  console.log('[SEED] Seeding Shops...');
  const cityRepo = getRepo(City);
  const stateRepo = getRepo(State);
  const puneCity = await cityRepo.findOne({ where: { name: 'Pune' } });
  const maharashtraState = await stateRepo.findOne({ where: { name: 'Maharashtra' } });

  const shops: Shop[] = [];
  for (let i = 1; i <= 20; i++) {
    const mobile = `55555555${String(i).padStart(2, '0')}`;
    let s = await shopRepo.findOne({ where: { phone: mobile } });
    if (!s) {
      const shopDraft = shopRepo.create({
        created_by_salesman_id: salesmen[i % 5].id,
        distributor_id: salesmen[i % 5].distributor_id,
        name: `Dev Shop ${i}`,
        owner_name: `Owner ${i}`,
        phone: mobile,
        address: `Shop Address ${i}`,
        city_name: 'Pune',
        state_name: 'Maharashtra',
        city_id: puneCity?.id,
        state_id: maharashtraState?.id,
        verification_photo_url: 'https://example.com/shop.jpg',
        verification_status: 'VERIFIED',
        is_active: true,
      });
      s = await shopRepo.save(shopDraft);
    }
    if (!s) throw new Error('Failed to seed Shop');
    shops.push(s);
  }

  // 7. INVENTORY (10 for each distributor)
  console.log('[SEED] Seeding Inventory...');
  for (const dist of dists) {
    for (let i = 0; i < 10; i++) {
      const p = prods[i];
      const inv = await invRepo.findOne({
        where: { distributor_id: dist.id, product_id: p.id },
      });
      if (!inv) {
        const invDraft = invRepo.create({
          distributor_id: dist.id,
          product_id: p.id,
          available_quantity: 500,
          low_stock_threshold: 50,
          reserved_quantity: 0,
          backordered_quantity: 0,
        });
        await invRepo.save(invDraft);
      }
    }
  }

  // 8. ORDERS
  console.log('[SEED] Seeding Orders...');
  for (let i = 1; i <= 20; i++) {
    const s = shops[i % 20];
    const sm = salesmen.find((x) => x.id === s.created_by_salesman_id);
    const d = dists.find((x) => x.id === s.distributor_id);
    if (!sm || !d)
      throw new Error('Failed to resolve salesmen or distributor for order.');

    // Create visit first
    let v = await visitRepo.findOne({
      where: { shop_id: s.id, status: 'COMPLETED' },
    });
    if (!v) {
      const visitDraft = visitRepo.create({
        shop_id: s.id,
        salesman_id: sm.id,
        distributor_id: d.id,
        status: 'COMPLETED',
        started_at: new Date(),
        ended_at: new Date(),
        start_location: { type: 'Point', coordinates: [72.8777, 19.076] },
        end_location: { type: 'Point', coordinates: [72.8777, 19.076] },
        is_offline_created: false,
      });
      v = await visitRepo.save(visitDraft);
    }
    if (!v) throw new Error('Failed to seed Visit');

    const order_number = `ORD-${10000 + i}`;
    let o = await orderRepo.findOne({ where: { order_number } });
    if (!o) {
      const orderDraft = orderRepo.create({
        order_number,
        shop_id: s.id,
        visit_id: v.id,
        salesman_id: sm.id,
        distributor_id: d.id,
        manufacturer_id: mfr.id,
        gross_order_amount: i * 100,
        final_order_amount: i * 100,
        total_product_discount_amount: 0,
        bill_discount_type: 'NONE',
        bill_discount_value: 0,
        bill_discount_amount: 0,
        total_quantity: 10,
        total_backordered_quantity: 0,
        is_offline_created: false,
        post_dispatch_edited: false,
        post_delivery_edited: false,
        status: i % 2 === 0 ? 'DELIVERED' : 'PENDING',
      });
      o = await orderRepo.save(orderDraft);
      if (!o) throw new Error('Failed to seed Order');

      // order items
      const itemDraft = itemRepo.create({
        order_id: o.id,
        product_id: prods[i].id,
        product_name_snapshot: prods[i].name,
        sku_snapshot: prods[i].sku || '',
        manufacturer_name_snapshot: 'Vikas Industries Ltd',
        quantity: 10,
        mrp: prods[i].mrp,
        gross_line_amount: prods[i].mrp * 10,
        net_line_amount: prods[i].mrp * 10,
        item_discount_type: 'NONE',
        item_discount_value: 0,
        item_discount_amount: 0,
        reserved_quantity: 0,
        backordered_quantity: 0,
        dispatched_quantity: 0,
        delivered_quantity: 0,
        status: 'ORDERED',
      });
      await itemRepo.save(itemDraft);
    }
  }

  // 9. VISITS, NOTIFS, APPROVALS (Minimal mocks)
  const v = await visitRepo.findOne({ where: { shop_id: shops[0].id } });
  if (!v) {
    const shop0 = shops[0];
    if (!shop0.created_by_salesman_id)
      throw new Error('Shop missing salesman id');
    const visitDraft = visitRepo.create({
      shop_id: shop0.id,
      salesman_id: shop0.created_by_salesman_id,
      distributor_id: shop0.distributor_id,
      status: 'COMPLETED',
      started_at: new Date(),
      is_offline_created: false,
    });
    await visitRepo.save(visitDraft);
  }

  const n = await notifRepo.findOne({
    where: { recipient_user_id: superAdmin.id },
  });
  if (!n) {
    const notifDraft = notifRepo.create({
      recipient_user_id: superAdmin.id,
      recipient_role: superAdmin.role,
      title: 'Dev Seed Completed',
      message: 'System seeded successfully',
      type: 'SYSTEM',
      is_read: false,
      firebase_sent: false,
      socket_sent: false,
    });
    await notifRepo.save(notifDraft);
  }

  console.log('[SEED] Development Seeding Finished Successfully!');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[SEED] Failed to run Dev seed:', err);
  process.exit(1);
});
