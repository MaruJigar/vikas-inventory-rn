import { MigrationInterface, QueryRunner } from "typeorm";

export class AddPincodeToManufacturersAndDistributors1784300000000 implements MigrationInterface {
    name = 'AddPincodeToManufacturersAndDistributors1784300000000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "manufacturers" ADD COLUMN IF NOT EXISTS "pincode" character varying(10) NULL`);
        await queryRunner.query(`ALTER TABLE "distributors" ADD COLUMN IF NOT EXISTS "pincode" character varying(10) NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "distributors" DROP COLUMN IF EXISTS "pincode"`);
        await queryRunner.query(`ALTER TABLE "manufacturers" DROP COLUMN IF EXISTS "pincode"`);
    }

}