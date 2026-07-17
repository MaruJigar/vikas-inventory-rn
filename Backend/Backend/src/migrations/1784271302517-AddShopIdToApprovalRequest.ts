import { MigrationInterface, QueryRunner } from "typeorm";

export class AddShopIdToApprovalRequest1784271302517 implements MigrationInterface {
    name = 'AddShopIdToApprovalRequest1784271302517'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" ADD "shop_id" uuid`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "approval_requests" DROP COLUMN "shop_id"`);
    }

}
