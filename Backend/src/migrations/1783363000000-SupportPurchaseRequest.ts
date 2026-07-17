import { MigrationInterface, QueryRunner } from 'typeorm';

export class SupportPurchaseRequest1783363000000 implements MigrationInterface {
  name = 'SupportPurchaseRequest1783363000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Make columns nullable in orders table
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "visit_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "shop_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ALTER COLUMN "salesman_id" DROP NOT NULL`,
    );

    // Insert DRAFT status
    await queryRunner.query(`
      INSERT INTO "order_statuses" (
        "id",
        "name",
        "sequence",
        "can_cancel_order",
        "isactive",
        "is_cancel_status",
        "is_dispatch_status"
      ) VALUES (
        gen_random_uuid(),
        'DRAFT',
        0,
        true,
        true,
        false,
        false
      ) ON CONFLICT DO NOTHING
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Delete DRAFT status
    await queryRunner.query(
      `DELETE FROM "order_statuses" WHERE "name" = 'DRAFT'`,
    );

    // We cannot reliably revert to NOT NULL if there are draft orders in the DB,
    // but typically a down migration would attempt it:
    // await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "salesman_id" SET NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "shop_id" SET NOT NULL`);
    // await queryRunner.query(`ALTER TABLE "orders" ALTER COLUMN "visit_id" SET NOT NULL`);
  }
}
