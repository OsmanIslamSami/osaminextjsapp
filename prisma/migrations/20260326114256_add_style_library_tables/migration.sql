-- CreateTable
CREATE TABLE "style_library_folders" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "parent_id" TEXT,
    "path" TEXT NOT NULL,
    "description" TEXT,
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_library_folders_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "style_library_files" (
    "id" TEXT NOT NULL,
    "folder_id" TEXT,
    "name" TEXT NOT NULL,
    "file_url" TEXT NOT NULL,
    "file_type" TEXT NOT NULL,
    "file_size" INTEGER NOT NULL,
    "width" INTEGER,
    "height" INTEGER,
    "thumbnail_url" TEXT,
    "description" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "is_deleted" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL DEFAULT 'system',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "style_library_files_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "style_library_folders_parent_id_idx" ON "style_library_folders"("parent_id");

-- CreateIndex
CREATE INDEX "style_library_folders_is_deleted_idx" ON "style_library_folders"("is_deleted");

-- CreateIndex
CREATE INDEX "style_library_folders_path_idx" ON "style_library_folders"("path");

-- CreateIndex
CREATE UNIQUE INDEX "style_library_folders_parent_id_name_key" ON "style_library_folders"("parent_id", "name");

-- CreateIndex
CREATE INDEX "style_library_files_folder_id_idx" ON "style_library_files"("folder_id");

-- CreateIndex
CREATE INDEX "style_library_files_is_deleted_idx" ON "style_library_files"("is_deleted");

-- CreateIndex
CREATE INDEX "style_library_files_file_type_idx" ON "style_library_files"("file_type");

-- CreateIndex
CREATE INDEX "style_library_files_created_at_idx" ON "style_library_files"("created_at");

-- AddForeignKey
ALTER TABLE "style_library_folders" ADD CONSTRAINT "style_library_folders_parent_id_fkey" FOREIGN KEY ("parent_id") REFERENCES "style_library_folders"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "style_library_files" ADD CONSTRAINT "style_library_files_folder_id_fkey" FOREIGN KEY ("folder_id") REFERENCES "style_library_folders"("id") ON DELETE SET NULL ON UPDATE CASCADE;
