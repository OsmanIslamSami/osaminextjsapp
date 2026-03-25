-- CreateEnum
CREATE TYPE "ClientStatus" AS ENUM ('Active', 'Inactive');

-- AlterTable
ALTER TABLE "clients" ADD COLUMN     "company" VARCHAR(255),
ADD COLUMN     "status" "ClientStatus" NOT NULL DEFAULT 'Active';

-- CreateIndex
CREATE INDEX "idx_clients_status" ON "clients"("status");
