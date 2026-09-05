import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddSalesmanRegion1783600600763 implements MigrationInterface {
  name = 'AddSalesmanRegion1783600600763';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salesmen" ADD "city" character varying(100)`,
    );
    await queryRunner.query(
      `ALTER TABLE "salesmen" ADD "state" character varying(100)`,
    );
    await queryRunner.query(`ALTER TABLE "salesmen" ADD "city_id" uuid`);
    await queryRunner.query(`ALTER TABLE "salesmen" ADD "state_id" uuid`);

    // Add foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "salesmen" ADD CONSTRAINT "FK_salesmen_city_id" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "salesmen" ADD CONSTRAINT "FK_salesmen_state_id" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "salesmen" DROP CONSTRAINT "FK_salesmen_state_id"`,
    );
    await queryRunner.query(
      `ALTER TABLE "salesmen" DROP CONSTRAINT "FK_salesmen_city_id"`,
    );

    await queryRunner.query(`ALTER TABLE "salesmen" DROP COLUMN "state_id"`);
    await queryRunner.query(`ALTER TABLE "salesmen" DROP COLUMN "city_id"`);
    await queryRunner.query(`ALTER TABLE "salesmen" DROP COLUMN "state"`);
    await queryRunner.query(`ALTER TABLE "salesmen" DROP COLUMN "city"`);
  }
}
