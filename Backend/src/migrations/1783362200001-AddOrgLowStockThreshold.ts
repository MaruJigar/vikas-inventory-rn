import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddOrgLowStockThreshold1783362200001 implements MigrationInterface {
  name = 'AddOrgLowStockThreshold1783362200001';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "manufacturers" ADD "low_stock_threshold" integer`,
    );
    await queryRunner.query(
      `ALTER TABLE "distributors" ADD "low_stock_threshold" integer`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "distributors" DROP COLUMN "low_stock_threshold"`,
    );
    await queryRunner.query(
      `ALTER TABLE "manufacturers" DROP COLUMN "low_stock_threshold"`,
    );
  }
}
