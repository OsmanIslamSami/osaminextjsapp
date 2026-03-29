-- AlterTable
ALTER TABLE "slider_content" ADD COLUMN     "file_data" BYTEA,
ADD COLUMN     "file_name" TEXT,
ADD COLUMN     "file_size" INTEGER,
ADD COLUMN     "mime_type" TEXT;
