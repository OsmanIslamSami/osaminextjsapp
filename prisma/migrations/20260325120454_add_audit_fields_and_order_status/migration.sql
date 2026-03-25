-- CreateEnum
CREATE TYPE "OrderStatus" AS ENUM ('pending', 'completed', 'cancelled');

-- CreateTable
CREATE TABLE "clients" (
    "id" SERIAL NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "address" TEXT,
    "email" VARCHAR(255) NOT NULL,
    "mobile" VARCHAR(20),
    "created_by" VARCHAR(255) NOT NULL DEFAULT 'system',
    "updated_by" VARCHAR(255) NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "deleted_by" VARCHAR(255),
    "deleted_at" TIMESTAMP(6),

    CONSTRAINT "clients_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "orders" (
    "id" SERIAL NOT NULL,
    "client_id" INTEGER NOT NULL,
    "order_date" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT NOT NULL,
    "address" TEXT,
    "mobile" VARCHAR(20),
    "status" "OrderStatus" NOT NULL DEFAULT 'pending',
    "created_by" VARCHAR(255) NOT NULL DEFAULT 'system',
    "updated_by" VARCHAR(255) NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "orders_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "clients_email_key" ON "clients"("email");

-- CreateIndex
CREATE INDEX "idx_clients_created_at" ON "clients"("created_at");

-- CreateIndex
CREATE INDEX "idx_clients_updated_at" ON "clients"("updated_at");

-- CreateIndex
CREATE INDEX "idx_clients_is_deleted" ON "clients"("is_deleted");

-- CreateIndex
CREATE INDEX "idx_orders_client_id" ON "orders"("client_id");

-- CreateIndex
CREATE INDEX "idx_orders_status" ON "orders"("status");

-- CreateIndex
CREATE INDEX "idx_orders_created_at" ON "orders"("created_at");

-- AddForeignKey
ALTER TABLE "orders" ADD CONSTRAINT "orders_client_id_fkey" FOREIGN KEY ("client_id") REFERENCES "clients"("id") ON DELETE CASCADE ON UPDATE NO ACTION;
