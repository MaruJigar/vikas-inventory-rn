import { MigrationInterface, QueryRunner } from "typeorm";

export class AddInternalDistributorFlag1784208944255 implements MigrationInterface {
    name = 'AddInternalDistributorFlag1784208944255'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "distributors" ADD "is_internal_distributor" boolean NOT NULL DEFAULT false`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "distributors" DROP COLUMN "is_internal_distributor"`);
    }

}
