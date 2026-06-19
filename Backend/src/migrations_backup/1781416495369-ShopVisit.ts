import { MigrationInterface, QueryRunner } from 'typeorm';

export class ShopVisit1781416495369 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
            CREATE TABLE "shop_visits" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "salesman_id" uuid NOT NULL,
                "distributor_id" uuid NOT NULL,
                "shop_id" uuid NOT NULL,
                "working_day_id" uuid,
                "visit_type" character varying(50),
                "status" character varying(50) NOT NULL DEFAULT 'ACTIVE',
                "started_at" TIMESTAMP NOT NULL,
                "ended_at" TIMESTAMP,
                "start_location" geometry(Point,4326),
                "end_location" geometry(Point,4326),
                "no_order_reason" character varying(100),
                "no_order_note" text,
                "is_offline_created" boolean NOT NULL DEFAULT false,
                "idempotency_key" character varying(200),
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "PK_shop_visits" PRIMARY KEY ("id")
            )
        `);

    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_salesman" ON "shop_visits" ("salesman_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_distributor" ON "shop_visits" ("distributor_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_shop" ON "shop_visits" ("shop_id")`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_working_day" ON "shop_visits" ("working_day_id")`,
    );

    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_shop_visits_salesmen" FOREIGN KEY ("salesman_id") REFERENCES "salesmen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_shop_visits_distributors" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_shop_visits_shops" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_shop_visits_working_days" FOREIGN KEY ("working_day_id") REFERENCES "working_days"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_shop_visits_working_days"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_shop_visits_shops"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_shop_visits_distributors"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_shop_visits_salesmen"`,
    );
    await queryRunner.query(`DROP INDEX "idx_shop_visits_working_day"`);
    await queryRunner.query(`DROP INDEX "idx_shop_visits_shop"`);
    await queryRunner.query(`DROP INDEX "idx_shop_visits_distributor"`);
    await queryRunner.query(`DROP INDEX "idx_shop_visits_salesman"`);
    await queryRunner.query(`DROP TABLE "shop_visits"`);
  }
}
