import { MigrationInterface, QueryRunner } from 'typeorm';

export class Orders1781416495400 implements MigrationInterface {
  name = 'Orders1781416495400';

  async up(queryRunner: QueryRunner): Promise<void> {
    // orders
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "orders" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_number" VARCHAR(100) UNIQUE NOT NULL,
        "visit_id" UUID NOT NULL REFERENCES "shop_visits"("id"),
        "shop_id" UUID NOT NULL REFERENCES "shops"("id"),
        "salesman_id" UUID NOT NULL REFERENCES "salesmen"("id"),
        "distributor_id" UUID NOT NULL REFERENCES "distributors"("id"),
        "manufacturer_id" UUID REFERENCES "manufacturers"("id"),
        "status" VARCHAR(50) NOT NULL DEFAULT 'CREATED',
        "gross_order_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "total_product_discount_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "bill_discount_type" VARCHAR(50) DEFAULT 'NONE',
        "bill_discount_value" NUMERIC(12,2) DEFAULT 0,
        "bill_discount_amount" NUMERIC(12,2) DEFAULT 0,
        "final_order_amount" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "total_quantity" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "total_backordered_quantity" NUMERIC(12,2) NOT NULL DEFAULT 0,
        "is_offline_created" BOOLEAN DEFAULT FALSE,
        "idempotency_key" VARCHAR(200),
        "post_dispatch_edited" BOOLEAN DEFAULT FALSE,
        "post_delivery_edited" BOOLEAN DEFAULT FALSE,
        "cancelled_at" TIMESTAMP NULL,
        "cancelled_by_user_id" UUID REFERENCES "users"("id"),
        "cancellation_reason" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "deleted_at" TIMESTAMP NULL
      );
    `);

    await queryRunner.query(`CREATE INDEX "idx_orders_visit_id" ON "orders"("visit_id");`);
    await queryRunner.query(`CREATE INDEX "idx_orders_salesman_id" ON "orders"("salesman_id");`);
    await queryRunner.query(`CREATE INDEX "idx_orders_distributor_id" ON "orders"("distributor_id");`);
    await queryRunner.query(`CREATE INDEX "idx_orders_status" ON "orders"("status");`);
    await queryRunner.query(`
      CREATE UNIQUE INDEX "idx_orders_idempotency_key"
      ON "orders"("idempotency_key")
      WHERE "idempotency_key" IS NOT NULL;
    `);

    // order_items
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_items" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id"),
        "product_id" UUID NOT NULL REFERENCES "products"("id"),
        "product_name_snapshot" VARCHAR(200) NOT NULL,
        "sku_snapshot" VARCHAR(100),
        "manufacturer_name_snapshot" VARCHAR(200),
        "quantity" NUMERIC(12,2) NOT NULL,
        "mrp" NUMERIC(12,2) NOT NULL,
        "gross_line_amount" NUMERIC(12,2) NOT NULL,
        "item_discount_type" VARCHAR(50) DEFAULT 'NONE',
        "item_discount_value" NUMERIC(12,2) DEFAULT 0,
        "item_discount_amount" NUMERIC(12,2) DEFAULT 0,
        "net_line_amount" NUMERIC(12,2) NOT NULL,
        "reserved_quantity" NUMERIC(12,2) DEFAULT 0,
        "backordered_quantity" NUMERIC(12,2) DEFAULT 0,
        "dispatched_quantity" NUMERIC(12,2) DEFAULT 0,
        "delivered_quantity" NUMERIC(12,2) DEFAULT 0,
        "status" VARCHAR(50) DEFAULT 'ORDERED',
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_order_items_order_id" ON "order_items"("order_id");`);

    // order_revisions
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_revisions" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id"),
        "revision_number" INTEGER NOT NULL,
        "old_data" JSONB NOT NULL,
        "new_data" JSONB NOT NULL,
        "changed_fields" JSONB,
        "changed_by_user_id" UUID REFERENCES "users"("id"),
        "changed_by_role" VARCHAR(50),
        "order_status_at_time" VARCHAR(50),
        "inventory_impact" JSONB,
        "distributor_notified" BOOLEAN DEFAULT FALSE,
        "reason" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        UNIQUE("order_id", "revision_number")
      );
    `);

    // order_status_history
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "order_status_history" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id"),
        "old_status" VARCHAR(50),
        "new_status" VARCHAR(50) NOT NULL,
        "changed_by_user_id" UUID REFERENCES "users"("id"),
        "reason" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);

    // backorders
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "backorders" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id"),
        "order_item_id" UUID REFERENCES "order_items"("id"),
        "product_id" UUID NOT NULL REFERENCES "products"("id"),
        "distributor_id" UUID NOT NULL REFERENCES "distributors"("id"),
        "quantity" NUMERIC(12,2) NOT NULL,
        "status" VARCHAR(50) NOT NULL DEFAULT 'OPEN',
        "resolved_quantity" NUMERIC(12,2) DEFAULT 0,
        "resolved_at" TIMESTAMP NULL,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_backorders_order_id" ON "backorders"("order_id");`);
    await queryRunner.query(`CREATE INDEX "idx_backorders_distributor_id" ON "backorders"("distributor_id");`);
    await queryRunner.query(`CREATE INDEX "idx_backorders_status" ON "backorders"("status");`);

    // fulfillment_logs
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "fulfillment_logs" (
        "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        "order_id" UUID NOT NULL REFERENCES "orders"("id"),
        "order_item_id" UUID REFERENCES "order_items"("id"),
        "distributor_id" UUID NOT NULL REFERENCES "distributors"("id"),
        "action" VARCHAR(50) NOT NULL,
        "quantity" NUMERIC(12,2),
        "old_status" VARCHAR(50),
        "new_status" VARCHAR(50),
        "performed_by_user_id" UUID REFERENCES "users"("id"),
        "notes" TEXT,
        "created_at" TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "fulfillment_logs";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "backorders";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_status_history";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_revisions";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "order_items";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "orders";`);
  }
}
