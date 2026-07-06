import { MigrationInterface, QueryRunner } from "typeorm";

export class DynamicOrderStatuses1783361598814 implements MigrationInterface {
    name = 'DynamicOrderStatuses1783361598814'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."idx_orders_dist_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_salesman_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_shop_status"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "status" TO "status_id"`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "status" TO "status_id"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP COLUMN "old_status"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP COLUMN "new_status"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD "old_status_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD "new_status_id" uuid`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "status_id" uuid`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status_id" uuid`);
        await queryRunner.query(`CREATE INDEX "idx_orders_dist_status" ON "orders"  ("distributor_id", "status_id") `);
        await queryRunner.query(`CREATE INDEX "idx_orders_salesman_status" ON "orders"  ("salesman_id", "status_id") `);
        await queryRunner.query(`CREATE INDEX "idx_orders_shop_status" ON "orders"  ("shop_id", "status_id") `);
        await queryRunner.query(`ALTER TABLE "order_items" ADD CONSTRAINT "FK_47dcedd318024359904428ee524" FOREIGN KEY ("status_id") REFERENCES "order_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "orders" ADD CONSTRAINT "FK_03a801095cb90cf148e474cfcb7" FOREIGN KEY ("status_id") REFERENCES "order_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_7d2e74c3bb25676fef324c29a8c" FOREIGN KEY ("old_status_id") REFERENCES "order_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_a022bca4d88a25444c20693b2be" FOREIGN KEY ("new_status_id") REFERENCES "order_statuses"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_a022bca4d88a25444c20693b2be"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_7d2e74c3bb25676fef324c29a8c"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_03a801095cb90cf148e474cfcb7"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_47dcedd318024359904428ee524"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_shop_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_salesman_status"`);
        await queryRunner.query(`DROP INDEX "public"."idx_orders_dist_status"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD "status_id" character varying(50) NOT NULL DEFAULT 'CREATED'`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN "status_id"`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD "status_id" character varying(50) NOT NULL DEFAULT 'ORDERED'`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP COLUMN "new_status_id"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" DROP COLUMN "old_status_id"`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD "new_status" character varying(50) NOT NULL`);
        await queryRunner.query(`ALTER TABLE "order_status_history" ADD "old_status" character varying(50)`);
        await queryRunner.query(`ALTER TABLE "orders" RENAME COLUMN "status_id" TO "status"`);
        await queryRunner.query(`ALTER TABLE "order_items" RENAME COLUMN "status_id" TO "status"`);
        await queryRunner.query(`CREATE INDEX "idx_orders_shop_status" ON "orders" USING btree ("shop_id", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_orders_salesman_status" ON "orders" USING btree ("salesman_id", "status") `);
        await queryRunner.query(`CREATE INDEX "idx_orders_dist_status" ON "orders" USING btree ("distributor_id", "status") `);
    }

}
