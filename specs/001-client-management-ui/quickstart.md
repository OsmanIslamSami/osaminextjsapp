# Quickstart: Client Management UI with Dashboard

**Feature**: 001-client-management-ui  
**Date**: 2026-03-25  
**Estimated Time**: 3-4 hours for complete implementation

## Overview

This guide walks you through implementing the dashboard and enhanced client management UI from scratch. Follow these steps in order for a smooth development experience.

---

## Prerequisites

- Node.js 20+ installed
- PostgreSQL database (Neon) connection configured in `.env`
- Clerk authentication already set up (existing in project)
- Familiarity with Next.js App Router, React, and Tailwind CSS

**Required Environment Variables**:
```env
DATABASE_URL=postgresql://user:password@host/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

---

## Step 1: Database Schema Migration (15 minutes)

### 1.1 Update Prisma Schema

Edit `prisma/schema.prisma` to add missing fields:

```prisma
enum OrderStatus {
  pending
  completed
  cancelled
}

model clients {
  id         Int       @id @default(autoincrement())
  name       String    @db.VarChar(255)
  address    String?
  email      String    @unique @db.VarChar(255)
  mobile     String?   @db.VarChar(20)
  created_by String    @db.VarChar(255) @default("system")
  updated_by String    @db.VarChar(255) @default("system")
  created_at DateTime  @default(now()) @db.Timestamp(6)
  updated_at DateTime  @default(now()) @updatedAt @db.Timestamp(6)
  orders     orders[]

  @@index([created_at], map: "idx_clients_created_at")
  @@index([updated_at], map: "idx_clients_updated_at")
}

