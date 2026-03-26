# Vercel Blob Storage Setup Guide

## Why This Change Was Needed

The slider images and videos weren't showing on Vercel because:
- Files were being uploaded to the local filesystem (`public/uploads/slides/`)
- Vercel's serverless environment has an **ephemeral filesystem** 
- Runtime uploads don't persist between deployments or function restarts
- The `public` folder only serves files committed to git, not runtime uploads

## Solution: Vercel Blob Storage

Vercel Blob is a cloud storage service designed for Next.js apps on Vercel. It provides:
- ✅ Persistent file storage
- ✅ CDN delivery for fast global access
- ✅ Simple API integration
- ✅ Free tier: 500MB storage, 5GB bandwidth/month

---

## Setup Steps

### 1. Enable Vercel Blob in Your Project

1. Go to your project dashboard on [Vercel](https://vercel.com)
2. Navigate to **Storage** tab
3. Click **Create Database** → Select **Blob**
4. Click **Create** to provision Blob storage
5. Vercel will automatically add the `BLOB_READ_WRITE_TOKEN` environment variable

### 2. Deploy the Updated Code

The code has already been updated to use Vercel Blob:
- ✅ `@vercel/blob` package installed
- ✅ Upload route updated to use `put()` from Vercel Blob
- ✅ Delete route updated to clean up blob files

**Deploy to Vercel:**
```bash
git add .
git commit -m "feat: migrate slider uploads to Vercel Blob"
git push
```

Vercel will automatically deploy with the new blob storage configuration.

### 3. Re-upload Your Slider Content

Since the old files were stored locally and are now gone, you need to:

1. Go to your admin panel: `/admin/slider`
2. Delete old slides (they'll have broken image URLs)
3. Upload new slides - they'll now be stored in Vercel Blob
4. The new URLs will look like: `https://[hash].public.blob.vercel-storage.com/slides/filename-[hash].jpg`

---

## Alternative: Use Existing CDN URLs

If you don't want to use Vercel Blob, you can also:

1. Host images/videos on any CDN (Cloudinary, AWS S3, Imgur, etc.)
2. Copy the public URLs
3. Create slider entries directly in the database with those URLs:

```bash
npm run seed-slider
```

Then update the seed file with your CDN URLs.

---

## Environment Variables

After enabling Blob storage, verify these are set in your Vercel project:

```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

This is automatically added when you create Blob storage in Vercel.

---

## File Size Limits

Current limits in the upload API:
- **Max file size**: 10MB per file
- **Allowed types**: 
  - Images: JPEG, PNG, GIF
  - Videos: MP4, WebM

To increase limits, edit [app/api/slider/upload/route.ts](app/api/slider/upload/route.ts):
```typescript
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
```

---

## Cost Considerations

**Vercel Blob Free Tier:**
- 500MB storage
- 5GB bandwidth/month

**Pricing beyond free tier:**
- Storage: $0.15/GB/month
- Bandwidth: $0.10/GB

For most small-to-medium sites, the free tier is sufficient.

---

## Testing

1. **Local Development**: Still works! Vercel Blob works in dev mode too.
2. **Production**: Files are now stored in Blob and accessible globally.

Test by:
```bash
npm run dev
```

Visit `/admin/slider` and upload a test image/video.

---

## Troubleshooting

### Images still not showing?

1. **Check environment variables**: Ensure `BLOB_READ_WRITE_TOKEN` exists in Vercel
2. **Re-deploy**: Push your code changes to trigger a new deployment
3. **Clear old slides**: Delete slides with local URLs (`/uploads/slides/...`)
4. **Check browser console**: Look for 404 errors or CORS issues

### Can't upload files?

1. **Check token**: Verify `BLOB_READ_WRITE_TOKEN` is set correctly
2. **Check file size**: Ensure files are under 10MB
3. **Check file type**: Only JPEG, PNG, GIF, MP4, WebM allowed
