import { MigrationInterface, QueryRunner } from "typeorm";

export class AddOrderDiscounts1786236202546 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Add to distributors table
        await queryRunner.query(`ALTER TABLE "distributors" ADD COLUMN IF NOT EXISTS "distributor_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);

        // Add to orders table
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_margin_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "distributor_margin_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "freight_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "freight_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cash_discount_percent" numeric(5,2) NOT NULL DEFAULT '0'`);
        await queryRunner.query(`ALTER TABLE "orders" ADD COLUMN IF NOT EXISTS "cash_discount_amount" numeric(12,2) NOT NULL DEFAULT '0'`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "cash_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "cash_discount_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "freight_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "freight_discount_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_margin_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_margin_percent"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_discount_amount"`);
        await queryRunner.query(`ALTER TABLE "orders" DROP COLUMN IF EXISTS "distributor_discount_percent"`);

        await queryRunner.query(`ALTER TABLE "distributors" DROP COLUMN IF EXISTS "distributor_discount_percent"`);
    }
}
