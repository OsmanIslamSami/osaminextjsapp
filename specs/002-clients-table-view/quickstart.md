# Quickstart: Clients Table with Action Icons

**Feature**: 002-clients-table-view  
**Branch**: `002-clients-table-view`  
**Estimated Setup Time**: 15-20 minutes

## Overview

This quickstart guide helps developers set up their local environment to work on the clients table feature. Follow these steps to get the feature branch running locally with the necessary database migrations and dependencies.

## Prerequisites

Before starting, ensure you have:

- [x] Node.js 20+ installed
- [x] Git configured with repository access
- [x] Neon PostgreSQL account and project (or existing .env.local)
- [x] Clerk account configured (or existing Clerk keys in .env.local)
- [x] Code editor (VS Code recommended)

## Quick Start (5 Minutes)

```bash
# 1. Checkout feature branch
git checkout 002-clients-table-view

# 2. Install dependencies (including heroicons if not present)
npm install

# 3. Run database migration
npx prisma migrate dev --name add_client_company_status

# 4. Generate Prisma client with new types
npx prisma generate

# 5. Start development server
npm run dev
```

Open [http://localhost:3000/clients](http://localhost:3000/clients) to see the new table view.

---

## Detailed Setup

### Step 1: Environment Setup

#### 1.1 Clone and Branch

```bash
# If not already in repo
git clone <repo-url>
cd osaminextjsapp

# Checkout feature branch
git checkout 002-clients-table-view

# Verify branch
git branch --show-current
# Should output: 002-clients-table-view
```

#### 1.2 Install Dependencies

```bash
# Install all dependencies
npm install

# Verify heroicons is installed
npm list @heroicons/react
# Should show @heroicons/react@2.x.x
```

**If heroicons is missing**:
```bash
npm install @heroicons/react
```

---

### Step 2: Database Setup

#### 2.1 Environment Variables

Ensure `.env.local` contains:

```env
# Neon Database
DATABASE_URL="postgresql://user:password@host/dbname?sslmode=require"

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY="pk_test_..."
CLERK_SECRET_KEY="sk_test_..."
```

**Get DATABASE_URL**:
1. Log into [Neon Console](https://console.neon.tech/)
2. Select your project
3. Go to Connection Details
4. Copy the connection string (includes password)

**Get Clerk Keys**:
1. Log into [Clerk Dashboard](https://dashboard.clerk.com/)
2. Select your application
3. Go to API Keys
4. Copy Publishable Key and Secret Key

#### 2.2 Create Test Branch (Recommended)

```bash
# Create temporary Neon branch for safe testing
# (Requires Neon CLI: npm install -g neonctl)

neonctl branches create --name feature-002-test

# Update DATABASE_URL to point to test branch
# Neon provides branch-specific connection string
```

#### 2.3 Run Migration

```bash
# Apply migration (creates company and status fields)
npx prisma migrate dev --name add_client_company_status

# You should see:
# ✔ Generated Prisma Client
# ✔ The migration has been applied successfully
```

**What this does**:
- Creates `ClientStatus` enum in database
- Adds `company` (nullable) column to `clients` table
- Adds `status` (default Active) column to `clients` table
- Creates index on `status` field
- Generates TypeScript types

#### 2.4 Verify Migration

```bash
# Check schema in database
npx prisma db pull

# Or connect to database directly
psql $DATABASE_URL

# Run in psql:
\d clients
# Should show company and status columns

\dT
# Should show ClientStatus enum
```

#### 2.5 Seed Data (Optional)

```bash
# Add test data with company and status fields
npm run seed-dashboard-data
```

Or manually via Prisma Studio:

```bash
npx prisma studio

# Open http://localhost:5555
# Navigate to clients table
# Add/edit records with company and status fields
```

---

### Step 3: Verify Setup

#### 3.1 Start Development Server

```bash
npm run dev
```

Server should start on [http://localhost:3000](http://localhost:3000)

#### 3.2 Check Components

Verify the following files exist:

```bash
# Table components
ls lib/components/clients/ClientTable.tsx      # Main table component
ls lib/components/clients/StatusBadge.tsx      # Colored status badges

# API enhancement
ls app/api/clients/route.ts                    # Enhanced for pagination

# Updated page
ls app/clients/page.tsx                        # Table view implementation
```

If files are missing, ensure you're on the correct branch:
```bash
git checkout 002-clients-table-view
git pull origin 002-clients-table-view
```

#### 3.3 Test Database Types

Create a test file to verify Prisma types:

```typescript
// test-types.ts
import { ClientStatus } from '@/lib/generated/prisma/client';

// This should work without errors:
const status: ClientStatus = 'Active';  // ✓
const invalid: ClientStatus = 'Pending'; // ✗ Type error
```

Run type check:
```bash
npx tsc --noEmit
```

---

### Step 4: Development Workflow

#### 4.1 Running Tests

```bash
# Run all tests
npm test

# Run in watch mode
npm test -- --watch

# Run specific test file
npm test -- clients
```

#### 4.2 Checking Lints

```bash
npm run lint
```

Fix auto-fixable issues:
```bash
npm run lint -- --fix
```

#### 4.3 Hot Reload

Next.js supports hot reloading. Changes to:
- `app/clients/page.tsx` - Instant refresh
- `lib/components/**/*.tsx` - Instant refresh
- `app/api/clients/route.ts` - Requires manual refresh

#### 4.4 Database Changes

If you make schema changes:

```bash
# 1. Edit prisma/schema.prisma
# 2. Create migration
npx prisma migrate dev --name descriptive_name

# 3. Regenerate client
npx prisma generate
```

---

## Common Issues & Solutions

### Issue: "Cannot find module '@heroicons/react'"

**Solution**:
```bash
npm install @heroicons/react
```

### Issue: "Invalid `prisma.clients.findMany()` invocation"

**Cause**: Prisma client not regenerated after migration

**Solution**:
```bash
npx prisma generate
# Restart dev server
```

### Issue: "Column 'status' does not exist"

**Cause**: Migration not applied

**Solution**:
```bash
npx prisma migrate dev
```

### Issue: "Type error: Property 'company' does not exist on type 'clients'"

**Cause**: TypeScript using old Prisma types

**Solution**:
```bash
# Regenerate Prisma client
npx prisma generate

# Restart TypeScript server in VS Code
# Cmd/Ctrl + Shift + P → "TypeScript: Restart TS Server"
```

### Issue: "Unauthorized" when accessing /clients

**Cause**: Not logged in

**Solution**:
1. Navigate to [http://localhost:3000/login](http://localhost:3000/login)
2. Sign in with Clerk
3. Return to [http://localhost:3000/clients](http://localhost:3000/clients)

### Issue: Migration fails with "relation 'clients' already has column 'status'"

**Cause**: Migration already applied

**Solution**:
```bash
# Check migration status
npx prisma migrate status

# If migration is already applied, skip it
# If migration is partially applied, reset database:
npx prisma migrate reset
npx prisma migrate dev
```

---

## Development Checklist

Before starting development, verify:

- [ ] On correct branch: `002-clients-table-view`
- [ ] Dependencies installed: `npm install` complete
- [ ] Database migration applied: `npx prisma migrate dev`
- [ ] Prisma client generated: `npx prisma generate`
- [ ] Dev server running: `npm run dev`
- [ ] Can access clients page: [http://localhost:3000/clients](http://localhost:3000/clients)
- [ ] Clerk authentication working (can log in)
- [ ] Database has `company` and `status` columns
- [ ] TypeScript recognizes `ClientStatus` enum
- [ ] No lint errors: `npm run lint`

---

## Feature Testing Guide

### Test Scenarios

#### 1. Table Display
- [ ] Table shows Name, Email, Phone, Company, Status columns
- [ ] Striped rows (alternating gray/white)
- [ ] Status displayed as colored badge (green/gray)
- [ ] Options column shows view/edit/delete icons

#### 2. Infinite Scroll
- [ ] Initial load shows first 50 clients
- [ ] Scrolling to bottom loads more clients
- [ ] Loading spinner appears during fetch
- [ ] Stops loading when all clients fetched

#### 3. Action Icons
- [ ] Eye icon navigates to view page
- [ ] Pencil icon navigates to edit page
- [ ] Trash icon shows confirmation dialog

#### 4. Delete Confirmation
- [ ] Dialog shows client name
- [ ] Confirm button deletes client
- [ ] Cancel button closes dialog without deleting
- [ ] ESC key cancels

#### 5. Status Badges
- [ ] Active clients show green badge
- [ ] Inactive clients show gray badge
- [ ] Badge text is readable (sufficient contrast)

---

## Next Steps

After setup is complete:

1. **Review Architecture**: Read [data-model.md](data-model.md) and [research.md](research.md)
2. **Review API Contract**: Read [contracts/api-clients.md](contracts/api-clients.md)
3. **Start Implementation**: Follow tasks in [tasks.md](tasks.md) (created via `/speckit.tasks`)
4. **Write Tests**: Add test coverage for new components
5. **Update Documentation**: Document any deviations or improvements

---

## Useful Commands Reference

```bash
# Database
npx prisma migrate dev           # Apply migrations
npx prisma generate             # Regenerate Prisma client
npx prisma studio               # Open database GUI
npx prisma db push              # Push schema without migration (dev only)

# Development
npm run dev                     # Start dev server
npm run build                   # Build for production
npm run lint                    # Run linter
npm test                        # Run tests

# Neon (if using Neon CLI)
neonctl branches create         # Create test branch
neonctl branches delete         # Delete test branch
neonctl connection-string       # Get connection string
```

---

## Getting Help

**Documentation**:
- [Feature Spec](spec.md) - Requirements and user stories
- [Data Model](data-model.md) - Database schema changes
- [API Contract](contracts/api-clients.md) - API specification
- [Research](research.md) - Technical decisions

**Resources**:
- [Next.js Docs](https://nextjs.org/docs)
- [Prisma Docs](https://www.prisma.io/docs)
- [Clerk Docs](https://clerk.com/docs)
- [Heroicons](https://heroicons.com/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)

**Team Communication**:
- Create GitHub issue for bugs
- Ask questions in team Slack/Discord
- Review constitution: `.specify/memory/constitution.md`

---

**Setup Complete!** 🎉

You're ready to start implementing the clients table feature. Begin with the tasks outlined in [tasks.md](tasks.md).