model orders {
  id          Int         @id @default(autoincrement())
  client_id   Int
  order_date  DateTime    @default(now()) @db.Timestamp(6)
  description String
  address     String?
  mobile      String?     @db.VarChar(20)
  status      OrderStatus @default(pending)
  created_by  String      @db.VarChar(255) @default("system")
  updated_by  String      @db.VarChar(255) @default("system")
  created_at  DateTime    @default(now()) @db.Timestamp(6)
  updated_at  DateTime    @default(now()) @updatedAt @db.Timestamp(6)
  clients     clients     @relation(fields: [client_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([client_id], map: "idx_orders_client_id")
  @@index([status], map: "idx_orders_status")
  @@index([created_at], map: "idx_orders_created_at")
}
```

### 1.2 Generate Migration

```bash
npx prisma migrate dev --name add_audit_fields_and_order_status
```

This creates a migration file in `prisma/migrations/` and applies it to your database.

### 1.3 Regenerate Prisma Client

```bash
npx prisma generate
```

---

## Step 2: Install Dependencies (5 minutes)

### 2.1 Chart Library

```bash
npm install recharts
npm install --save-dev @types/recharts
```

### 2.2 Testing Libraries (if not already installed)

```bash
npm install --save-dev vitest @testing-library/react @testing-library/jest-dom jsdom
```

Add to `package.json`:
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui"
  }
}
```

---

## Step 3: Create Seed Data Script (20 minutes)

Create `scripts/seed-dashboard-data.ts`:

```typescript
import { PrismaClient, OrderStatus } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

function randomDate(monthsAgo: number): Date {
  const now = new Date();
  const past = new Date(now.getFullYear(), now.getMonth() - monthsAgo, 1);
  const diff = now.getTime() - past.getTime();
  return new Date(past.getTime() + Math.random() * diff);
}

async function main() {
  console.log('Starting seed...');

  const existingClients = await prisma.clients.count();
  if (existingClients >= 50) {
    console.log(`Already have ${existingClients} clients. Skipping seed.`);
    return;
  }

  const statuses: OrderStatus[] = ['pending', 'completed', 'cancelled'];
  const statusWeights = [0.25, 0.6, 0.15]; // 25% pending, 60% completed, 15% cancelled

  for (let i = 1; i <= 50; i++) {
    const client = await prisma.clients.create({
      data: {
        name: `Client ${i}`,
        email: `client${i}@example.com`,
        mobile: i % 2 === 0 ? `555-${String(i).padStart(4, '0')}` : null,
        address: i % 3 === 0 ? `${i} Main Street, City, State` : null,
        created_by: 'seed-script',
        updated_by: 'seed-script',
        created_at: randomDate(3)
      }
    });

    const orderCount = Math.floor(Math.random() * 8) + 3; // 3-10 orders
    for (let j = 1; j <= orderCount; j++) {
      const rand = Math.random();
      let status: OrderStatus = 'pending';
      if (rand < statusWeights[1]) status = 'completed';
      else if (rand < statusWeights[1] + statusWeights[2]) status = 'cancelled';

      await prisma.orders.create({
        data: {
          client_id: client.id,
          description: `Order ${j} for ${client.name}`,
          address: client.address,
          mobile: client.mobile,
          status,
          created_by: 'seed-script',
          updated_by: 'seed-script',
          created_at: randomDate(2)
        }
      });
    }

    console.log(`Created client ${i}/50 with ${orderCount} orders`);
  }

  console.log('Seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
```

**Run the seed**:
```bash
npx tsx scripts/seed-dashboard-data.ts
```

---

## Step 4: Create Metrics API Endpoint (30 minutes)

Create `app/api/metrics/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { PrismaClient } from '@/lib/generated/prisma';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    // Verify Clerk authentication
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      );
    }

    // Calculate month boundaries
    const now = new Date();
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);

    // Execute all queries in parallel
    const [
      clientCount,
      orderCount,
      thisMonthClients,
      lastMonthClients,
      thisMonthOrders,
      lastMonthOrders,
      statusBreakdown,
      recentClients,
      recentOrders,
      latestClients
    ] = await Promise.all([
      prisma.clients.count(),
      prisma.orders.count(),
      prisma.clients.count({ where: { created_at: { gte: currentMonthStart } } }),
      prisma.clients.count({ 
        where: { 
          created_at: { gte: lastMonthStart, lt: currentMonthStart } 
        } 
      }),
      prisma.orders.count({ where: { created_at: { gte: currentMonthStart } } }),
      prisma.orders.count({ 
        where: { 
          created_at: { gte: lastMonthStart, lt: currentMonthStart } 
        } 
      }),
      prisma.orders.groupBy({
        by: ['status'],
        _count: { status: true }
      }),
      prisma.clients.findMany({
        select: { id: true, name: true, email: true, created_at: true, created_by: true },
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      prisma.orders.findMany({
        select: {
          id: true,
          description: true,
          status: true,
          created_at: true,
          created_by: true,
          clients: { select: { name: true } }
        },
        orderBy: { created_at: 'desc' },
        take: 5
      }),
      prisma.clients.findMany({
        select: { id: true, name: true, email: true, mobile: true, created_at: true },
        orderBy: { created_at: 'desc' },
        take: 10
      })
    ]);

    return NextResponse.json({
      clientCount,
      orderCount,
      thisMonthClients,
      lastMonthClients,
      thisMonthOrders,
      lastMonthOrders,
      statusBreakdown: statusBreakdown.map(item => ({
        status: item.status,
        count: item._count.status
      })),
      recentClients: recentClients.map(c => ({
        ...c,
        created_at: c.created_at.toISOString()
      })),
      recentOrders: recentOrders.map(o => ({
        id: o.id,
        description: o.description,
        client_name: o.clients.name,
        status: o.status,
        created_at: o.created_at.toISOString(),
        created_by: o.created_by
      })),
      latestClients: latestClients.map(c => ({
        ...c,
        created_at: c.created_at.toISOString()
      }))
    });
  } catch (error) {
    console.error('Metrics API error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error', message: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
```

**Test the endpoint**:
```bash
curl http://localhost:3000/api/metrics
```

---

## Step 5: Build Dashboard Components (60 minutes)

### 5.1 Create MetricCard Component

Create `lib/components/dashboard/MetricCard.tsx`:

```tsx
interface MetricCardProps {
  title: string;
  value: number;
  icon?: React.ReactNode;
}

export function MetricCard({ title, value, icon }: MetricCardProps) {
  return (
    <div className="bg-white rounded-lg shadow p-6 border border-gray-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{value.toLocaleString()}</p>
        </div>
        {icon && <div className="text-blue-500">{icon}</div>}
      </div>
    </div>
  );
}
```

### 5.2 Create DonutChart Component

Create `lib/components/dashboard/DonutChart.tsx`:

```tsx
'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface ChartData {
  status: string;
  count: number;
}

interface DonutChartProps {
  data: ChartData[];
}

const COLORS = {
  completed: 'rgb(34 197 94)',  // green-500
  pending: 'rgb(234 179 8)',    // yellow-500
  cancelled: 'rgb(239 68 68)'   // red-500
};

export function DonutChart({ data }: DonutChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="count"
            nameKey="status"
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
          >
            {data.map((entry) => (
              <Cell key={entry.status} fill={COLORS[entry.status as keyof typeof COLORS]} />
            ))}
          </Pie>
          <Tooltip />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
```

### 5.3 Create Dashboard Page

Create `app/dashboard/page.tsx`:

```tsx
import { MetricCard } from '@/lib/components/dashboard/MetricCard';
import { DonutChart } from '@/lib/components/dashboard/DonutChart';

async function getMetrics() {
  const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/metrics`, {
    cache: 'no-store'
  });
  if (!res.ok) throw new Error('Failed to fetch metrics');
  return res.json();
}

