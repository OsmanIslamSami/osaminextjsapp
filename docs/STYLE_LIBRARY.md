# Style Library - SharePoint-Style Asset Management System

## Overview

The Style Library is a centralized asset management system for your Next.js application, similar to SharePoint's document library. It allows administrators to organize media files (images, videos, icons) in folders and reuse them across different parts of the website (slider, social media icons, etc.).

## Features

### 📁 Folder Management
- Create unlimited nested folders
- Organize assets by purpose (e.g., "/Slider Images/Promotional", "/Icons/Social Media")
- Rename and delete folders with automatic path updates for nested structures
- Soft-delete protection for safe recovery

### 📂 File Management
- Upload images, videos, and icons
- Automatic Vercel Blob storage integration for persistence
- Search files by name, description, or tags
- File metadata: dimensions, size, type, tags
- Move files between folders
- Preview images and videos inline
- Copy file URLs with one click

### 🎨 File Picker Integration
- Reusable FilePicker component for selecting files from the library
- Already integrated with:
  - **Slider Admin** - Select slider images/videos
  - **Social Media Admin** - Select social media icons
- Filter by file type (images, videos, all)
- Search within picker modal

### 🔒 Security
- Admin-only access for uploads and management
- Public read access for displaying files
- Soft-delete instead of permanent deletion

## Database Schema

### StyleLibraryFolder
```prisma
model StyleLibraryFolder {
  id           String                @id @default(cuid())
  name         String
  parent_id    String?
  path         String                // Full path like "/Slider Images/Events"
  description  String?
  is_deleted   Boolean               @default(false)
  created_by   String                @default("system")
  created_at   DateTime              @default(now())
  updated_at   DateTime              @updatedAt
  
  parent       StyleLibraryFolder?   @relation("FolderHierarchy", fields: [parent_id], references: [id])
  children     StyleLibraryFolder[]  @relation("FolderHierarchy")
  files        StyleLibraryFile[]
}
```

### StyleLibraryFile
```prisma
model StyleLibraryFile {
  id           String              @id @default(cuid())
  folder_id    String?
  name         String
  file_url     String              // Vercel Blob URL or CDN URL
  file_type    String              // MIME type (image/png, video/mp4, etc.)
  file_size    Int                 // Size in bytes
  width        Int?                // For images/videos
  height       Int?                // For images/videos
  thumbnail_url String?            // Optional thumbnail for videos
  description  String?
  tags         String[]            @default([])
  is_deleted   Boolean             @default(false)
  created_by   String              @default("system")
  created_at   DateTime            @default(now())
  updated_at   DateTime            @updatedAt
  
  folder       StyleLibraryFolder? @relation(fields: [folder_id], references: [id])
}
```

## API Routes

### Folders

#### GET `/api/style-library/folders`
Get all folders in hierarchical structure.
- **Auth**: Public
- **Returns**: Array of folders with file/children counts

#### POST `/api/style-library/folders`
Create a new folder.
- **Auth**: Admin only
- **Body**: 
  ```json
  {
    "name": "Promotional Images",
    "parent_id": "optional-parent-id",
    "description": "Optional description"
  }
  ```

#### GET `/api/style-library/folders/[id]`
Get folder details with contents.
- **Auth**: Public
- **Returns**: Folder with children and files

#### PUT `/api/style-library/folders/[id]`
Update folder name or description.
- **Auth**: Admin only
- **Note**: Automatically updates paths for all nested folders

#### DELETE `/api/style-library/folders/[id]`
Soft-delete folder and all contents recursively.
- **Auth**: Admin only

### Files

#### GET `/api/style-library/files`
List files with optional filters.
- **Auth**: Public
- **Query Params**:
  - `folder_id` - Filter by folder
  - `file_type` - Filter by type (image, video)
  - `search` - Search by name/description/tags

#### POST `/api/style-library/files`
Upload a new file.
- **Auth**: Admin only
- **Body**: FormData with:
  - `file` - The file to upload
  - `folder_id` - Optional folder ID
  - `description` - Optional description
  - `tags` - Comma-separated tags

#### GET `/api/style-library/files/[id]`
Get file details.
- **Auth**: Public

#### PUT `/api/style-library/files/[id]`
Update file metadata (name, description, tags, folder, dimensions).
- **Auth**: Admin only

#### DELETE `/api/style-library/files/[id]`
Soft-delete file and remove from Vercel Blob if applicable.
- **Auth**: Admin only

#### PUT `/api/style-library/files/[id]/move`
Move file to another folder.
- **Auth**: Admin only
- **Body**: `{ "folder_id": "target-folder-id-or-null" }`

## Usage Guide

### Accessing the Style Library

1. Log in as admin
2. Navigate to **Admin** → **Style Library**
3. You'll see:
   - Left sidebar: Folder tree
   - Main area: Files in current folder/location
   - Top bar: Upload and New Folder buttons

### Creating Folders

```typescript
// Via UI: Click "New Folder" button
// Via API:
const response = await fetch('/api/style-library/folders', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    name: "Slider Images",
    parent_id: null, // or parent folder ID
    description: "Images for the homepage slider"
  })
});
```

### Uploading Files

```typescript
// Via UI: Click "Upload Files" button and select files
// Via API:
const formData = new FormData();
formData.append('file', fileInput.files[0]);
formData.append('folder_id', 'folder-id');
formData.append('description', 'Hero image for summer campaign');
formData.append('tags', 'hero, summer, 2026');

const response = await fetch('/api/style-library/files', {
  method: 'POST',
  body: formData
});
```

### Using FilePicker Component

The FilePicker component can be integrated into any admin page:

