-- CreateTable
CREATE TABLE "faq" (
    "id" TEXT NOT NULL,
    "question_en" VARCHAR(500) NOT NULL,
    "question_ar" VARCHAR(500) NOT NULL,
    "answer_en" TEXT NOT NULL,
    "answer_ar" TEXT NOT NULL,
    "is_favorite" BOOLEAN NOT NULL DEFAULT false,
    "display_order" INTEGER NOT NULL DEFAULT 0,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faq_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "magazines" (
    "id" TEXT NOT NULL,
    "title_en" VARCHAR(500) NOT NULL,
    "title_ar" VARCHAR(500) NOT NULL,
    "description_en" TEXT NOT NULL,
    "description_ar" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "storage_type" TEXT NOT NULL DEFAULT 'blob',
    "file_data" BYTEA,
    "file_name" TEXT,
    "file_size" INTEGER,
    "mime_type" TEXT,
    "download_link" TEXT NOT NULL,
    "published_date" TIMESTAMP(6) NOT NULL,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "updated_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magazines_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "faq_is_deleted_is_favorite_created_at_idx" ON "faq"("is_deleted", "is_favorite", "created_at");

-- CreateIndex
CREATE INDEX "magazines_is_deleted_published_date_idx" ON "magazines"("is_deleted", "published_date" DESC);

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faq" ADD CONSTRAINT "faq_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magazines" ADD CONSTRAINT "magazines_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "magazines" ADD CONSTRAINT "magazines_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
