import { MigrationInterface, QueryRunner } from "typeorm";

export class ListApiHardeningIndices1781444417776 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Products
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_mfr_cat" ON "products" ("manufacturer_id", "category_id")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_products_created_at" ON "products" ("created_at")`);

        // Orders
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_orders_shop_status" ON "orders" ("shop_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_orders_salesman_status" ON "orders" ("salesman_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_orders_dist_status" ON "orders" ("distributor_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_orders_created_at" ON "orders" ("created_at")`);

        // Inventory
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_inventory_dist_prod" ON "distributor_inventory" ("distributor_id", "product_id")`);

        // Backorders
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_backorders_dist_status" ON "backorders" ("distributor_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_backorders_created_at" ON "backorders" ("created_at")`);

        // Visits
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visits_dist_status" ON "shop_visits" ("distributor_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visits_salesman_status" ON "shop_visits" ("salesman_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_visits_created_at" ON "shop_visits" ("created_at")`);

        // Salesmen
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_salesmen_dist_status" ON "salesmen" ("distributor_id", "approval_status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_salesmen_created_at" ON "salesmen" ("created_at")`);

        // Shops
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shops_dist_status" ON "shops" ("distributor_id", "verification_status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_shops_created_at" ON "shops" ("created_at")`);

        // Approvals
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_approvals_dist_status" ON "approval_requests" ("distributor_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_approvals_mfr_status" ON "approval_requests" ("manufacturer_id", "status")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_approvals_created_at" ON "approval_requests" ("created_at")`);

        // Notifications
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_user_read" ON "notifications" ("recipient_user_id", "is_read")`);
        await queryRunner.query(`CREATE INDEX IF NOT EXISTS "idx_notifications_created_at" ON "notifications" ("created_at")`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_mfr_cat"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_products_created_at"`);
        
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_shop_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_salesman_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_orders_created_at"`);
        
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_inventory_dist_prod"`);
        
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_backorders_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_backorders_created_at"`);
        
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_visits_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_visits_salesman_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_visits_created_at"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "idx_salesmen_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_salesmen_created_at"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "idx_shops_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_shops_created_at"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "idx_approvals_dist_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_approvals_mfr_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_approvals_created_at"`);

        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_user_read"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_notifications_created_at"`);
    }

}
