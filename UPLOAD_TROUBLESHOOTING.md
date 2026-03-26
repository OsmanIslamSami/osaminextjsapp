# Upload Issues Troubleshooting Guide

## Quick Diagnostics

### 1. Check System Configuration

Visit this URL to see your system configuration:
```
http://localhost:3000/api/style-library/diagnostics
```

Or in production:
```
https://your-domain.vercel.app/api/style-library/diagnostics
```

This will show:
- ✅ Vercel Blob configured: Yes/No
- 📊 File size limits
- 📝 Allowed file types

### 2. Check Browser Console

1. Open browser DevTools (F12)
2. Go to **Console** tab
3. Try uploading a file
4. Look for error messages (they'll be red)

### 3. Check Network Tab

1. Open browser DevTools (F12)
2. Go to **Network** tab
3. Try uploading a file
4. Click on the failed request (will be red)
5. Check the **Response** tab for error details

## Common Issues & Solutions

### ❌ Issue: "Storage not configured"

**Cause:** Vercel Blob is not enabled

**Solution:**
1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Storage** tab
4. Click **Create Database** → Select **Blob**
5. Click **Create**
6. Redeploy your app

### ❌ Issue: "File too large"

**Cause:** File exceeds 50MB limit

**Solution Option 1 - Compress the video:**
```bash
# Use ffmpeg to compress MP4
ffmpeg -i input.mp4 -vcodec h264 -acodec aac -b:v 2M output.mp4
```

**Solution Option 2 - Increase the limit:**

Edit `app/api/style-library/files/route.ts`:
```typescript
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB
```

**Note:** Vercel has request body limits:
- Hobby plan: 4.5MB
- Pro plan: 4.5MB
- Enterprise: Custom

For large files, you may need to use direct Vercel Blob upload on the client side.

### ❌ Issue: "Invalid file type"

**Cause:** File MIME type doesn't match allowed types

**Check your file's MIME type:**
- `.mp4` should be `video/mp4`
- `.webm` should be `video/webm`

**Common issues:**
- Some `.mp4` files are detected as `video/quicktime` or `video/x-m4v`
- Fix by re-encoding:
```bash
ffmpeg -i input.mp4 -codec copy output.mp4
```

**Or add the type to allowed list:**
```typescript
// In app/api/style-library/files/route.ts
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
  'video/mp4', 'video/webm', 'video/quicktime', 'video/x-m4v', // Add these
  'application/pdf',
  'image/x-icon', 'image/vnd.microsoft.icon'
];
```

### ❌ Issue: "Failed to upload file" (Generic error)

**Check server logs:**

**Development:**
Look at terminal where `npm run dev` is running

**Production (Vercel):**
1. Go to Vercel Dashboard
2. Select your project
3. Click **Deployments**
4. Click on latest deployment
5. Click **Functions** tab
6. Find `/api/style-library/files`
7. View logs

### ❌ Issue: Upload works for small files but fails for large ones

**Cause:** Vercel serverless function timeout or body size limit

**Solutions:**

1. **Enable streaming uploads** (for Pro plan):
   ```typescript
   // In route.ts
   export const config = {
     api: {
       bodyParser: {
         sizeLimit: '100mb',
       },
     },
   };
   ```

2. **Use client-side Vercel Blob upload**:
   ```typescript
   // Instead of uploading through API, upload directly from client
   import { upload } from '@vercel/blob/client';
   
   const blob = await upload(file.name, file, {
     access: 'public',
     handleUploadUrl: '/api/upload-url',
   });
   ```

## Specific Error Messages

### "Blob upload failed: fetch failed"
- **Cause:** Network issue or Vercel Blob service unavailable
- **Solution:** Try again, check internet connection

### "Blob upload failed: Unauthorized"
- **Cause:** `BLOB_READ_WRITE_TOKEN` is invalid or missing
- **Solution:** Regenerate token in Vercel dashboard

### "Blob upload failed: Request Entity Too Large"
- **Cause:** File exceeds Vercel's request body limit
- **Solution:** Use client-side upload or compress file

## Testing Upload Manually

Test with `curl` to isolate UI issues:

```bash
# Replace with your actual file and URL
curl -X POST http://localhost:3000/api/style-library/files \
  -H "Cookie: your-auth-cookie" \
  -F "file=@/path/to/video.mp4" \
  -F "description=Test upload" \
  -F "tags=test,video"
```

## File Size Recommendations

For optimal performance:

| File Type | Recommended Size | Max Size |
|-----------|------------------|----------|
| Images (JPEG/PNG) | < 2MB | 10MB |
| Images (WebP) | < 500KB | 5MB |
| Videos | < 20MB | 50MB |
| Icons/SVG | < 100KB | 500KB |
| PDFs | < 5MB | 20MB |

## Need More Help?

1. **Check the detailed logs** with the improvements I added:
   - Look for emojis in server logs: 📤 ✓ ❌
   - Upload attempt details
   - Validation results
   - Blob upload status

2. **Enable development mode** to see full stack traces:
   ```bash
   NODE_ENV=development npm run dev
   ```

3. **Share the exact error message** from:
   - Browser console
   - Network tab response
   - Server logs

## Quick Fix Checklist

- [ ] Vercel Blob is enabled in project settings
- [ ] `BLOB_READ_WRITE_TOKEN` exists in environment variables
- [ ] File size is under 50MB
- [ ] File type is `.mp4` with MIME type `video/mp4`
- [ ] You're logged in as admin
- [ ] Browser console shows no errors
- [ ] Network tab shows 201 (success) or specific error code

---

**Last Updated:** March 26, 2026
