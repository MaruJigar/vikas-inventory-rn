import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddAttendanceAnalyticsIndexes1782007000000 implements MigrationInterface {
  name = 'AddAttendanceAnalyticsIndexes1782007000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE INDEX "idx_wd_salesman_check_in" ON "working_days" ("salesman_id", "check_in_at")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_visits_salesman_started" ON "shop_visits" ("salesman_id", "started_at")`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "idx_visits_salesman_started"`);
    await queryRunner.query(`DROP INDEX "idx_wd_salesman_check_in"`);
  }
}
