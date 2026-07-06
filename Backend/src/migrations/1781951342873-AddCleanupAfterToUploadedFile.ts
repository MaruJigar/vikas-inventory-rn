import { MigrationInterface, QueryRunner } from "typeorm";

export class AddCleanupAfterToUploadedFile1781951342873 implements MigrationInterface {
    name = 'AddCleanupAfterToUploadedFile1781951342873'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "uploaded_files" ADD "cleanup_after" TIMESTAMP NULL`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "uploaded_files" DROP COLUMN "cleanup_after"`);
    }
}
