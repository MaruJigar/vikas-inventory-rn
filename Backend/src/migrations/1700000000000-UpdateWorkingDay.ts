import { MigrationInterface, QueryRunner, TableColumn, TableIndex } from 'typeorm';

export class UpdateWorkingDay1700000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.addColumn(
      'working_days',
      new TableColumn({
        name: 'idempotency_key',
        type: 'varchar',
        length: '150',
        isNullable: true,
        isUnique: true,
      })
    );

    await queryRunner.createIndex(
      'working_days',
      new TableIndex({
        name: 'idx_unique_active_wd',
        columnNames: ['salesman_id'],
        isUnique: true,
        where: "status = 'ACTIVE'",
      })
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.dropIndex('working_days', 'idx_unique_active_wd');
    await queryRunner.dropColumn('working_days', 'idempotency_key');
  }
}
