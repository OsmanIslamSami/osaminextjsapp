# 🚀 Complete Deployment Guide

**Client Management System - Production Deployment**  
**Platform**: Vercel  
**Last Updated**: April 13, 2026

---

## 📋 **Table of Contents**

1. [Prerequisites](#prerequisites)
2. [Environment Setup](#environment-setup)
3. [Database Configuration](#database-configuration)
4. [Vercel Blob Setup](#vercel-blob-setup)
5. [Clerk Authentication Setup](#clerk-authentication-setup)
6. [Vercel Deployment](#vercel-deployment)
7. [Post-Deployment Steps](#post-deployment-steps)
8. [Domain Configuration](#domain-configuration)
9. [Monitoring & Maintenance](#monitoring--maintenance)
10. [Troubleshooting](#troubleshooting)

---

## ✅ **1. Prerequisites**

### **Required Accounts**
- [ ] **GitHub** account (for code repository)
- [ ] **Vercel** account ([vercel.com](https://vercel.com))
- [ ] **Neon** account ([neon.tech](https://neon.tech)) - PostgreSQL database
- [ ] **Clerk** account ([clerk.com](https://clerk.com)) - Authentication

### **Local Development Setup**
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed
- [ ] Code editor (VS Code recommended)

### **Verify Local Build**
```bash
# Clone repository
git clone https://github.com/yourusername/osaminextjsapp.git
cd osaminextjsapp

# Install dependencies
npm install

# Copy environment template
cp .env.example .env.local

# Build project (verify no errors)
npm run build

# Start development server
npm run dev
```

---

## 🔐 **2. Environment Setup**

### **2.1 Create Environment Files**

**For Local Development** (`.env.local`):
```env
# Database (Neon)
DATABASE_URL="postgresql://user:password@ep-xxxxx.us-east-2.aws.neon.tech/neondb?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxx
CLERK_SECRET_KEY=sk_test_xxxxxxxxx

# Vercel Blob Storage
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxx

# App URL (update for production)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**For Production** (Vercel Dashboard):
- Same variables as above, but with production values
- Never commit `.env.local` to Git!

### **2.2 Environment Variable Reference**

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `DATABASE_URL` | ✅ Yes | Neon PostgreSQL connection string | `postgresql://user:pass@host/db` |
| `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` | ✅ Yes | Clerk public key (safe in browser) | `pk_live_xxxxxxxxx` |
| `CLERK_SECRET_KEY` | ✅ Yes | Clerk secret key (server-side only) | `sk_live_xxxxxxxxx` |
| `BLOB_READ_WRITE_TOKEN` | ✅ Yes | Vercel Blob storage token | `vercel_blob_rw_xxxxxxxxx` |
| `NEXT_PUBLIC_APP_URL` | ✅ Yes | Your production URL | `https://yoursite.com` |

---

## 🗄️ **3. Database Configuration**

### **3.1 Create Neon Database**

1. **Sign up** at [neon.tech](https://neon.tech)
2. Click **"New Project"**
3. Configure:
   - **Name**: `client-management-prod`
   - **PostgreSQL version**: 16
   - **Region**: Choose closest to your users (e.g., `us-east-2`)
4. Click **"Create Project"**
5. **Copy connection string** from dashboard

### **3.2 Configure Prisma**

```bash
# Update .env.local with your Neon connection string
DATABASE_URL="postgresql://..."

# Generate Prisma client
npm run prisma:generate

# Run migrations
npm run prisma:migrate

# Optional: Seed database with sample data
npm run seed
```

### **3.3 Create Admin User**

```bash
# Create your first admin user
npm run seed-admin

# Follow prompts:
# - Enter email (must match your Clerk account)
# - Enter name
# - Admin role assigned automatically
```

### **3.4 Database Backup Strategy**

**Neon Auto-Backups**:
- Neon automatically backs up your database
- Restore from dashboard: Project → Restores → Select date

**Manual Backup**:
```bash
# Export database
npm run db:export

# Restore from backup
npm run db:restore backup-file.sql
```

---

## 📦 **4. Vercel Blob Setup**

### **4.1 Enable Vercel Blob**

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project (or create new)
3. Go to **Storage** tab
4. Click **"Create Database"** → **"Blob"**
5. Name: `media-storage`
6. Click **"Create"**
7. Copy **"BLOB_READ_WRITE_TOKEN"** from environment variables

### **4.2 Configure Blob Token**

**In Vercel Project**:
1. Go to **Settings** → **Environment Variables**
2. Add:
   - **Key**: `BLOB_READ_WRITE_TOKEN`
   - **Value**: Your token (vercel_blob_rw_...)
   - **Environments**: Production, Preview, Development

**In Local .env.local**:
```env
BLOB_READ_WRITE_TOKEN=vercel_blob_rw_xxxxxxxxx
```

### **4.3 Verify Blob Connection**

```bash
# Run development server
npm run dev

# Test upload endpoint
curl http://localhost:3000/api/style-library/diagnostics

# Should return:
# {
#   "blob": { "configured": true, "canUpload": true },
#   "environment": "development"
# }
```

### **4.4 Blob Usage Notes**

- **Free Tier**: 1 GB storage, 100 GB bandwidth/month
- **Pro**: 100 GB storage, 1 TB bandwidth/month
- **Costs**: $0.15/GB storage, $0.05/GB bandwidth
- **Files**: Maximum 50MB per file
- **URLs**: Auto-generated, cached globally (CDN)

**See**: [VERCEL_BLOB_SETUP.md](VERCEL_BLOB_SETUP.md) for detailed configuration

---

## 🔑 **5. Clerk Authentication Setup**

### **5.1 Create Clerk Application**

1. Sign up at [clerk.com](https://clerk.com)
2. Click **"Create Application"**
3. Configure:
   - **Name**: Client Management System
   - **Sign-in methods**: Email, Google (optional), Facebook (optional)
   - **Theme**: Choose light/dark or use custom branding
4. Click **"Create Application"**

### **5.2 Get API Keys**

1. Go to **API Keys** in Clerk dashboard
2. Copy:
   - **Publishable Key** (`pk_test_...` for dev, `pk_live_...` for prod)
   - **Secret Key** (`sk_test_...` for dev, `sk_live_...` for prod)

### **5.3 Configure Webhooks (Optional)**

Webhooks sync Clerk users to your database automatically.

1. In Clerk dashboard, go to **Webhooks**
2. Click **"Add Endpoint"**
3. **URL**: `https://yoursite.com/api/users/sync`
4. **Events**: Select:
   - `user.created`
   - `user.updated`
   - `user.deleted`
5. Copy **Signing Secret** (for verifying webhook authenticity)
6. Add to Vercel environment variables:
   ```
   CLERK_WEBHOOK_SECRET=whsec_xxxxxxxxx
   ```

### **5.4 Configure Redirect URLs**

1. In Clerk dashboard, go to **Paths**
2. Set paths:
   - **Sign-in**: `/login`
   - **Sign-up**: `/login` (or `/signup` if you create one)
   - **After sign-in**: `/dashboard`
   - **After sign-up**: `/dashboard`
3. **Allowed Redirect URLs** (for production):
   - `https://yoursite.com/*`
   - `https://yoursite.vercel.app/*`

---

## 🚀 **6. Vercel Deployment**

### **6.1 Connect GitHub Repository**

1. Push your code to GitHub:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/osaminextjsapp.git
   git push -u origin main
   ```

2. In Vercel dashboard:
   - Click **"Add New Project"**
   - **Import Git Repository** → Select your repo
   - Click **"Import"**

### **6.2 Configure Build Settings**

Vercel auto-detects Next.js. Verify settings:

- **Framework**: Next.js
- **Root Directory**: `./` (unless repo has subdirectories)
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`
- **Node Version**: 18.x (or latest LTS)

### **6.3 Add Environment Variables**

In Vercel project settings:

1. Go to **Settings** → **Environment Variables**
2. Add all variables from section 2.2:
   - `DATABASE_URL`
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`
   - `BLOB_READ_WRITE_TOKEN`
   - `NEXT_PUBLIC_APP_URL` (set to your Vercel URL or custom domain)
3. Select environments: **Production**, **Preview**, **Development**
4. Click **"Save"**

**Important**: Use **production** credentials for Production environment, not test keys!

### **6.4 Deploy**

1. Click **"Deploy"**
2. Vercel builds and deploys (2-5 minutes)
3. Deployment URL: `https://your-project.vercel.app`
4. Check build logs for errors

**First Deploy Checklist**:
- [ ] Build completes without errors
- [ ] Prisma migrations run successfully
- [ ] Environment variables loaded correctly
- [ ] Site loads at Vercel URL

---

## ✅ **7. Post-Deployment Steps**

### **7.1 Database Migration on Production**

Vercel automatically runs migrations during build (via `npm run build`).

**Verify**:
```bash
# Check Prisma generates schema
# Build logs should show: "Prisma schema loaded from prisma/schema.prisma"
```

**Manual Migration** (if needed):
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Run command on production
vercel env pull .env.production
npx prisma migrate deploy --preview-feature
```

### **7.2 Create First Admin User**

**Option A: Via Database** (recommended for initial setup):
```sql
-- Connect to Neon database via SQL Editor
-- Replace email with your Clerk email

UPDATE "User"
SET role = 'admin'
WHERE email = 'your-email@example.com';
```

**Option B: Via Local Script** (if `seed-admin` doesn't run on Vercel):
1. Run locally: `npm run seed-admin`
2. Script syncs to production database (if DATABASE_URL points to prod)

### **7.3 Verify Deployment**

**Test Pages**:
- [ ] Home page loads (`/`)
- [ ] News page loads (`/news`)
- [ ] Photos gallery loads (`/photos`)
- [ ] Videos gallery loads (`/videos`)
- [ ] Partners page loads (`/partners`)
- [ ] Login page loads (`/login`)
- [ ] Dashboard redirects if not logged in (`/dashboard`)
- [ ] Admin panel redirects if not admin (`/admin`)

**Test Authentication**:
- [ ] Sign in redirects to dashboard
- [ ] Sign out works
- [ ] User role check works (admin vs user)

**Test Admin Panel**:
- [ ] Can create slider slide
- [ ] Can upload image to news
- [ ] Can add photo/video
- [ ] File uploads work (Vercel Blob)
- [ ] All pages load without errors

---

## 🌐 **8. Domain Configuration**

### **8.1 Add Custom Domain**

1. In Vercel project, go to **Settings** → **Domains**
2. Click **"Add Domain"**
3. Enter your domain: `yoursite.com`
4. Click **"Add"**

### **8.2 Configure DNS**

Vercel provides two options:

**Option A: Nameservers** (Recommended):
1. Copy Vercel nameservers from dashboard
2. Update nameservers in your domain registrar (GoDaddy, Namecheap, etc.)
3. Wait 24-48 hours for propagation

**Option B: CNAME Record**:
1. In domain registrar, add CNAME record:
   - **Name**: `www` (or `@` for root domain)
   - **Value**: `cname.vercel-dns.com`
2. For root domain (`yoursite.com`), add A record:
   - **Name**: `@`
   - **Value**: `76.76.21.21`
3. Wait 1-4 hours for propagation

### **8.3 Enable HTTPS**

- Vercel automatically provisions SSL certificate (Let's Encrypt)
- HTTPS becomes available within minutes of domain verification
- Auto-renews every 90 days

### **8.4 Update Environment Variables**

```env
# Update in Vercel dashboard
NEXT_PUBLIC_APP_URL=https://yoursite.com
```

### **8.5 Update Clerk Domain**

1. In Clerk dashboard, go to **Paths**
2. Update **Production domain** to `yoursite.com`
3. Add to allowed redirect URLs:
   - `https://yoursite.com/*`

### **8.6 Verify Custom Domain**

- [ ] Site loads at `https://yoursite.com`
- [ ] SSL certificate valid (padlock icon)
- [ ] HTTP redirects to HTTPS
- [ ] www redirects to non-www (or vice versa)
- [ ] Authentication works on custom domain

---

## 📊 **9. Monitoring & Maintenance**

###  **9.1 Vercel Analytics**

**Enable**:
1. Go to project → **Analytics** tab
2. Click **"Enable Analytics"**
3. View metrics: Page views, Visitors, Top pages, Performance

**Speed Insights**:
- Real User Monitoring (RUM)
- Core Web Vitals (LCP, FID, CLS)
- Performance scores per page

### **9.2 Error Tracking**

**Vercel Logs**:
- Go to **Deployments** → Click deployment → **Logs**
- View build logs and runtime logs
- Filter by function or search errors

**External Tools** (Optional):
- [Sentry](https://sentry.io) - Error tracking and performance
- [LogRocket](https://logrocket.com) - Session replay
- [Datadog](https://www.datadoghq.com) - Full-stack observability

### **9.3 Database Monitoring**

**Neon Dashboard**:
- **Metrics**: CPU usage, Memory, Connections
- **Query Performance**: Slow query log
- **Storage**: Database size, growth trends

**Alerts**:
- Set up email alerts for high CPU/memory
- Monitor connection pool exhaustion

### **9.4 Uptime Monitoring**

**Tools**:
- [UptimeRobot](https://uptimerobot.com) - Free, checks every 5 minutes
- [Pingdom](https://www.pingdom.com)
- [StatusCake](https://www.statuscake.com)

**Setup**:
1. Create account
2. Add monitor: `https://yoursite.com`
3. Set check interval: 5 minutes
4. Configure alerts: Email, SMS, Slack

### **9.5 Backup Strategy**

**Database Backups**:
- **Neon**: Automatic daily backups (7-day retention on free tier)
- **Manual**: Export weekly via Prisma Studio or SQL dump

**Code Backups**:
- GitHub repository (versioned)
- Vercel deployment history (rollback anytime)

**Media Backups**:
- Vercel Blob doesn't have auto-backup
- Download critical files manually
- Consider syncing to S3 or Google Drive

---

## 🛠️ **10. Troubleshooting**

### **Build Errors**

**Error: Prisma Client Not Generated**
```
Error: @prisma/client did not initialize yet
```

**Fix**:
```json
// In package.json, ensure postinstall runs
"scripts": {
  "postinstall": "prisma generate",
  "build": "prisma generate && next build"
}
```

**Error: Environment Variables Not Found**
```
Error: DATABASE_URL is not defined
```

**Fix**:
- Verify variables in Vercel Settings → Environment Variables
- Ensure variables selected for Production environment
- Redeploy after adding variables

---

### **Runtime Errors**

**Error: Cannot Connect to Database**
```
PrismaClientInitializationError: Can't reach database server
```

**Fix**:
1. Verify `DATABASE_URL` in Vercel environment variables
2. Check Neon database is active (not paused)
3. Verify IP allowlist in Neon (should allow all IPs for Vercel)
4. Test connection string locally

**Error: Clerk Authentication Failed**
```
ClerkAPIError: Invalid publishable key
```

**Fix**:
1. Use **production** keys (`pk_live_...`, `sk_live_...`)
2. Don't use test keys in production
3. Verify keys in Vercel environment variables
4. Check Clerk dashboard for key validity

**Error: Vercel Blob Upload Failed**
```
Error: No write token found
```

**Fix**:
1. Verify `BLOB_READ_WRITE_TOKEN` in Vercel environment variables
2. Ensure Vercel Blob is created in Storage tab
3. Token must start with `vercel_blob_rw_`
4. Redeploy after adding token

---

### **Performance Issues**

**Slow Page Load**
- **Cause**: Large images, too many API calls
- **Fix**:
  - Compress images (TinyPNG)
  - Enable lazy loading
  - Use Next.js Image optimization
  - Check Lighthouse for recommendations

**High Database Connections**
- **Cause**: Prisma connection pool exhausted
- **Fix**:
  - Increase connection_limit in DATABASE_URL: `?connection_limit=10`
  - Use connection pooling (Prisma Data Proxy)
  - Review slow queries in Neon dashboard

**Expensive Functions**
- **Cause**: Serverless function timeout (10s default)
- **Fix**:
  - Optimize API routes
  - Add pagination to large queries
  - Use caching (Redis, Vercel KV)
  - Upgrade Vercel plan for longer timeouts (Pro: 60s)

---

### **Domain Issues**

**Domain Not Resolving**
- **Cause**: DNS propagation delay or misconfigured records
- **Fix**:
  - Wait 24-48 hours for full propagation
  - Verify DNS records with `dig yoursite.com` or [dnschecker.org](https://dnschecker.org)
  - Ensure nameservers point to Vercel or CNAME is correct

**SSL Certificate Error**
- **Cause**: Certificate not yet provisioned or domain not verified
- **Fix**:
  - Wait 5-10 minutes after domain verification
  - Check Vercel dashboard: Domains tab should show "Valid"
  - Force renewal: Remove domain and re-add

---

## 📚 **Additional Resources**

- [Next.js Deployment Docs](https://nextjs.org/docs/deployment)
- [Vercel Docs](https://vercel.com/docs)
- [Neon Docs](https://neon.tech/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Prisma Deployment Guide](https://www.prisma.io/docs/guides/deployment)

**Project Documentation**:
- [README.md](README.md) - Overview
- [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) - Quick checklist
- [ADMIN_USER_GUIDE.md](ADMIN_USER_GUIDE.md) - Admin panel guide
- [TESTING_CHECKLIST.md](TESTING_CHECKLIST.md) - QA procedures

---

## ✅ **Deployment Checklist Summary**

Before going live, ensure:

- [ ] All tests pass locally (`npm test`)
- [ ] Build completes without errors (`npm run build`)
- [ ] Environment variables configured in Vercel
- [ ] Database migrations run on production
- [ ] Admin user created
- [ ] Vercel Blob configured and tested
- [ ] Clerk authentication works
- [ ] Custom domain configured (or Vercel URL noted)
- [ ] HTTPS enabled
- [ ] Monitoring/analytics enabled
- [ ] Uptime monitoring configured
- [ ] Backup strategy in place
- [ ] Admin panel tested on production
- [ ] Mobile responsiveness verified
- [ ] SEO metadata complete (titles, descriptions, OG images)
- [ ] Lighthouse score 90+ on all pages
- [ ] Error tracking configured
- [ ] Team notified of deployment

**Your site is now live! 🎉**

