-- CreateTable
CREATE TABLE "news" (
    "id" TEXT NOT NULL,
    "title_en" VARCHAR(500),
    "title_ar" VARCHAR(500),
    "image_url" TEXT NOT NULL,
    "storage_type" TEXT NOT NULL DEFAULT 'blob',
    "file_data" BYTEA,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "published_date" TIMESTAMP(6) NOT NULL,
    "is_visible" BOOLEAN NOT NULL DEFAULT true,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "news_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "news_is_deleted_is_visible_published_date_idx" ON "news"("is_deleted", "is_visible", "published_date" DESC);
