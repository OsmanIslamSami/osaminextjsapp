# Vercel Deployment Guide

## Required Environment Variables

Configure these in your Vercel project settings at: `https://vercel.com/[your-team]/[your-project]/settings/environment-variables`

### 1. Clerk Authentication
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
```

Get these from: https://dashboard.clerk.com
- Select your application
- Go to "API Keys"
- Copy both the Publishable Key and Secret Key

### 2. Database (Neon PostgreSQL)
```
DATABASE_URL=postgresql://...
```

Get this from: https://console.neon.tech
- Select your project
- Go to "Connection Details"
- Copy the connection string
- Make sure to use the **Pooled connection** URL

### 3. Vercel Blob Storage
```
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_...
```

Get this from: https://vercel.com/dashboard/stores
- Create a new Blob store or use existing
- Copy the Read/Write token
- Add it to your environment variables

### 4. Application URL (Optional)
```
NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
```

**Note**: This is now optional! The app will automatically detect the URL from Vercel's environment. Only set this if you're using a custom domain and experiencing issues with:
- Open Graph images not showing when sharing links
- Metadata not working correctly

## Deployment Steps

1. **Push your code to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Select your project

3. **Configure Environment Variables**
   - Add all required environment variables listed above
   - Make sure to add them for all environments (Production, Preview, Development)

4. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

5. **Verify Deployment**
   - Check that the news section appears on the home page
   - Test sharing a link on social media to verify OG images work
   - Test user authentication with Clerk
   - Test database connections

## Common Issues

### News section not showing
**Cause**: Database connection issue or no visible news in database

**Fix**:
1. Check DATABASE_URL is correct in Vercel environment variables
2. Verify news items exist with `is_visible = true` in your database
3. Check Vercel build logs for any errors

### OG images not showing when sharing
**Cause**: Metadata base URL not configured correctly

**Fix**:
1. The app now auto-detects the URL from Vercel
2. If still having issues, set `NEXT_PUBLIC_BASE_URL` to your full deployment URL
3. Verify `/api/og` route is working by visiting: `https://your-domain.vercel.app/api/og`

### Authentication not working
**Cause**: Clerk environment variables not set or incorrect

**Fix**:
1. Verify both `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
2. Make sure you're using the correct keys for your environment
3. Check Clerk dashboard for any domain restrictions

### Build failures
**Cause**: TypeScript errors or missing dependencies

**Fix**:
1. Run `npm run build` locally to catch errors before deploying
2. Check Vercel build logs for specific error messages
3. Ensure all dependencies are in `package.json`

## Auto-Detection Features

The app now includes smart URL detection:
- In production on Vercel, it uses `VERCEL_URL` environment variable
- Falls back to `NEXT_PUBLIC_BASE_URL` if set
- Uses `localhost:3000` for local development

This means you typically don't need to set `NEXT_PUBLIC_BASE_URL` manually.

## Testing OG Images

After deployment, test your OG images:

1. Visit: `https://your-domain.vercel.app/api/og`
   - You should see a purple/blue gradient image with "Next App" text

2. Use social media debuggers:
   - Facebook: https://developers.facebook.com/tools/debug/
   - Twitter: https://cards-dev.twitter.com/validator
   - LinkedIn: https://www.linkedin.com/post-inspector/

3. Paste your deployed URL and verify the preview image appears correctly
