import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddManufacturerInventory1783362200000 implements MigrationInterface {
  name = 'AddManufacturerInventory1783362200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "manufacturer_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "manufacturer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "available_quantity" numeric(12,2) NOT NULL DEFAULT '0', "reserved_quantity" numeric(12,2) NOT NULL DEFAULT '0', "backordered_quantity" numeric(12,2) NOT NULL DEFAULT '0', "low_stock_threshold" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_manufacturer_product" UNIQUE ("manufacturer_id", "product_id"), CONSTRAINT "PK_manufacturer_inventory" PRIMARY KEY ("id"))`
    );
    await queryRunner.query(
      `CREATE INDEX IF NOT EXISTS "idx_mfr_inventory_prod" ON "manufacturer_inventory" ("manufacturer_id", "product_id")`
    );

    await queryRunner.query(
      `CREATE TABLE IF NOT EXISTS "manufacturer_inventory_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "manufacturer_id" uuid NOT NULL, "product_id" uuid NOT NULL, "order_id" uuid, "movement_type" character varying(50) NOT NULL, "quantity_change" numeric(12,2) NOT NULL, "previous_available_quantity" numeric(12,2), "new_available_quantity" numeric(12,2), "previous_reserved_quantity" numeric(12,2), "new_reserved_quantity" numeric(12,2), "previous_backordered_quantity" numeric(12,2), "new_backordered_quantity" numeric(12,2), "reason" text, "changed_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_manufacturer_inventory_movements" PRIMARY KEY ("id"))`
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX IF EXISTS "public"."idx_mfr_inventory_prod"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "manufacturer_inventory_movements"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "manufacturer_inventory"`);
  }
}
