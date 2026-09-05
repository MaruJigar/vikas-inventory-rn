import { MigrationInterface, QueryRunner } from "typeorm";

export class RemoveLocationAndAddCityIdToShop1782007000000 implements MigrationInterface {
    name = 'RemoveLocationAndAddCityIdToShop1782007000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Shops updates
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "location"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "city_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "state_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT IF EXISTS "FK_shops_cities_city_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT IF EXISTS "FK_shops_states_state_id"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_shops_cities_city_id" FOREIGN KEY ("city_id") REFERENCES "cities"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "shops" ADD CONSTRAINT "FK_shops_states_state_id" FOREIGN KEY ("state_id") REFERENCES "states"("id") ON DELETE SET NULL`);

        // Shop duplicate logs updates
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP COLUMN IF EXISTS "attempted_location"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" ADD COLUMN IF NOT EXISTS "attempted_city_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" ADD COLUMN IF NOT EXISTS "attempted_state_id" uuid`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT IF EXISTS "FK_shop_duplicate_logs_cities"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT IF EXISTS "FK_shop_duplicate_logs_states"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" ADD CONSTRAINT "FK_shop_duplicate_logs_cities" FOREIGN KEY ("attempted_city_id") REFERENCES "cities"("id") ON DELETE SET NULL`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" ADD CONSTRAINT "FK_shop_duplicate_logs_states" FOREIGN KEY ("attempted_state_id") REFERENCES "states"("id") ON DELETE SET NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Shop duplicate logs rollback
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT IF EXISTS "FK_shop_duplicate_logs_states"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT IF EXISTS "FK_shop_duplicate_logs_cities"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP COLUMN IF EXISTS "attempted_state_id"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" DROP COLUMN IF EXISTS "attempted_city_id"`);
        await queryRunner.query(`ALTER TABLE "shop_duplicate_logs" ADD "attempted_location" geography(Point,4326)`);

        // Shops rollback
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT IF EXISTS "FK_shops_states_state_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP CONSTRAINT IF EXISTS "FK_shops_cities_city_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "state_id"`);
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "city_id"`);
        await queryRunner.query(`ALTER TABLE "shops" ADD "location" geography(Point,4326)`);
    }
}
