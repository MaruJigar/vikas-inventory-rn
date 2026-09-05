import { MigrationInterface, QueryRunner } from "typeorm";

export class RefactorDiscounts1784210402476 implements MigrationInterface {
    name = 'RefactorDiscounts1784210402476'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "item_discount_value"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "item_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "order_items" DROP COLUMN IF EXISTS "item_discount_type"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "total_product_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "bill_discount_value"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "bill_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_discount_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "bill_discount_type"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "standard_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "standard_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "standard_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "standard_discount_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bill_discount_type" character varying(50) NOT NULL DEFAULT 'NONE'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bill_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "bill_discount_value" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "total_product_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "item_discount_type" character varying(50) NOT NULL DEFAULT 'NONE'`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "item_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "order_items" ADD COLUMN IF NOT EXISTS "item_discount_value" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

}
