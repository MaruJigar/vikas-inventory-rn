import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddResetPasswordFields1781880000000 implements MigrationInterface {
  name = 'AddResetPasswordFields1781880000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_password_token_hash" text`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" ADD "reset_password_expires_at" TIMESTAMP`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_password_expires_at"`,
    );
    await queryRunner.query(
      `ALTER TABLE "users" DROP COLUMN "reset_password_token_hash"`,
    );
  }
}
