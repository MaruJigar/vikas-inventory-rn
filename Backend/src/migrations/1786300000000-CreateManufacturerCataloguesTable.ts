import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateManufacturerCataloguesTable1786300000000
  implements MigrationInterface
{
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE IF NOT EXISTS "manufacturer_catalogues" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "manufacturer_id" uuid NOT NULL,
        "original_filename" character varying(255) NOT NULL,
        "stored_filename" character varying(255) NOT NULL,
        "file_path" text NOT NULL,
        "file_url" text NOT NULL,
        "file_size_bytes" bigint NOT NULL,
        "mime_type" character varying(100) NOT NULL DEFAULT 'application/pdf',
        "uploaded_by_user_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "pk_manufacturer_catalogues" PRIMARY KEY ("id"),
        CONSTRAINT "uq_manufacturer_catalogues_manufacturer_id" UNIQUE ("manufacturer_id"),
        CONSTRAINT "fk_manufacturer_catalogues_manufacturer" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE CASCADE,
        CONSTRAINT "fk_manufacturer_catalogues_user" FOREIGN KEY ("uploaded_by_user_id") REFERENCES "users"("id") ON DELETE SET NULL
      )
    `);

    await queryRunner.query(`
      CREATE INDEX IF NOT EXISTS "idx_manufacturer_catalogues_manufacturer_id" ON "manufacturer_catalogues" ("manufacturer_id")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `DROP TABLE IF EXISTS "manufacturer_catalogues"`,
    );
  }
}
