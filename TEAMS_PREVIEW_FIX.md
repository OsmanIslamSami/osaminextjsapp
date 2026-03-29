# Microsoft Teams Link Preview Fix

## What Was Fixed

Microsoft Teams requires specific Open Graph metadata format for link previews. The following changes ensure your app displays properly when shared in Teams:

### 1. ✅ Created File-Based OG Image
**File**: `app/opengraph-image.tsx`

Next.js automatically generates and serves this image at `/opengraph-image` which is more reliable than dynamic API routes for social platforms.

### 2. ✅ Updated Metadata Configuration  
**File**: `app/layout.tsx`

- Added absolute URL for `baseUrl` in metadata
- Removed explicit image URLs (Next.js auto-detects `opengraph-image.tsx`)
- Ensured all OG properties are present

### 3. ✅ Proper URL Detection
The app now auto-detects the correct URL in production using Vercel's environment variables.

## Testing Link Previews

### After Deployment

1. **Verify OG Image Generation**
   ```
   Visit: https://your-domain.vercel.app/opengraph-image
   ```
   You should see a 1200x630 PNG image with purple gradient and "Next App" branding.

2. **Test with Debugging Tools**

   **Microsoft Teams Link Preview Tester**:
   - Unfortunately, Teams doesn't have a public debug tool
   - Best way is to test directly in Teams

   **Alternative Validators** (Teams uses similar standards):
   - Facebook: https://developers.facebook.com/tools/debug/
   - LinkedIn: https://www.linkedin.com/post-inspector/
   - Twitter: https://cards-dev.twitter.com/validator
   - OpenGraph.xyz: https://www.opengraph.xyz/url/

3. **Test in Microsoft Teams**
   
   **Method 1 - Direct Test**:
   - Open Teams
   - Go to any chat or channel
   - Paste your URL: `https://your-domain.vercel.app`
   - Press Enter (don't send yet)
   - Wait 2-3 seconds for preview to load
   
   **Expected Result**:
   ```
   [Preview Card]
   📱 Image: Purple gradient with "Next App" logo
   📝 Title: Next App - Modern Business Platform
   📄 Description: Modern Next.js application with...
   🔗 Link: your-domain.vercel.app
   ```

## Troubleshooting

### Issue: Preview Shows Old/Cached Content

**Cause**: Teams caches link previews aggressively

**Solutions**:

1. **Add Query Parameter**
   ```
   https://your-domain.vercel.app?v=2
   ```
   This tricks Teams into thinking it's a new URL

2. **Wait 24 Hours**
   Teams cache can take up to 24 hours to expire

3. **Test in Different Conversation**
   Try pasting the link in a different chat/channel

4. **Clear Teams Cache** (Desktop App):
   - Windows: 
     ```
     %appdata%\Microsoft\Teams\Cache
     %appdata%\Microsoft\Teams\blob_storage
     %appdata%\Microsoft\Teams\databases
     %appdata%\Microsoft\Teams\GPUcache
     %appdata%\Microsoft\Teams\IndexedDB
     %appdata%\Microsoft\Teams\Local Storage
     ```
   - Mac:
     ```
     ~/Library/Application Support/Microsoft/Teams/Cache
     ~/Library/Application Support/Microsoft/Teams/blob_storage
     ~/Library/Application Support/Microsoft/Teams/databases
     ~/Library/Application Support/Microsoft/Teams/GPUcache
     ~/Library/Application Support/Microsoft/Teams/IndexedDB
     ~/Library/Application Support/Microsoft/Teams/Local Storage
     ```
   
   Delete these folders, then restart Teams

### Issue: No Preview at All

**Possible Causes**:

1. **URL Not Publicly Accessible**
   - Make sure your Vercel deployment is public (not password protected)
   - Check if your domain is reachable from external networks

2. **OG Image Not Loading**
   - Verify `/opengraph-image` returns a valid image
   - Check Vercel deployment logs for errors in image generation

3. **Metadata Missing**
   - Verify metadata is in the HTML by viewing source:
     ```
     curl https://your-domain.vercel.app | grep "og:"
     ```
   - Should see multiple `<meta property="og:...">` tags

4. **HTTPS Required**
   - Teams only shows previews for HTTPS URLs
   - Local development (http://localhost) won't show previews in Teams

### Issue: Image Shows But Not Title/Description

**Fix**: Verify metadata in HTML source
```bash
curl https://your-domain.vercel.app | grep -E "(og:title|og:description)"
```

Should return:
```html
<meta property="og:title" content="Next App - Modern Business Platform">
<meta property="og:description" content="Modern Next.js application...">
```

### Issue: Works in Facebook Debug Tool But Not Teams

**Cause**: Teams has different caching behavior

**Solution**: 
- Teams caches more aggressively than Facebook
- Use query parameter trick: `?v=1`, `?v=2`, etc.
- Or wait for cache to expire (up to 24 hours)

## How Next.js OG Images Work

### File-Based Images (Recommended ✅)
```
app/
  opengraph-image.tsx    → Served at /opengraph-image
  twitter-image.tsx      → Served at /twitter-image (optional)
```

**Benefits**:
- Automatically detected by Next.js
- More reliable for social platforms
- Proper content-type headers
- Supports dynamic generation

### API Route Images (Legacy)
```
app/api/og/route.tsx    → Served at /api/og
```

**Issues**:
- Some platforms have trouble with dynamic routes
- May need explicit URL in metadata
- Less reliable caching

## Verification Checklist

After deploying, verify all these work:

- [ ] `/opengraph-image` returns 200 with valid PNG image
- [ ] Page source contains `<meta property="og:title">`
- [ ] Page source contains `<meta property="og:description">`  
- [ ] Page source contains `<meta property="og:image">`
- [ ] Image URL is absolute (starts with https://)
- [ ] Facebook debugger shows preview correctly
- [ ] LinkedIn post inspector shows preview correctly
- [ ] Teams chat shows preview (may need cache clear)

## Quick Test Commands

```bash
# Test OG image is accessible
curl -I https://your-domain.vercel.app/opengraph-image

# Extract all OG tags
curl -s https://your-domain.vercel.app | grep -o '<meta property="og:[^>]*>'

# Test with multiple validators at once
# Paste your URL into:
# - https://www.opengraph.xyz/url/
# - https://developers.facebook.com/tools/debug/
# - https://www.linkedin.com/post-inspector/
```

## Expected Metadata Output

When you view the HTML source, you should see:

```html
<meta property="og:type" content="website">
<meta property="og:locale" content="en_US">
<meta property="og:url" content="https://your-domain.vercel.app">
<meta property="og:site_name" content="Next App">
<meta property="og:title" content="Next App - Modern Business Platform">
<meta property="og:description" content="Modern Next.js application with advanced features, news management, and client services">
<meta property="og:image" content="https://your-domain.vercel.app/opengraph-image">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta property="og:image:alt" content="Next App - Modern Business Platform">
<meta property="og:image:type" content="image/png">
```

## Support

If link previews still don't work after trying all troubleshooting steps:

1. Check Vercel deployment logs for any errors
2. Verify environment variables are set correctly
3. Test with query parameters to bypass cache
4. Wait 24-48 hours for Teams cache to expire
5. Try sharing in a different Teams organization (different cache)

---

**Note**: Microsoft Teams can take 5-30 seconds to generate link previews, and caches are very aggressive. Be patient and use cache-busting techniques if needed.
