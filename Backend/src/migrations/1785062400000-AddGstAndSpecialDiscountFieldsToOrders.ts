import { MigrationInterface, QueryRunner } from "typeorm";

export class AddGstAndSpecialDiscountFieldsToOrders1785062400000 implements MigrationInterface {
    name = 'AddGstAndSpecialDiscountFieldsToOrders1785062400000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Table: approval_requests
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD COLUMN IF NOT EXISTS "shop_id" uuid`);

        // Table: orders
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "total_gst_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "special_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "special_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "transport_mode" character varying(100) NULL`);

        // Table: order_items
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "gst_percent_snapshot" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "gst_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Table: order_items
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "gst_amount"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "gst_percent_snapshot"`);

        // Table: orders
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "transport_mode"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "special_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "special_discount_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "total_gst_amount"`);

        // Table: approval_requests
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN IF EXISTS "shop_id"`);
    }
}