export default async function DashboardPage() {
  const metrics = await getMetrics();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <MetricCard title="Total Clients" value={metrics.clientCount} />
        <MetricCard title="Total Orders" value={metrics.orderCount} />
        <MetricCard title="This Month Clients" value={metrics.thisMonthClients} />
        <MetricCard title="Last Month Clients" value={metrics.lastMonthClients} />
      </div>

      {/* Donut Chart & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          <DonutChart data={metrics.statusBreakdown} />
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Recent Activity</h2>
          {/* Add recent clients/orders lists here */}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 6: Create Home Page (15 minutes)

Update `app/page.tsx`:

```tsx
import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <h1 className="text-4xl font-bold text-center mb-12">Client Management System</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        <Link
          href="/dashboard"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-lg p-8 text-center transition-colors"
        >
          <h2 className="text-2xl font-bold mb-2">Dashboard</h2>
          <p>View metrics and analytics</p>
        </Link>

        <Link
          href="/clients"
          className="bg-green-500 hover:bg-green-600 text-white rounded-lg p-8 text-center transition-colors"
        >
          <h2 className="text-2xl font-bold mb-2">Search Clients</h2>
          <p>Find and manage clients</p>
        </Link>
      </div>
    </div>
  );
}
```

---

## Step 7: Run and Test (10 minutes)

### 7.1 Start Development Server

```bash
npm run dev
```

### 7.2 Manual Testing Checklist

- [ ] Visit `http://localhost:3000` - home page displays
- [ ] Click "Dashboard" - redirects to `/dashboard`
- [ ] Dashboard displays metric cards with counts
- [ ] Donut chart renders with colored segments
- [ ] Click "Search Clients" - redirects to `/clients`
- [ ] Client search page works (existing functionality)

### 7.3 Run Unit Tests

```bash
npm test
```

---

## Common Issues & Solutions

### Issue: Prisma import path errors
**Solution**: Ensure `prisma/config.ts` has correct output path:
```typescript
output: "../lib/generated/prisma"
```

### Issue: "Cannot read property 'status'" in DonutChart
**Solution**: Add null check:
```tsx
{data?.length > 0 ? <DonutChart data={data} /> : <p>No data</p>}
```

### Issue: Clerk auth fails in API route
**Solution**: Make sure `.env.local` has both keys:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=...
CLERK_SECRET_KEY=...
```

---

## Next Steps

1. Add unit tests for components and API route
2. Implement RecentActivity and LatestClients components
3. Add loading states and error boundaries
4. Enhance client search with filters
5. Add export functionality (future enhancement)

---

## Time Estimates

| Task | Time |
|------|------|
| Schema migration | 15 min |
| Install dependencies | 5 min |
| Seed data script | 20 min |
| Metrics API endpoint | 30 min |
| Dashboard components | 60 min |
| Home page | 15 min |
| Testing | 10 min |
| **Total** | **~3 hours** |

---

## Resources

- [Recharts Documentation](https://recharts.org)
- [Next.js App Router](https://nextjs.org/docs/app)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Prisma Client API](https://www.prisma.io/docs/orm/prisma-client)
- [Clerk Next.js SDK](https://clerk.com/docs/quickstarts/nextjs)

---

**Happy Coding!** 🚀
