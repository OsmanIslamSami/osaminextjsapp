# 🚀 Quick Start Guide

## Prerequisites

- **Node.js** 18+ 
- **npm** or **pnpm**
- **PostgreSQL** database (we recommend [Neon](https://neon.tech))
- **Clerk** account for authentication
- **Vercel** account (optional, for Blob storage)

## Installation

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/osaminextjsapp.git
cd osaminextjsapp
```

### 2. Install Dependencies

```bash
npm install
```

This will:
- Install all npm packages
- Automatically run `prisma generate` (via postinstall script)

### 3. Set Up Environment Variables

Copy the example environment file:

```bash
cp .env.example .env
```

Edit `.env` and add your credentials:

```env
# Database (Neon Postgres recommended)
DATABASE_URL="postgresql://user:password@host/database?sslmode=require"

# Clerk Authentication
CLERK_SECRET_KEY="sk_test_..."
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."

# Vercel Blob Storage (optional, for file uploads)
BLOB_READ_WRITE_TOKEN="vercel_blob_..."

# Admin User (for seeding)
ADMIN_EMAIL="admin@example.com"
ADMIN_CLERK_USER_ID="user_..."
```

See [.env.example](.env.example) for detailed explanations.

### 4. Set Up Database

Run Prisma migrations:

```bash
npx prisma migrate deploy
```

### 5. Seed Initial Data

#### Create Admin User:
```bash
npm run seed-admin
```

#### Seed Sample Data (Optional):
```bash
npm run seed-header-navigation  # Header navigation links
npm run seed-slider             # Hero slider
npm run seed-news               # Sample news articles
npm run seed-faq-magazines      # FAQ and magazines
npm run seed-media-library      # Photos and videos
```

### 6. Start Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## 🎯 First Steps After Installation

### 1. **Log In as Admin**
- Go to `/login` and sign in with your Clerk account
- Your account should be automatically synced as admin if you set `ADMIN_EMAIL` correctly

### 2. **Configure App Settings**
- Go to `/admin/app-settings`
- Set site title, description, SEO settings
- Choose theme and colors
- Upload logo and favicon

### 3. **Set Up Home Sections**
- Go to `/admin/home-sections`
- Enable/disable sections (News, Photos, Videos, Partners, etc.)

### 4. **Add Content**
- **News**: `/admin/news` - Create articles
- **Photos**: `/admin/photos` - Upload images
- **Videos**: `/admin/videos` - Add YouTube videos
- **Partners**: `/admin/partners` - Add partner logos
- **FAQ**: `/admin/faq` - Create Q&A items
- **Magazines**: `/admin/magazines` - Upload PDF magazines
- **Slider**: `/admin/slider` - Configure hero slider

---

##Commands

### Development
```bash
npm run dev          # Start dev server (http://localhost:3000)
npm run build        # Build for production
npm start            # Start production server (after build)
npm run lint         # Run ESLint
```

### Database
```bash
npx prisma generate       # Generate Prisma Client
npx prisma migrate dev    # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio         # Open Prisma Studio (DB GUI)
```

### Testing
```bash
npm test              # Run Vitest tests
npm test -- --run     # Run once without watch mode
npm test -- --ui      # Open Vitest UI
```

### Deployment
```bash
vercel                # Deploy to Vercel (preview)
vercel --prod         # Deploy to production
```

---

## 📚 Additional Documentation

- **[DEPLOYMENT_CHECKLIST.md](docs/DEPLOYMENT_CHECKLIST.md)** - Production deployment guide
- **[VERCEL_BLOB_SETUP.md](docs/VERCEL_BLOB_SETUP.md)** - File upload configuration
- **[THEME_SYSTEM.md](docs/THEME_SYSTEM.md)** - Theme customization guide
- **[ADMIN_USER_GUIDE.md](docs/ADMIN_USER_GUIDE.md)** - Admin panel documentation
- **[FINAL_STATUS_REPORT.md](docs/FINAL_STATUS_REPORT.md)** - Project completion status

---

## 🆘 Troubleshooting

### Port 3000 Already in Use
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F

# Mac/Linux
lsof -ti:3000 | xargs kill -9
```

### Database Connection Issues
- Check `DATABASE_URL` format
- Ensure database exists
- For Neon: Enable "SSL Mode" in connection string

### Clerk Authentication Not Working
- Verify `CLERK_SECRET_KEY` and `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- Check Clerk dashboard for correct environment (development vs production)
- Ensure redirect URLs are configured in Clerk dashboard

### File Uploads Failing
- Verify `BLOB_READ_WRITE_TOKEN` is set
- Check Vercel Blob is enabled in Vercel dashboard
- For local development, files save to `/public/uploads` (not persistent on Vercel)

---

## 🤝 Support

For issues or questions:
1. Check [documentation](docs/)
2. Review [UPLOAD_TROUBLESHOOTING.md](docs/UPLOAD_TROUBLESHOOTING.md)
3. Open an issue on GitHub

---

## 📦 Tech Stack

- **Framework**: Next.js 16 (App Router, React Server Components)
- **Database**: PostgreSQL with Prisma ORM
- **Auth**: Clerk
- **Storage**: Vercel Blob
- **Styling**: Tailwind CSS
- **Animation**: Framer Motion
- **Testing**: Vitest + React Testing Library
- **Deployment**: Vercel

---

**Ready to build something amazing!** 🚀
