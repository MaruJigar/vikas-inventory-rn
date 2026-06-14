import { MigrationInterface, QueryRunner, Table, TableIndex, TableForeignKey } from "typeorm";

export class ApprovalWorkflow1781421369058 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(new Table({
            name: "approval_requests",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "request_type", type: "varchar", length: "50" },
                { name: "requester_user_id", type: "uuid", isNullable: true },
                { name: "manufacturer_id", type: "uuid", isNullable: true },
                { name: "distributor_id", type: "uuid", isNullable: true },
                { name: "salesman_id", type: "uuid", isNullable: true },
                { name: "status", type: "varchar", length: "50", default: "'PENDING_APPROVAL'" },
                { name: "submitted_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                { name: "reviewed_by_user_id", type: "uuid", isNullable: true },
                { name: "reviewed_at", type: "timestamp", isNullable: true },
                { name: "rejection_reason", type: "text", isNullable: true },
                { name: "metadata", type: "jsonb", isNullable: true },
                { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" },
                { name: "updated_at", type: "timestamp", default: "CURRENT_TIMESTAMP" }
            ]
        }), true);

        await queryRunner.createIndex("approval_requests", new TableIndex({
            name: "IDX_APPROVAL_REQUEST_ECOSYSTEM",
            columnNames: ["manufacturer_id", "distributor_id", "status"]
        }));

        await queryRunner.createTable(new Table({
            name: "approval_logs",
            columns: [
                { name: "id", type: "uuid", isPrimary: true, default: "uuid_generate_v4()" },
                { name: "approval_request_id", type: "uuid" },
                { name: "action", type: "varchar", length: "50" },
                { name: "old_status", type: "varchar", length: "50" },
                { name: "new_status", type: "varchar", length: "50" },
                { name: "acted_by_user_id", type: "uuid", isNullable: true },
                { name: "reason", type: "text", isNullable: true },
                { name: "created_at", type: "timestamp", default: "CURRENT_TIMESTAMP" }
            ]
        }), true);

        await queryRunner.createForeignKey("approval_logs", new TableForeignKey({
            columnNames: ["approval_request_id"],
            referencedColumnNames: ["id"],
            referencedTableName: "approval_requests",
            onDelete: "CASCADE"
        }));
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.dropTable("approval_logs");
        await queryRunner.dropTable("approval_requests");
    }
}
