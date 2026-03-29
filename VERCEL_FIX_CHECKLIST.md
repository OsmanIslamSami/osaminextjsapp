# Vercel Deployment Fix - Quick Checklist

## Issues Fixed

### ✅ Issue 1: News Section Not Showing on Vercel
**Problem**: NewsSection was trying to fetch from API route using localhost URL in production

**Solution**: Changed NewsSection to query database directly using Prisma instead of HTTP fetch

**Files Modified**:
- `lib/components/home/NewsSection.tsx` - Now uses `prisma.news.findMany()` directly

### ✅ Issue 2: OG Image Not Showing When Sharing
**Problem**: Metadata base URL was only using environment variable, falling back to localhost

**Solution**: Added smart URL detection that uses Vercel's environment variables automatically

**Files Modified**:
- `app/layout.tsx` - Added `getBaseUrl()` function that checks:
  1. `NEXT_PUBLIC_BASE_URL` (if explicitly set)
  2. `VERCEL_URL` (automatically set by Vercel)
  3. `localhost:3000` (for local development)

### ✅ Issue 3: Teams Link Preview Not Working
**Problem**: Microsoft Teams requires file-based OG images and absolute URLs

**Solution**: Created `opengraph-image.tsx` file that Next.js automatically serves

**Files Created**:
- `app/opengraph-image.tsx` - Next.js auto-serves at `/opengraph-image`
- `TEAMS_PREVIEW_FIX.md` - Complete guide for Teams link previews

**Files Modified**:
- `app/layout.tsx` - Removed explicit image URLs (Next.js auto-detects)

## What You Need to Do in Vercel

### 1. Verify Environment Variables
Go to: Vercel Dashboard → Your Project → Settings → Environment Variables

**Required** (must be set):
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
DATABASE_URL=postgresql://...
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

**Optional** (no longer required, but can be set if you prefer):
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

### 2. Redeploy
After the code changes, you need to redeploy:

**Option A - Git Push (Recommended)**:
```bash
git add .
git commit -m "Fix Vercel deployment: direct DB query and auto URL detection"
git push origin main
```
Vercel will automatically redeploy.

**Option B - Manual Redeploy**:
1. Go to Vercel Dashboard → Your Project → Deployments
2. Click the three dots on the latest deployment
3. Select "Redeploy"

### 3. Verify the Fix

After deployment completes:

**Check News Section**:
1. Visit: `https://your-domain.vercel.app`
2. Scroll down to the "Latest News" section
3. You should see 6 news items displayed

**Check OG Images**:
1. Visit: `https://your-domain.vercel.app/opengraph-image`
2. You should see a purple/blue gradient image with "Next App" text  
3. Also check: `https://your-domain.vercel.app/api/og` (legacy route)

**Test Social Sharing**:
1. Copy your Vercel URL
2. Paste it into:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/
   - OpenGraph: https://www.opengraph.xyz/url/
3. You should see the OG image preview

**Test Microsoft Teams** (May require cache clearing):
1. Open Microsoft Teams
2. Paste your URL into any chat
3. Wait 5-10 seconds for preview to load
4. Should show: Image, Title, Description
5. If cached, try: `https://your-domain.vercel.app?v=1`
6. See [TEAMS_PREVIEW_FIX.md](TEAMS_PREVIEW_FIX.md) for troubleshooting

## Expected Results

✅ News section appears on home page
✅ All 6 news cards are displayed with images
✅ News cards are clickable and lead to detail pages
✅ OG image shows when sharing app link on Facebook/LinkedIn/Twitter
✅ Teams link preview shows image, title, and description
✅ News detail pages show correct metadata
✅ `/opengraph-image` serves valid 1200x630 PNG

## Troubleshooting

### If news section still doesn't show:
1. Check Vercel build logs for errors
2. Verify DATABASE_URL is connected to correct Neon database
3. Check if `is_visible = true` for news items in your database
4. Look at Function Logs in Vercel for any runtime errors

### If OG images still don't show:
1. Verify the `/opengraph-image` route is accessible
2. Check that `/api/og` also returns a valid image
3. Check browser console for any errors
4. Verify metadata in HTML source:
   ```bash
   curl https://your-domain.vercel.app | grep "og:image"
   ```
5. Try setting `NEXT_PUBLIC_BASE_URL` explicitly to your Vercel URL
6. Clear social media cache using their debug tools

### If Teams preview doesn't show:
1. **Clear Teams Cache** (most common issue):
   - Teams caches link previews for up to 24 hours
   - Try adding query parameter: `https://your-url.vercel.app?v=1`
   - See [TEAMS_PREVIEW_FIX.md](TEAMS_PREVIEW_FIX.md) for cache clearing steps

2. **Verify OG Image Works**:
   - Visit: `https://your-domain.vercel.app/opengraph-image`
   - Should return a 1200x630 PNG image

3. **Test with Other Validators First**:
   - Facebook debugger: https://developers.facebook.com/tools/debug/
   - If it works there but not Teams, it's a Teams cache issue

4. **Wait or Use Query Params**:
   - Change URL: `?v=1`, `?v=2`, `?test=1`, etc.
   - Each variation is cached separately
   - Or wait 24-48 hours for cache to expire

5. **Verify URL is Public**:
   - Make sure Vercel deployment isn't password protected
   - Teams must be able to access the URL from external networks

### If build fails:
1. Check for TypeScript errors: `npm run build` locally
2. Review Vercel build logs for specific error messages
3. Ensure all dependencies are listed in package.json

## Files Created/Updated

**Created**:
- `.env.example` - Template for environment variables
- `VERCEL_DEPLOYMENT.md` - Detailed deployment guide
- `VERCEL_FIX_CHECKLIST.md` - This file
- `TEAMS_PREVIEW_FIX.md` - Microsoft Teams link preview guide
- `app/opengraph-image.tsx` - File-based OG image (auto-served by Next.js)

**Updated**:
- `lib/components/home/NewsSection.tsx` - Direct database query + TypeScript fix
- `app/layout.tsx` - Smart URL detection + removed explicit image URLs
- `lib/i18n/translations/en.json` - Added "Next App" branding
- `lib/i18n/translations/ar.json` - Added "تطبيق الغد" branding
- `lib/components/Footer.tsx` - Bilingual app name
- `public/logo.svg` - Updated to "Next App"

## Next Steps

1. ✅ Code changes are complete
2. ⏳ Push to GitHub
3. ⏳ Wait for Vercel auto-deploy
4. ⏳ Test the deployment
5. ⏳ Verify both issues are resolved

All fixes are ready - just needs to be deployed! 🚀
