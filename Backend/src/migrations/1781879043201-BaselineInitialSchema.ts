import { MigrationInterface, QueryRunner } from 'typeorm';

export class BaselineInitialSchema1781879043201 implements MigrationInterface {
  name = 'BaselineInitialSchema1781879043201';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "uuid-ossp"');
    await queryRunner.query('CREATE EXTENSION IF NOT EXISTS "postgis"');
    await queryRunner.query(
      `CREATE TABLE "analytics_snapshots" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "owner_type" character varying(50) NOT NULL, "owner_id" uuid NOT NULL, "snapshot_type" character varying(80) NOT NULL, "date_from" date, "date_to" date, "data" jsonb NOT NULL, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_72ddc015c269977322f808a19a7" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "approval_request_id" uuid, "action" character varying(50) NOT NULL, "old_status" character varying(50), "new_status" character varying(50), "acted_by_user_id" uuid, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_5ea530f8eff8a9e5e143c3b60be" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "approval_requests" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "request_type" character varying(50) NOT NULL, "requester_user_id" uuid, "manufacturer_id" uuid, "distributor_id" uuid, "salesman_id" uuid, "status" character varying(50) NOT NULL DEFAULT 'PENDING_APPROVAL', "submitted_at" TIMESTAMP NOT NULL DEFAULT now(), "reviewed_by_user_id" uuid, "reviewed_at" TIMESTAMP, "rejection_reason" text, "metadata" jsonb, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_484806bb8ff331b851fc75973c0" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_approvals_created_at" ON "approval_requests"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_approvals_mfr_status" ON "approval_requests"  ("manufacturer_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_approvals_dist_status" ON "approval_requests"  ("distributor_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "audit_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "actor_user_id" uuid, "actor_role" character varying(50), "action" character varying(100) NOT NULL, "entity_type" character varying(100) NOT NULL, "entity_id" uuid, "old_value" jsonb, "new_value" jsonb, "metadata" jsonb, "ip_address" character varying(80), "device_id" character varying(150), "location" geography(Point,4326), "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_1bb179d048bbc581caa3b013439" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "background_jobs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "job_type" character varying(100) NOT NULL, "payload" jsonb NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "attempts" integer NOT NULL DEFAULT '0', "max_attempts" integer NOT NULL DEFAULT '5', "scheduled_at" TIMESTAMP NOT NULL DEFAULT now(), "started_at" TIMESTAMP, "completed_at" TIMESTAMP, "failed_at" TIMESTAMP, "error_message" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c1f31731b1a02806c4aa631acb8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "backorders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "order_item_id" uuid NOT NULL, "product_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "quantity" numeric(12,2) NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'OPEN', "resolved_quantity" numeric(12,2) NOT NULL DEFAULT '0', "resolved_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_fe7c69cf1b8ec3451e469a0c745" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "distributors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "business_name" character varying(200) NOT NULL, "owner_name" character varying(150), "phone" character varying(30), "email" character varying(150), "gst_number" character varying(50), "address" text, "city" character varying(100), "state" character varying(100), "country" character varying(100) NOT NULL DEFAULT 'India', "approval_status" character varying(50) NOT NULL DEFAULT 'PENDING_APPROVAL', "approved_by_user_id" uuid, "approved_at" TIMESTAMP, "rejected_reason" text, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_a3741291eb0af96f795b25d90b4" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "manufacturer_distributors" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "manufacturer_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING_APPROVAL', "approved_by_user_id" uuid, "approved_at" TIMESTAMP, "rejected_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_0c861f2f1677213f63f2df61905" UNIQUE ("manufacturer_id", "distributor_id"), CONSTRAINT "PK_5be1c0b4bb3903b002661199abf" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "fulfillment_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "order_item_id" uuid, "distributor_id" uuid NOT NULL, "action" character varying(50) NOT NULL, "quantity" numeric(12,2), "old_status" character varying(50), "new_status" character varying(50), "performed_by_user_id" uuid, "notes" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_2468ba25dd87ee8d288793e1edb" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "distributor_inventory" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distributor_id" uuid NOT NULL, "product_id" uuid NOT NULL, "available_quantity" numeric(12,2) NOT NULL DEFAULT '0', "reserved_quantity" numeric(12,2) NOT NULL DEFAULT '0', "backordered_quantity" numeric(12,2) NOT NULL DEFAULT '0', "low_stock_threshold" numeric(12,2) NOT NULL DEFAULT '0', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_41271e3993fb031d961d9f1f792" UNIQUE ("distributor_id", "product_id"), CONSTRAINT "PK_2bafa25fd2f4327ab528305aaaa" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_inventory_dist_prod" ON "distributor_inventory"  ("distributor_id", "product_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "inventory_movements" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distributor_id" uuid NOT NULL, "product_id" uuid NOT NULL, "order_id" uuid, "movement_type" character varying(50) NOT NULL, "quantity_change" numeric(12,2) NOT NULL, "previous_available_quantity" numeric(12,2), "new_available_quantity" numeric(12,2), "previous_reserved_quantity" numeric(12,2), "new_reserved_quantity" numeric(12,2), "previous_backordered_quantity" numeric(12,2), "new_backordered_quantity" numeric(12,2), "reason" text, "changed_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_d7597827c1dcffae889db3ab873" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "latest_locations" ("salesman_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "working_day_id" uuid, "location" geography(Point,4326), "accuracy" numeric(10,2), "is_tracking_active" boolean NOT NULL DEFAULT false, "last_updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_dc28ebb0131e4a3e311b1c03248" PRIMARY KEY ("salesman_id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "location_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "salesman_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "working_day_id" uuid, "event_type" character varying(50) NOT NULL, "location" geography(Point,4326), "accuracy" numeric(10,2), "captured_at" TIMESTAMP NOT NULL, "device_id" character varying(150), "sync_status" character varying(50) NOT NULL DEFAULT 'SYNCED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_f61ffb8ec1e177e99dcd82669bc" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_location_logs_location" ON "location_logs" USING gist ("location") `,
    );
    await queryRunner.query(
      `CREATE TABLE "manufacturers" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "company_name" character varying(200) NOT NULL, "contact_person" character varying(150), "phone" character varying(30), "email" character varying(150), "gst_number" character varying(50), "address" text, "city" character varying(100), "state" character varying(100), "country" character varying(100) NOT NULL DEFAULT 'India', "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_138520de32c379a48e703441975" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "notifications" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "recipient_user_id" uuid, "recipient_role" character varying(50), "title" character varying(200) NOT NULL, "message" text NOT NULL, "type" character varying(80) NOT NULL, "entity_type" character varying(80), "entity_id" uuid, "is_read" boolean NOT NULL DEFAULT false, "read_at" TIMESTAMP, "firebase_sent" boolean NOT NULL DEFAULT false, "socket_sent" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_6a72c3c0f683f6462415e653c3a" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_created_at" ON "notifications"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_notifications_user_read" ON "notifications"  ("recipient_user_id", "is_read") `,
    );
    await queryRunner.query(
      `CREATE TABLE "offline_sync_batches" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid, "device_id" character varying(150), "status" character varying(50) NOT NULL DEFAULT 'PENDING', "total_items" integer NOT NULL DEFAULT '0', "successful_items" integer NOT NULL DEFAULT '0', "failed_items" integer NOT NULL DEFAULT '0', "conflict_items" integer NOT NULL DEFAULT '0', "started_at" TIMESTAMP NOT NULL DEFAULT now(), "completed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_75f25b28abe5add8bce0dcd8269" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "offline_sync_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "sync_batch_id" uuid, "user_id" uuid, "entity_type" character varying(80) NOT NULL, "operation" character varying(50) NOT NULL, "local_id" character varying(150), "server_id" uuid, "idempotency_key" character varying(200) NOT NULL, "payload" jsonb NOT NULL, "status" character varying(50) NOT NULL DEFAULT 'PENDING', "error_message" text, "conflict_reason" text, "processed_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_521a005eb7653e4c5903f86a162" UNIQUE ("idempotency_key"), CONSTRAINT "PK_e25add8c024adc01aae86485e11" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "salesmen" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "user_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "full_name" character varying(150) NOT NULL, "phone" character varying(30), "email" character varying(150), "approval_status" character varying(50) NOT NULL DEFAULT 'PENDING_APPROVAL', "approved_by_user_id" uuid, "approved_at" TIMESTAMP, "rejected_reason" text, "is_active" boolean NOT NULL DEFAULT false, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_bdf2846708fc9ad6c61f4173e63" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salesmen_created_at" ON "salesmen"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_salesmen_dist_status" ON "salesmen"  ("distributor_id", "approval_status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "shops" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distributor_id" uuid NOT NULL, "created_by_user_id" uuid, "created_by_salesman_id" uuid, "name" character varying(200) NOT NULL, "owner_name" character varying(150), "phone" character varying(30) NOT NULL, "address" text NOT NULL, "city" character varying(100), "state" character varying(100), "gst_number" character varying(50), "location" geography(Point,4326), "verification_photo_url" text, "verification_status" character varying(50) NOT NULL DEFAULT 'VERIFIED', "last_visit_at" TIMESTAMP, "last_order_at" TIMESTAMP, "is_active" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_3c6aaa6607d287de99815e60b96" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shops_created_at" ON "shops"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shops_dist_status" ON "shops"  ("distributor_id", "verification_status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "working_days" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "salesman_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "check_in_at" TIMESTAMP NOT NULL, "check_out_at" TIMESTAMP, "check_in_location" geography(Point,4326), "check_out_location" geography(Point,4326), "status" character varying(50) NOT NULL DEFAULT 'ACTIVE', "device_id" character varying(150), "idempotency_key" character varying(150), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_30bea66b2943020dfb8e9b35dbf" UNIQUE ("idempotency_key"), CONSTRAINT "PK_9b0a68a546ae4e1e9602ef3d347" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_unique_active_wd" ON "working_days"  ("salesman_id") WHERE status = 'ACTIVE'`,
    );
    await queryRunner.query(
      `CREATE TABLE "shop_visits" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "salesman_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "shop_id" uuid NOT NULL, "working_day_id" uuid, "visit_type" character varying(50), "status" character varying(50) NOT NULL DEFAULT 'ACTIVE', "started_at" TIMESTAMP NOT NULL, "ended_at" TIMESTAMP, "start_location" geometry(Point,4326), "end_location" geometry(Point,4326), "no_order_reason" character varying(100), "no_order_note" text, "is_offline_created" boolean NOT NULL DEFAULT false, "idempotency_key" character varying(200), "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_b14434cf5d0f02b9d083a259a10" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_salesman" ON "shop_visits"  ("salesman_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_distributor" ON "shop_visits"  ("distributor_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_shop" ON "shop_visits"  ("shop_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_shop_visits_working_day" ON "shop_visits"  ("working_day_id") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_visits_created_at" ON "shop_visits"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_visits_salesman_status" ON "shop_visits"  ("salesman_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_visits_dist_status" ON "shop_visits"  ("distributor_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "users" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "full_name" character varying(150) NOT NULL, "email" character varying(150), "phone" character varying(30) NOT NULL, "password_hash" text NOT NULL, "role" character varying(50) NOT NULL, "approval_status" character varying(50) NOT NULL DEFAULT 'PENDING_APPROVAL', "is_active" boolean NOT NULL DEFAULT true, "hashed_refresh_token" text, "last_login_at" TIMESTAMP, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"), CONSTRAINT "UQ_a000cca60bcf04454e727699490" UNIQUE ("phone"), CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "orders" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_number" character varying(100) NOT NULL, "visit_id" uuid NOT NULL, "shop_id" uuid NOT NULL, "salesman_id" uuid NOT NULL, "distributor_id" uuid NOT NULL, "manufacturer_id" uuid, "status" character varying(50) NOT NULL DEFAULT 'CREATED', "gross_order_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_product_discount_amount" numeric(12,2) NOT NULL DEFAULT '0', "bill_discount_type" character varying(50) NOT NULL DEFAULT 'NONE', "bill_discount_value" numeric(12,2) NOT NULL DEFAULT '0', "bill_discount_amount" numeric(12,2) NOT NULL DEFAULT '0', "final_order_amount" numeric(12,2) NOT NULL DEFAULT '0', "total_quantity" numeric(12,2) NOT NULL DEFAULT '0', "total_backordered_quantity" numeric(12,2) NOT NULL DEFAULT '0', "is_offline_created" boolean NOT NULL DEFAULT false, "idempotency_key" character varying(200), "post_dispatch_edited" boolean NOT NULL DEFAULT false, "post_delivery_edited" boolean NOT NULL DEFAULT false, "cancelled_at" TIMESTAMP, "cancelled_by_user_id" uuid, "cancellation_reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "UQ_75eba1c6b1a66b09f2a97e6927b" UNIQUE ("order_number"), CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE UNIQUE INDEX "idx_orders_idempotency_key" ON "orders"  ("idempotency_key") WHERE idempotency_key IS NOT NULL`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_created_at" ON "orders"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_dist_status" ON "orders"  ("distributor_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_salesman_status" ON "orders"  ("salesman_id", "status") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_orders_shop_status" ON "orders"  ("shop_id", "status") `,
    );
    await queryRunner.query(
      `CREATE TABLE "product_categories" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(150) NOT NULL, "parent_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_7069dac60d88408eca56fdc9e0c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "products" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_source" character varying(50) NOT NULL, "manufacturer_id" uuid, "distributor_id" uuid, "category_id" uuid, "name" character varying(200) NOT NULL, "sku" character varying(100), "unit" character varying(50), "description" text, "product_image_url" text, "mrp" numeric(12,2) NOT NULL, "gst_percent" numeric(5,2) NOT NULL DEFAULT '0', "distributor_discount_percent" numeric(5,2) NOT NULL DEFAULT '0', "special_discount_percent" numeric(5,2) NOT NULL DEFAULT '0', "external_manufacturer_name" character varying(200), "external_manufacturer_contact" character varying(150), "external_manufacturer_phone" character varying(30), "external_manufacturer_email" character varying(150), "external_manufacturer_address" text, "external_manufacturer_gst_number" character varying(50), "is_active" boolean NOT NULL DEFAULT true, "created_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), "deleted_at" TIMESTAMP, CONSTRAINT "PK_0806c755e0aca124e67c0cf6d7d" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_created_at" ON "products"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_products_mfr_cat" ON "products"  ("manufacturer_id", "category_id") `,
    );
    await queryRunner.query(
      `CREATE TABLE "order_items" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "product_id" uuid NOT NULL, "product_name_snapshot" character varying(200) NOT NULL, "sku_snapshot" character varying(100), "manufacturer_name_snapshot" character varying(200), "quantity" numeric(12,2) NOT NULL, "mrp" numeric(12,2) NOT NULL, "gross_line_amount" numeric(12,2) NOT NULL, "item_discount_type" character varying(50) NOT NULL DEFAULT 'NONE', "item_discount_value" numeric(12,2) NOT NULL DEFAULT '0', "item_discount_amount" numeric(12,2) NOT NULL DEFAULT '0', "net_line_amount" numeric(12,2) NOT NULL, "reserved_quantity" numeric(12,2) NOT NULL DEFAULT '0', "backordered_quantity" numeric(12,2) NOT NULL DEFAULT '0', "dispatched_quantity" numeric(12,2) NOT NULL DEFAULT '0', "delivered_quantity" numeric(12,2) NOT NULL DEFAULT '0', "status" character varying(50) NOT NULL DEFAULT 'ORDERED', "created_at" TIMESTAMP NOT NULL DEFAULT now(), "updated_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_revisions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "revision_number" integer NOT NULL, "old_data" jsonb NOT NULL, "new_data" jsonb NOT NULL, "changed_fields" jsonb, "changed_by_user_id" uuid, "changed_by_role" character varying(50), "order_status_at_time" character varying(50), "inventory_impact" jsonb, "distributor_notified" boolean NOT NULL DEFAULT false, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_0d40f6d6c7f2630e75b74729daf" UNIQUE ("order_id", "revision_number"), CONSTRAINT "PK_8ee50c2da8e0f2aa81037091cf1" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "order_status_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "order_id" uuid NOT NULL, "old_status" character varying(50), "new_status" character varying(50) NOT NULL, "changed_by_user_id" uuid, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e6c66d853f155531985fc4f6ec8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "product_price_history" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "product_id" uuid NOT NULL, "old_mrp" numeric(12,2), "new_mrp" numeric(12,2), "old_gst_percent" numeric(5,2), "new_gst_percent" numeric(5,2), "old_distributor_discount_percent" numeric(5,2), "new_distributor_discount_percent" numeric(5,2), "old_special_discount_percent" numeric(5,2), "new_special_discount_percent" numeric(5,2), "changed_by_user_id" uuid, "reason" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_8ad05105010c053126d79113a5c" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "key" character varying(150) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_017943867ed5ceef9c03edd9745" UNIQUE ("key"), CONSTRAINT "PK_920331560282b8bd21bb02290df" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "role_permissions" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "role_id" uuid, "permission_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_25d24010f53bb80b78e412c9656" UNIQUE ("role_id", "permission_id"), CONSTRAINT "PK_84059017c90bfcb701b8fa42297" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "roles" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "name" character varying(80) NOT NULL, "description" text, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "UQ_648e3f5447f725579d7d4ffdfb7" UNIQUE ("name"), CONSTRAINT "PK_c1433d71a4838793a49dcad46ab" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "shop_duplicate_logs" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "distributor_id" uuid, "attempted_shop_name" character varying(200), "attempted_phone" character varying(30), "attempted_location" geography(Point,4326), "matched_shop_id" uuid, "match_type" character varying(50), "match_score" numeric(5,2), "action_taken" character varying(50), "created_by_user_id" uuid, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_c6bf4601681bf93615dae0fc371" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "uploaded_files" ("id" uuid NOT NULL DEFAULT uuid_generate_v4(), "uploaded_by_user_id" uuid, "entity_type" character varying(80), "entity_id" uuid, "file_type" character varying(80), "original_file_name" text, "file_url" text NOT NULL, "compressed_file_url" text, "mime_type" character varying(100), "original_size_bytes" bigint, "compressed_size_bytes" bigint, "compression_applied" boolean NOT NULL DEFAULT true, "created_at" TIMESTAMP NOT NULL DEFAULT now(), CONSTRAINT "PK_e2d47e01bd5be386bf0067b2ed8" PRIMARY KEY ("id"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ALTER COLUMN "order_item_id" DROP NOT NULL`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP COLUMN "start_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD "start_location" geography(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP COLUMN "end_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD "end_location" geography(Point,4326)`,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_backorders_created_at" ON "backorders"  ("created_at") `,
    );
    await queryRunner.query(
      `CREATE INDEX "idx_backorders_dist_status" ON "backorders"  ("distributor_id", "status") `,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_5a4541ff73326a8c271f3783bcc" FOREIGN KEY ("salesman_id") REFERENCES "salesmen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_421761540aa42ee87d60a8869d9" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_4b8a30a0d3e3c77d07ba91d861a" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD CONSTRAINT "FK_159a428a7a1279c22e746db2538" FOREIGN KEY ("working_day_id") REFERENCES "working_days"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_74df0e55b9805db3a83046d5801" FOREIGN KEY ("visit_id") REFERENCES "shop_visits"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_33f20db82908f7685a5c0c58ac6" FOREIGN KEY ("shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_76a57c1665cefc6a2e72f10bee4" FOREIGN KEY ("salesman_id") REFERENCES "salesmen"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_21e5337633015419db62cff07d2" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_411024644e2b4d4c13c877fb5e5" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" ADD CONSTRAINT "FK_db249db755b246770b9ad346c54" FOREIGN KEY ("cancelled_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" ADD CONSTRAINT "FK_5f151d414daab0290f65b517ed4" FOREIGN KEY ("parent_id") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_5bc36ce05cc397317480efb18f6" FOREIGN KEY ("manufacturer_id") REFERENCES "manufacturers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_a307e60ae848183d43df6809dfb" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_9a5f6868c96e0069e699f33e124" FOREIGN KEY ("category_id") REFERENCES "product_categories"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" ADD CONSTRAINT "FK_d4131ec6fde82732ee2f3a777cd" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_145532db85752b29c57d2b7b1f1" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" ADD CONSTRAINT "FK_9263386c35b6b242540f9493b00" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ADD CONSTRAINT "FK_061e6be12ade8887d17160dfe5e" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ADD CONSTRAINT "FK_a0c8832f975e0ad2b2c35234be9" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ADD CONSTRAINT "FK_42fbbfc3f4a7a4c0a43ee15c29a" FOREIGN KEY ("product_id") REFERENCES "products"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ADD CONSTRAINT "FK_9b00ab9bf576d2dc3383835b3bf" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" ADD CONSTRAINT "FK_4edea41c25dc315382611dd4782" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" ADD CONSTRAINT "FK_e2116b91db3f461e7ad5fd4cd3c" FOREIGN KEY ("order_item_id") REFERENCES "order_items"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" ADD CONSTRAINT "FK_e3cecd2e1e1227d1b26d26b2a32" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" ADD CONSTRAINT "FK_4b2f3dfc302bb62cf6848c2f032" FOREIGN KEY ("performed_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_revisions" ADD CONSTRAINT "FK_e044f9614dfa97c0524cfaf612c" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_revisions" ADD CONSTRAINT "FK_889f874c2a5c7566f46e36f9f1f" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c" FOREIGN KEY ("order_id") REFERENCES "orders"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" ADD CONSTRAINT "FK_965678b54f0a0361ca72c541b20" FOREIGN KEY ("changed_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" ADD CONSTRAINT "FK_7308b402704ea5e0b18f6e12bf9" FOREIGN KEY ("distributor_id") REFERENCES "distributors"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" ADD CONSTRAINT "FK_4ebdee9e9518cb1f460784b56b9" FOREIGN KEY ("matched_shop_id") REFERENCES "shops"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" ADD CONSTRAINT "FK_db5f4725544eb8d003712a5bbcb" FOREIGN KEY ("created_by_user_id") REFERENCES "users"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT "FK_db5f4725544eb8d003712a5bbcb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT "FK_4ebdee9e9518cb1f460784b56b9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_duplicate_logs" DROP CONSTRAINT "FK_7308b402704ea5e0b18f6e12bf9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_965678b54f0a0361ca72c541b20"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_status_history" DROP CONSTRAINT "FK_1ca7d5228cf9dc589b60243933c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_revisions" DROP CONSTRAINT "FK_889f874c2a5c7566f46e36f9f1f"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_revisions" DROP CONSTRAINT "FK_e044f9614dfa97c0524cfaf612c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" DROP CONSTRAINT "FK_4b2f3dfc302bb62cf6848c2f032"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" DROP CONSTRAINT "FK_e3cecd2e1e1227d1b26d26b2a32"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" DROP CONSTRAINT "FK_e2116b91db3f461e7ad5fd4cd3c"`,
    );
    await queryRunner.query(
      `ALTER TABLE "fulfillment_logs" DROP CONSTRAINT "FK_4edea41c25dc315382611dd4782"`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" DROP CONSTRAINT "FK_9b00ab9bf576d2dc3383835b3bf"`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" DROP CONSTRAINT "FK_42fbbfc3f4a7a4c0a43ee15c29a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" DROP CONSTRAINT "FK_a0c8832f975e0ad2b2c35234be9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" DROP CONSTRAINT "FK_061e6be12ade8887d17160dfe5e"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_9263386c35b6b242540f9493b00"`,
    );
    await queryRunner.query(
      `ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db85752b29c57d2b7b1f1"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_d4131ec6fde82732ee2f3a777cd"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_9a5f6868c96e0069e699f33e124"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_a307e60ae848183d43df6809dfb"`,
    );
    await queryRunner.query(
      `ALTER TABLE "products" DROP CONSTRAINT "FK_5bc36ce05cc397317480efb18f6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "product_categories" DROP CONSTRAINT "FK_5f151d414daab0290f65b517ed4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_db249db755b246770b9ad346c54"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_411024644e2b4d4c13c877fb5e5"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_21e5337633015419db62cff07d2"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_76a57c1665cefc6a2e72f10bee4"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_33f20db82908f7685a5c0c58ac6"`,
    );
    await queryRunner.query(
      `ALTER TABLE "orders" DROP CONSTRAINT "FK_74df0e55b9805db3a83046d5801"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_159a428a7a1279c22e746db2538"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_4b8a30a0d3e3c77d07ba91d861a"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_421761540aa42ee87d60a8869d9"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP CONSTRAINT "FK_5a4541ff73326a8c271f3783bcc"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_backorders_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_backorders_created_at"`);
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP COLUMN "end_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD "end_location" geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" DROP COLUMN "start_location"`,
    );
    await queryRunner.query(
      `ALTER TABLE "shop_visits" ADD "start_location" geometry(Point,4326)`,
    );
    await queryRunner.query(
      `ALTER TABLE "backorders" ALTER COLUMN "order_item_id" SET NOT NULL`,
    );
    await queryRunner.query(`DROP TABLE "uploaded_files"`);
    await queryRunner.query(`DROP TABLE "shop_duplicate_logs"`);
    await queryRunner.query(`DROP TABLE "roles"`);
    await queryRunner.query(`DROP TABLE "role_permissions"`);
    await queryRunner.query(`DROP TABLE "permissions"`);
    await queryRunner.query(`DROP TABLE "product_price_history"`);
    await queryRunner.query(`DROP TABLE "order_status_history"`);
    await queryRunner.query(`DROP TABLE "order_revisions"`);
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_mfr_cat"`);
    await queryRunner.query(`DROP INDEX "public"."idx_products_created_at"`);
    await queryRunner.query(`DROP TABLE "products"`);
    await queryRunner.query(`DROP TABLE "product_categories"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_shop_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_salesman_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_created_at"`);
    await queryRunner.query(`DROP INDEX "public"."idx_orders_idempotency_key"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "users"`);
    await queryRunner.query(`DROP INDEX "public"."idx_visits_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_visits_salesman_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_visits_created_at"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_shop_visits_working_day"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_shop_visits_shop"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_shop_visits_distributor"`,
    );
    await queryRunner.query(`DROP INDEX "public"."idx_shop_visits_salesman"`);
    await queryRunner.query(`DROP TABLE "shop_visits"`);
    await queryRunner.query(`DROP INDEX "public"."idx_unique_active_wd"`);
    await queryRunner.query(`DROP TABLE "working_days"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shops_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_shops_created_at"`);
    await queryRunner.query(`DROP TABLE "shops"`);
    await queryRunner.query(`DROP INDEX "public"."idx_salesmen_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_salesmen_created_at"`);
    await queryRunner.query(`DROP TABLE "salesmen"`);
    await queryRunner.query(`DROP TABLE "offline_sync_items"`);
    await queryRunner.query(`DROP TABLE "offline_sync_batches"`);
    await queryRunner.query(
      `DROP INDEX "public"."idx_notifications_user_read"`,
    );
    await queryRunner.query(
      `DROP INDEX "public"."idx_notifications_created_at"`,
    );
    await queryRunner.query(`DROP TABLE "notifications"`);
    await queryRunner.query(`DROP TABLE "manufacturers"`);
    await queryRunner.query(`DROP INDEX "public"."idx_location_logs_location"`);
    await queryRunner.query(`DROP TABLE "location_logs"`);
    await queryRunner.query(`DROP TABLE "latest_locations"`);
    await queryRunner.query(`DROP TABLE "inventory_movements"`);
    await queryRunner.query(`DROP INDEX "public"."idx_inventory_dist_prod"`);
    await queryRunner.query(`DROP TABLE "distributor_inventory"`);
    await queryRunner.query(`DROP TABLE "fulfillment_logs"`);
    await queryRunner.query(`DROP TABLE "manufacturer_distributors"`);
    await queryRunner.query(`DROP TABLE "distributors"`);
    await queryRunner.query(`DROP TABLE "backorders"`);
    await queryRunner.query(`DROP TABLE "background_jobs"`);
    await queryRunner.query(`DROP TABLE "audit_logs"`);
    await queryRunner.query(`DROP INDEX "public"."idx_approvals_dist_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_approvals_mfr_status"`);
    await queryRunner.query(`DROP INDEX "public"."idx_approvals_created_at"`);
    await queryRunner.query(`DROP TABLE "approval_requests"`);
    await queryRunner.query(`DROP TABLE "approval_logs"`);
    await queryRunner.query(`DROP TABLE "analytics_snapshots"`);
  }
}
