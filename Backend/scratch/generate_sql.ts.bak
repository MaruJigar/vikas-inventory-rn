import { DataSource } from 'typeorm';
import { AnalyticsService } from './src/analytics/analytics.service';
import { Order } from './src/order/order.entity';
import { ShopVisit } from './src/visit/shop-visit.entity';
import { DistributorInventory } from './src/inventory/distributor-inventory.entity';
import { Backorder } from './src/order/backorder.entity';
import { ApprovalRequest } from './src/approval/approval-request.entity';
import { WorkingDay } from './src/working-day/working-day.entity';
import { Notification } from './src/notification/notification.entity';
import { InventoryMovement } from './src/inventory/inventory-movement.entity';
import { User } from './src/user/user.entity';
import { Distributor } from './src/distributor/distributor.entity';
import { Salesman } from './src/salesman/salesman.entity';
import { Manufacturer } from './src/manufacturer/manufacturer.entity';
import { ProductCategory } from './src/product/product-category.entity';
import { Product } from './src/product/product.entity';
import { ProductPriceHistory } from './src/product-pricing/product-price-history.entity';
import { Shop } from './src/shop/shop.entity';

async function run() {
  const dataSource = new DataSource({
    type: 'postgres',
    entities: [Order, ShopVisit, DistributorInventory, Backorder, ApprovalRequest, WorkingDay, Notification, InventoryMovement, User, Distributor, Salesman, Manufacturer, ProductCategory, Product, ProductPriceHistory, Shop],
    synchronize: false,
  });

  await dataSource.initialize();
  
  const orderRepo = dataSource.getRepository(Order);
  const qb = orderRepo.createQueryBuilder('order');
  
  const salesSubquery = `SELECT s.id FROM salesmen s WHERE s.user_id = :userId`;
  qb.andWhere(`order.salesman_id IN (${salesSubquery})`, { userId: '123' });
  
  console.log("SQL SALESMAN:", qb.getSql());
  
  const qb2 = orderRepo.createQueryBuilder('order');
  const distSubquery = `SELECT d.id FROM distributors d WHERE d.user_id = :userId`;
  qb2.andWhere(`order.distributor_id IN (${distSubquery})`, { userId: '123' });
  console.log("SQL DISTRIBUTOR:", qb2.getSql());

  const qb3 = orderRepo.createQueryBuilder('order');
  const qbSubquery = `
    SELECT md.distributor_id
    FROM manufacturer_distributors md
    INNER JOIN manufacturers m ON m.id = md.manufacturer_id
    WHERE m.user_id = :userId
  `;
  qb3.andWhere(`order.distributor_id IN (${qbSubquery})`, { userId: '123' });
  console.log("SQL MANUFACTURER:", qb3.getSql());
  
  await dataSource.destroy();
}

run();
