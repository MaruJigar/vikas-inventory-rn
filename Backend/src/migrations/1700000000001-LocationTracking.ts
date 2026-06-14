import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from 'typeorm';

export class LocationTracking1700000000001 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "location_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "salesman_id" uuid NOT NULL,
        "distributor_id" uuid NOT NULL,
        "working_day_id" uuid,
        "event_type" character varying NOT NULL DEFAULT 'PERIODIC',
        "location" geometry(Point,4326) NOT NULL,
        "accuracy" numeric,
        "captured_at" TIMESTAMP NOT NULL,
        "device_id" character varying,
        "sync_status" character varying DEFAULT 'SYNCED',
        "created_at" TIMESTAMP NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_location_logs_id" PRIMARY KEY ("id")
      );

      CREATE INDEX "idx_location_logs_salesman" ON "location_logs" ("salesman_id");
      CREATE INDEX "idx_location_logs_working_day" ON "location_logs" ("working_day_id");
      CREATE INDEX "idx_location_logs_location" ON "location_logs" USING GIST ("location");

      CREATE TABLE "latest_locations" (
        "salesman_id" uuid NOT NULL,
        "distributor_id" uuid NOT NULL,
        "working_day_id" uuid,
        "location" geometry(Point,4326),
        "accuracy" numeric,
        "is_tracking_active" boolean NOT NULL DEFAULT false,
        "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_latest_locations_salesman_id" PRIMARY KEY ("salesman_id")
      );
      
      CREATE INDEX "idx_latest_locations_distributor" ON "latest_locations" ("distributor_id");
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      DROP TABLE "latest_locations";
      DROP TABLE "location_logs";
    `);
  }
}
