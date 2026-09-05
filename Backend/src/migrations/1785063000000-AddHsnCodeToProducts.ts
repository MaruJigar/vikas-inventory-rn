import { MigrationInterface, QueryRunner } from "typeorm";

export class AddHsnCodeToProducts1785063000000 implements MigrationInterface {
    name = 'AddHsnCodeToProducts1785063000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" ADD "hsn_code" character varying(20)`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "products" DROP COLUMN "hsn_code"`);
    }
}
