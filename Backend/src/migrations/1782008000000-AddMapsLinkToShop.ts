import { MigrationInterface, QueryRunner } from "typeorm";

export class AddMapsLinkToShop1782008000000 implements MigrationInterface {
    name = 'AddMapsLinkToShop1782008000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" ADD COLUMN IF NOT EXISTS "maps_link" text`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "shops" DROP COLUMN IF EXISTS "maps_link"`);
    }
}
