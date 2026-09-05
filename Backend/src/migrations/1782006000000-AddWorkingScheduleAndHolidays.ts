import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddWorkingScheduleAndHolidays1782006000000 implements MigrationInterface {
  name = 'AddWorkingScheduleAndHolidays1782006000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "distributors" ADD "working_days" integer array NOT NULL DEFAULT '{1,2,3,4,5,6}'`,
    );
    await queryRunner.query(
      `CREATE TABLE "holidays" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distributor_id" uuid NOT NULL, "holiday_date" date NOT NULL, "name" character varying(150) NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_holidays_id" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_holidays_distributor_date" ON "holidays" ("distributor_id", "holiday_date")`,
    );
    await queryRunner.query(
      `ALTER TABLE "holidays" ADD CONSTRAINT "FK_holidays_distributor_id" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "holidays" DROP CONSTRAINT "FK_holidays_distributor_id"`,
    );
    await queryRunner.query(`DROP INDEX "idx_holidays_distributor_date"`);
    await queryRunner.query(`DROP TABLE "holidays"`);
    await queryRunner.query(`ALTER TABLE "distributors" DROP COLUMN "working_days"`);
  }
}