```tsx
import FilePicker from '@/lib/components/FilePicker';

function MyAdminPage() {
  const [showPicker, setShowPicker] = useState(false);
  const [selectedFile, setSelectedFile] = useState<string>('');

  return (
    <>
      <button onClick={() => setShowPicker(true)}>
        Select Image
      </button>

      <FilePicker
        isOpen={showPicker}
        onClose={() => setShowPicker(false)}
        onSelect={(file) => {
          setSelectedFile(file.file_url);
          setShowPicker(false);
        }}
        fileType="image" // "image", "video", or "all"
        title="Select an Image"
      />
    </>
  );
}
```

### Integration Examples

#### Slider Admin Integration
```tsx
// Already integrated! Users can:
// 1. Click "Choose from Style Library" to browse existing files
// 2. Or "Upload New File" to upload directly

<button onClick={() => setShowFilePicker(true)}>
  Choose from Style Library
</button>

<FilePicker
  isOpen={showFilePicker}
  onClose={() => setShowFilePicker(false)}
  onSelect={(file) => {
    setFormData({
      ...formData,
      media_url: file.file_url,
      media_type: getMediaType(file.file_type)
    });
  }}
  fileType="all"
  title="Select Media for Slider"
/>
```

#### Social Media Admin Integration
```tsx
// Already integrated! Users can:
// 1. Click "Choose from Library" to select from uploaded icons
// 2. Or "Upload New" to upload a new icon

<FilePicker
  isOpen={showFilePicker}
  onClose={() => setShowFilePicker(false)}
  onSelect={(file) => {
    setFormData({ ...formData, icon_path: file.file_url });
    setPreviewUrl(file.file_url);
  }}
  fileType="image"
  title="Select Icon from Library"
/>
```

## File Type Support

### Allowed File Types
- **Images**: JPEG, PNG, GIF, WebP, SVG, ICO
- **Videos**: MP4, WebM
- **Documents**: PDF

### Size Limits
- Default: 50MB per file (configurable in `/api/style-library/files/route.ts`)
- Vercel Blob free tier: 500MB total storage

## Vercel Blob Integration

All uploaded files are stored in Vercel Blob for persistence across deployments.

### Setup
1. Enable Vercel Blob in your project dashboard (Storage tab)
2. Vercel automatically adds `BLOB_READ_WRITE_TOKEN` environment variable
3. Files are uploaded with public access
4. CDN delivery for fast global access

### File URLs
Files uploaded to Vercel Blob have URLs like:
```
https://[hash].public.blob.vercel-storage.com/style-library/filename-[timestamp].jpg
```

## Best Practices

### Folder Organization
```
/
├── Slider Images/
│   ├── Homepage/
│   ├── Promotional/
│   └── Events/
├── Social Media Icons/
│   ├── Light/
│   └── Dark/
├── Products/
│   ├── Category A/
│   └── Category B/
└── Brand Assets/
    ├── Logos/
    └── Backgrounds/
```

### Tagging Strategy
Use consistent tags for easy searching:
- **Purpose**: `hero`, `thumbnail`, `icon`, `background`
- **Campaign**: `summer-2026`, `black-friday`, `launch`
- **Category**: `product`, `event`, `promotion`
- **Status**: `featured`, `archived`, `seasonal`

### File Naming
Use descriptive, consistent names:
- ✅ `summer-campaign-hero-1920x1080.jpg`
- ✅ `facebook-icon-dark.svg`
- ❌ `IMG_1234.jpg`
- ❌ `download.png`

## Troubleshooting

### Files Not Showing
1. Check if Vercel Blob is enabled in project settings
2. Verify `BLOB_READ_WRITE_TOKEN` is set
3. Check browser console for CORS errors
4. Ensure file was uploaded successfully (check file URL)

### Upload Failing
1. Check file size (must be under 50MB)
2. Verify file type is allowed
3. Check admin permissions
4. Verify Vercel Blob token is valid

### Folder Deletion Not Working
1. Folders with content require confirmation
2. Deletion is soft-delete (recoverable from database)
3. Check admin permissions

## Future Enhancements

Potential features to add:
- [ ] Bulk file upload with drag & drop
- [ ] Image editing (crop, resize) in-browser
- [ ] Video thumbnail generation
- [ ] File usage tracking (which pages use which assets)
- [ ] Duplicate detection
- [ ] Advanced search with filters
- [ ] Folder/file sharing permissions
- [ ] Version history for files
- [ ] Backup/export functionality

## Migration from Old System

If you have existing files in `/public/uploads/`, you can migrate them:

1. Upload files to Style Library via admin UI
2. Update database records to use new Vercel Blob URLs
3. Run this migration script (create as needed):

```typescript
// scripts/migrate-to-style-library.ts
import { prisma } from '@/lib/db';

async function migrateSliderImages() {
  const slides = await prisma.sliderContent.findMany({
    where: {
      media_url: { startsWith: '/uploads/' }
    }
  });

  console.log(`Found ${slides.length} slides to migrate`);
  
  for (const slide of slides) {
    // Upload to Vercel Blob and update URL
    // (Implementation depends on your specific needs)
  }
}

migrateSliderImages();
```

## Conclusion

The Style Library provides a professional, centralized way to manage all media assets in your Next.js application. It eliminates the need for separate upload implementations across different features and ensures all files are properly stored in Vercel Blob for production reliability.

For questions or issues, refer to:
- [Vercel Blob Documentation](https://vercel.com/docs/storage/vercel-blob)
- [VERCEL_BLOB_SETUP.md](./VERCEL_BLOB_SETUP.md) for initial setup
