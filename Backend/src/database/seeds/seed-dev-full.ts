import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ObjectLiteral, Repository, DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';

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
import { ApprovalRequest } from '../../approval/approval-request.entity';
import { UploadedFile } from '../../shop-image/uploaded-file.entity';
import { LocationLog } from '../../location/location-log.entity';
import { WorkingDay } from '../../working-day/working-day.entity';
import { City } from '../../region/entities/city.entity';
import { State } from '../../region/entities/state.entity';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);

  const getRepo = <Entity extends ObjectLiteral>(
    entityClass: new () => Entity,
  ): Repository<Entity> => {
    return app.get(getRepositoryToken(entityClass));
  };

  const dataSource = app.get(DataSource);

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
  const apprRepo = getRepo(ApprovalRequest);
  const fileRepo = getRepo(UploadedFile);
  const locRepo = getRepo(LocationLog);
  const wdRepo = getRepo(WorkingDay);

  console.log('[SEED] Starting Comprehensive Dev Seeding Process...');

  // --- WIPE ALL DATA ---
  console.log('[SEED] Wiping existing data (CASCADE)...');
  const entities = [
    'order_items', 'orders', 'shop_visits', 'distributor_inventory',
    'shops', 'products', 'product_categories', 'salesmen',
    'manufacturer_distributors', 'distributors', 'manufacturers',
    'approval_requests', 'uploaded_files', 'location_logs', 'latest_locations',
    'working_days', 'users'
  ];
  for (const table of entities) {
    try {
      await dataSource.query(`TRUNCATE TABLE "${table}" CASCADE;`);
    } catch (e) {
      // ignore if doesn't exist
    }
  }

  const hash = async (pw: string) => bcrypt.hash(pw, 10);
  const universalPassword = 'Password@123';
  const hashedPw = await hash(universalPassword);

  const randomApproval = () => {
    const r = Math.random();
    if (r < 0.8) return 'APPROVED';
    if (r < 0.9) return 'PENDING_APPROVAL';
    return 'REJECTED';
  };

  // --- SUPER ADMIN ---
  console.log('[SEED] Creating SUPER_ADMIN...');
  const superAdmin = await userRepo.save(
    userRepo.create({
      full_name: 'Super Admin',
      email: 'admin@vikassales.local',
      phone: '9999999999',
      password_hash: hashedPw,
      role: 'SUPER_ADMIN',
      approval_status: 'APPROVED',
      is_active: true,
    })
  );

  // --- PHASE 1 & 2: MASTER DATA & APPROVALS ---
  
  // 20 Manufacturers
  console.log('[SEED] Creating 20 Manufacturers...');
  const mfrs: Manufacturer[] = [];
  for (let i = 0; i < 20; i++) {
    const status = randomApproval();
    const u = await userRepo.save(
      userRepo.create({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.string.numeric(10),
        password_hash: hashedPw,
        role: 'MANUFACTURER_ADMIN',
        approval_status: status,
        is_active: true,
      })
    );
    const mfr = await mfrRepo.save(
      mfrRepo.create({
        user_id: u.id,
        company_name: faker.company.name() + ' Mfg',
        gst_number: '27AABCU' + faker.string.numeric(4) + 'R1Z' + faker.string.alpha(1).toUpperCase(),
        address: faker.location.streetAddress(),
        contact_person: u.full_name,
        phone: u.phone,
        email: u.email,
        city: faker.location.city(),
        state: faker.location.state(),
        country: 'India',
        is_active: status === 'APPROVED',
      })
    );
    mfrs.push(mfr);

    if (status === 'PENDING_APPROVAL') {
      await apprRepo.save(apprRepo.create({
        request_type: 'MANUFACTURER_APPROVAL',
        manufacturer_id: mfr.id,
        requester_user_id: u.id,
        status: 'PENDING',
      }));
    }
  }

  // 100 Distributors
  console.log('[SEED] Creating 100 Distributors...');
  const dists: Distributor[] = [];
  for (let i = 0; i < 100; i++) {
    const status = randomApproval();
    const u = await userRepo.save(
      userRepo.create({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.string.numeric(10),
        password_hash: hashedPw,
        role: 'DISTRIBUTOR_ADMIN',
        approval_status: status,
        is_active: true,
      })
    );
    const dist = await distRepo.save(
      distRepo.create({
        user_id: u.id,
        business_name: faker.company.name() + ' Agencies',
        owner_name: u.full_name,
        phone: u.phone,
        email: u.email,
        gst_number: '27DABCU' + faker.string.numeric(4) + 'R1Z' + faker.string.alpha(1).toUpperCase(),
        city: faker.location.city(),
        state: faker.location.state(),
        address: faker.location.streetAddress(),
        country: 'India',
        approval_status: status,
        approved_by_user_id: status === 'APPROVED' ? superAdmin.id : undefined,
        approved_at: status === 'APPROVED' ? new Date() : undefined,
        is_active: status === 'APPROVED',
      })
    );
    dists.push(dist);

    if (status === 'PENDING_APPROVAL') {
      await apprRepo.save(apprRepo.create({
        request_type: 'DISTRIBUTOR_APPROVAL',
        distributor_id: dist.id,
        requester_user_id: u.id,
        status: 'PENDING',
      }));
    }
  }

  // Link Mfrs and Dists (5 to 15 each)
  console.log('[SEED] Linking Manufacturers and Distributors...');
  for (const mfr of mfrs) {
    const linkCount = faker.number.int({ min: 5, max: 15 });
    const shuffledDists = [...dists].sort(() => 0.5 - Math.random());
    const selectedDists = shuffledDists.slice(0, linkCount);

    for (const dist of selectedDists) {
      await mdRepo.save(mdRepo.create({
        manufacturer_id: mfr.id,
        distributor_id: dist.id,
        status: 'ACTIVE',
        approved_by_user_id: superAdmin.id,
        approved_at: new Date(),
      }));
    }
  }

  // 200 Salesmen
  console.log('[SEED] Creating 200 Salesmen...');
  const salesmen: Salesman[] = [];
  const salesmanWorkingDays: Record<string, { active?: string, completed?: string }> = {};
  for (let i = 0; i < 200; i++) {
    const status = randomApproval();
    const dist = faker.helpers.arrayElement(dists); // Assign to random dist
    const u = await userRepo.save(
      userRepo.create({
        full_name: faker.person.fullName(),
        email: faker.internet.email().toLowerCase(),
        phone: faker.string.numeric(10),
        password_hash: hashedPw,
        role: 'SALESMAN',
        approval_status: status,
        is_active: true,
      })
    );
    const sm = await salesRepo.save(
      salesRepo.create({
        user_id: u.id,
        full_name: u.full_name,
        phone: u.phone,
        email: u.email,
        distributor_id: dist.id,
        approval_status: status,
        approved_by_user_id: status === 'APPROVED' ? superAdmin.id : undefined,
        approved_at: status === 'APPROVED' ? new Date() : undefined,
        is_active: status === 'APPROVED',
      })
    );
    salesmen.push(sm);

    if (status === 'APPROVED') {
      salesmanWorkingDays[sm.id] = {};
      const cwd = await wdRepo.save(wdRepo.create({
        salesman_id: sm.id,
        distributor_id: sm.distributor_id,
        check_in_at: new Date(Date.now() - 86400000 * 2),
        check_out_at: new Date(Date.now() - 86400000 * 2 + 36000000),
        status: 'COMPLETED',
      }));
      salesmanWorkingDays[sm.id].completed = cwd.id;

      if (Math.random() > 0.5) {
        const awd = await wdRepo.save(wdRepo.create({
          salesman_id: sm.id,
          distributor_id: sm.distributor_id,
          check_in_at: new Date(),
          status: 'ACTIVE',
        }));
        salesmanWorkingDays[sm.id].active = awd.id;
      }
    }

    if (status === 'PENDING_APPROVAL') {
      await apprRepo.save(apprRepo.create({
        request_type: 'SALESMAN_APPROVAL',
        salesman_id: sm.id,
        requester_user_id: u.id,
        status: 'PENDING',
      }));
    }
  }

  // --- PHASE 3: PRODUCT DATA ---
  console.log('[SEED] Creating 20 Categories & 200 Products...');
  const cats: ProductCategory[] = [];
  for (let i = 0; i < 20; i++) {
    const catName = faker.commerce.department() + ' ' + faker.string.nanoid(4);
    const insertResult = await catRepo.createQueryBuilder()
      .insert()
      .into(ProductCategory)
      .values({ name: catName })
      .returning('id')
      .execute();
    cats.push({ id: insertResult.identifiers[0].id } as ProductCategory);
  }

  const products: Product[] = [];
  for (let i = 0; i < 200; i++) {
    const mfr = faker.helpers.arrayElement(mfrs);
    const cat = faker.helpers.arrayElement(cats);
    const p = await prodRepo.save(
      prodRepo.create({
        product_source: 'INTERNAL',
        manufacturer_id: mfr.id,
        category_id: cat.id,
        name: faker.commerce.productName(),
        sku: faker.string.alphanumeric(10).toUpperCase(),
        description: faker.commerce.productDescription(),
        mrp: parseFloat(faker.commerce.price({ min: 10, max: 5000 })),
        gst_percent: faker.helpers.arrayElement([5, 12, 18, 28]),
        distributor_discount_percent: faker.number.int({ min: 0, max: 20 }),
        special_discount_percent: faker.number.int({ min: 0, max: 10 }),
        is_active: faker.datatype.boolean({ probability: 0.9 }),
      })
    );
    products.push(p);

    // Mock Product Image
    await fileRepo.createQueryBuilder()
      .insert()
      .into(UploadedFile)
      .values({
        uploaded_by_user_id: mfr.user_id,
        entity_type: 'PRODUCT',
        entity_id: p.id,
        file_type: 'IMAGE',
        original_file_name: 'product.jpg',
        file_url: faker.image.urlLoremFlickr({ category: 'product' }),
        compression_applied: true,
      })
      .execute();
  }

  // --- PHASE 4: SHOP DATA ---
  console.log('[SEED] Creating 400 Shops...');
  const cityRepo = getRepo(City);
  const citiesList = await cityRepo.find({ relations: { state: true } });

  const shops: Shop[] = [];
  for (let i = 0; i < 400; i++) {
    const sm = faker.helpers.arrayElement(salesmen);
    const status = faker.helpers.arrayElement(['VERIFIED', 'PENDING', 'REJECTED']);
    const randomCity = faker.helpers.arrayElement(citiesList);
    
    // Generate valid Indian lat/lng roughly
    const lat = faker.location.latitude({ max: 30, min: 10 });
    const lng = faker.location.longitude({ max: 90, min: 70 });

    const s = await shopRepo.save(
      shopRepo.create({
        created_by_salesman_id: sm.id,
        distributor_id: sm.distributor_id,
        name: faker.company.name() + ' Store',
        owner_name: faker.person.fullName(),
        phone: faker.string.numeric(10),
        address: faker.location.streetAddress(),
        city_name: randomCity.name,
        state_name: randomCity.state?.name || 'Maharashtra',
        city_id: randomCity.id,
        state_id: randomCity.state_id,
        verification_photo_url: faker.image.urlLoremFlickr({ category: 'shop' }),
        verification_status: status as any,
        is_active: status === 'VERIFIED',
      })
    );
    shops.push(s);

    // Location Log entry for shop
    const wd = salesmanWorkingDays[sm.id];
    await locRepo.save(locRepo.create({
      salesman_id: sm.id,
      distributor_id: sm.distributor_id,
      working_day_id: wd?.active || wd?.completed,
      event_type: 'SHOP_CREATION',
      location: { type: 'Point', coordinates: [lng, lat] },
      captured_at: new Date(),
    }));

    // Mock Shop Verification Image
    await fileRepo.createQueryBuilder()
      .insert()
      .into(UploadedFile)
      .values({
        uploaded_by_user_id: sm.user_id,
        entity_type: 'SHOP',
        entity_id: s.id,
        file_type: 'IMAGE',
        original_file_name: 'shop_front.jpg',
        file_url: s.verification_photo_url ?? undefined,
        compression_applied: true,
      })
      .execute();
  }

  // --- PHASE 7: INVENTORY ---
  console.log('[SEED] Creating 200 Inventory Items...');
  for (let i = 0; i < 200; i++) {
    const dist = faker.helpers.arrayElement(dists);
    const prod = faker.helpers.arrayElement(products);
    
    // Scenarios: low stock, high stock, out of stock
    const qty = faker.helpers.arrayElement([0, faker.number.int({ min: 1, max: 20 }), faker.number.int({ min: 100, max: 1000 })]);
    
    // Ensure no duplicates per dist/prod combo
    const exists = await invRepo.findOne({ where: { distributor_id: dist.id, product_id: prod.id }});
    if (!exists) {
      await invRepo.save(invRepo.create({
        distributor_id: dist.id,
        product_id: prod.id,
        available_quantity: qty,
        low_stock_threshold: 50,
        reserved_quantity: faker.number.int({ min: 0, max: 10 }),
      }));
    }
  }

  // --- PHASE 5 & 6: VISITS & ORDERS ---
  console.log('[SEED] Creating 500 Visits and 500 Orders...');
  for (let i = 0; i < 500; i++) {
    const shop = faker.helpers.arrayElement(shops);
    const smId = shop.created_by_salesman_id;
    if (!smId) continue;
    
    const wd = salesmanWorkingDays[smId];
    const visitStatus = faker.helpers.arrayElement(['COMPLETED', 'MISSED', 'ACTIVE']);
    const assignedWdId = visitStatus === 'ACTIVE' ? (wd?.active || wd?.completed) : (wd?.completed || wd?.active);
    
    const v = await visitRepo.save(visitRepo.create({
      shop_id: shop.id,
      salesman_id: smId,
      distributor_id: shop.distributor_id,
      working_day_id: assignedWdId,
      status: visitStatus as any,
      started_at: new Date(Date.now() - faker.number.int({ min: 1000000, max: 100000000 })),
      ended_at: visitStatus === 'COMPLETED' ? new Date() : undefined,
      is_offline_created: false,
    }));

    if (visitStatus === 'COMPLETED') {
      // Create an order for completed visits
      const orderStatus = faker.helpers.arrayElement(['PENDING', 'DELIVERED', 'CANCELLED']);
      
      const o = await orderRepo.save(orderRepo.create({
        order_number: 'ORD-' + faker.string.alphanumeric(8).toUpperCase(),
        shop_id: shop.id,
        visit_id: v.id,
        salesman_id: smId,
        distributor_id: shop.distributor_id,
        // Optional manufacturer_id link
        manufacturer_id: products[0].manufacturer_id, 
        gross_order_amount: 0, // Calculated below
        final_order_amount: 0,
        status: orderStatus as any,
      }));

      // Add 1 to 5 random items
      let totalAmount = 0;
      let totalQty = 0;
      const itemCount = faker.number.int({ min: 1, max: 5 });
      for (let j = 0; j < itemCount; j++) {
        const prod = faker.helpers.arrayElement(products);
        const qty = faker.number.int({ min: 1, max: 50 });
        const lineAmount = prod.mrp * qty;
        totalAmount += lineAmount;
        totalQty += qty;

        await itemRepo.save(itemRepo.create({
          order_id: o.id,
          product_id: prod.id,
          product_name_snapshot: prod.name,
          sku_snapshot: prod.sku || '',
          manufacturer_name_snapshot: 'Vikas Industries',
          quantity: qty,
          mrp: prod.mrp,
          gross_line_amount: lineAmount,
          net_line_amount: lineAmount,
        }));
      }

      // Update order totals
      o.gross_order_amount = totalAmount;
      o.final_order_amount = totalAmount;
      o.total_quantity = totalQty;
      await orderRepo.save(o);
    }
  }

  console.log('[SEED] Comprehensive Development Seeding Finished Successfully!');

  await app.close();
  process.exit(0);
}

bootstrap().catch((err) => {
  console.error('[SEED] Failed to run Comprehensive Dev seed:', err);
  process.exit(1);
});
