# Research: Client Management UI with Dashboard

**Date**: 2026-03-25  
**Feature**: 001-client-management-ui  
**Status**: Complete

## Overview

This document consolidates research findings for implementing the dashboard and enhanced UI features. Key areas investigated: Tailwind CSS theme color strategy, chart library selection, dashboard metrics patterns, seed data generation, unit testing approach, and responsive grid layouts.

---

## 1. Tailwind CSS Theme Color Strategy

### Decision
Use Tailwind CSS v4 CSS variables with semantic color naming for dashboard components. Define custom properties in `app/globals.css` that map to theme-aware color schemes.

### Rationale
- **Consistency**: Centralized color definitions ensure uniform appearance across all dashboard components
- **Maintainability**: Single source of truth for color values; changes propagate automatically
- **Theme Support**: CSS variables enable future light/dark mode switching without component changes
- **Accessibility**: Predefined color combinations can be verified for WCAG AA contrast compliance

### Implementation Pattern
```css
/* app/globals.css */
:root {
  --color-primary: rgb(59 130 246);      /* blue-500 for primary actions */
  --color-success: rgb(34 197 94);       /* green-500 for completed status */
  --color-warning: rgb(234 179 8);       /* yellow-500 for pending status */
  --color-danger: rgb(239 68 68);        /* red-500 for cancelled status */
  --color-background: rgb(255 255 255);  /* white */
  --color-surface: rgb(249 250 251);     /* gray-50 for cards */
  --color-border: rgb(229 231 235);      /* gray-200 */
}
```

Usage in components:
```tsx
<div className="bg-[var(--color-surface)] border-[var(--color-border)]">
  {/* Or use Tailwind utilities: bg-gray-50 border-gray-200 */}
</div>
```

### Alternatives Considered
- **Hardcoded Tailwind utilities**: Rejected because changing the color scheme requires updates in every component
- **Tailwind config theme extension**: Rejected because CSS variables provide more runtime flexibility for future theming
- **Inline hex colors**: Rejected due to poor maintainability and no semantic meaning

---

## 2. Chart Library Selection

### Decision
Use **Recharts** for the dashboard donut chart implementation.

### Rationale
- **React Native**: Built specifically for React with declarative component API matching React patterns
- **TypeScript Support**: First-class TypeScript definitions included out of the box
- **Responsive**: Built-in responsiveness with `ResponsiveContainer` component
- **Tailwind Integration**: Accepts className props and works seamlessly with Tailwind colors
- **Bundle Size**: Smaller footprint than Chart.js when using tree-shaking (only import PieChart component)
- **Customization**: Easy to customize tooltips, labels, and colors via props

### Implementation Example
```tsx
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

const COLORS = {
  completed: 'rgb(34 197 94)',  // green-500
  pending: 'rgb(234 179 8)',    // yellow-500
  cancelled: 'rgb(239 68 68)'   // red-500
};

<ResponsiveContainer width="100%" height={300}>
  <PieChart>
    <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90}>
      {data.map((entry, index) => (
        <Cell key={`cell-${index}`} fill={COLORS[entry.status]} />
      ))}
    </Pie>
    <Tooltip />
  </PieChart>
</ResponsiveContainer>
```

### Alternatives Considered
- **Chart.js**: More feature-rich but requires canvas rendering and additional `react-chartjs-2` wrapper; TypeScript setup more complex
- **Victory**: Excellent accessibility but larger bundle size and SVG-only rendering can be slower for complex charts
- **Nivo**: Beautiful defaults but opinionated styling makes Tailwind integration harder

---

## 3. Dashboard Metrics Patterns in Next.js

### Decision
Implement server-side data fetching using Next.js App Router Server Components with a dedicated `/api/metrics` endpoint for real-time polling.

### Rationale
- **Server Components**: Dashboard page can be a Server Component that fetches initial data at build/request time (no loading spinner on first render)
- **Real-time Updates**: Client-side polling with SWR or React Query for live metrics updates every 30-60 seconds
- **Performance**: Aggregate queries run on database side (Prisma aggregations), reducing data transfer
- **Separation**: `/api/metrics` endpoint consolidates all dashboard queries in one place, enabling reuse and caching

### Implementation Pattern
```typescript
// app/api/metrics/route.ts
export async function GET() {
  const [clientCount, orderCount, statusBreakdown, recentClients, recentOrders] = await Promise.all([
    prisma.clients.count(),
    prisma.orders.count(),
    prisma.orders.groupBy({ by: ['status'], _count: true }),
    prisma.clients.findMany({ orderBy: { created_at: 'desc' }, take: 5 }),
    prisma.orders.findMany({ orderBy: { created_at: 'desc' }, take: 5, include: { clients: true } })
  ]);
  
  return Response.json({ clientCount, orderCount, statusBreakdown, recentClients, recentOrders });
}
```

```tsx
// app/dashboard/page.tsx (Server Component)
async function DashboardPage() {
  const metrics = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/metrics`).then(r => r.json());
  return <DashboardClient initialMetrics={metrics} />;
}
```

### Alternatives Considered
- **Client-side only fetching**: Rejected because it results in loading spinners and poor initial render
- **Server Actions**: Could work but less idiomatic for read-heavy operations; API routes better for caching and external clients
- **Static generation**: Rejected because dashboard data is dynamic and needs real-time updates

---

## 4. Seed Data Generation

### Decision
Create a TypeScript script `scripts/seed-dashboard-data.ts` that uses Prisma Client to generate 50 clients and 3-10 orders per client with realistic data.

### Rationale
- **Realistic Testing**: Provides sufficient data volume to test dashboard performance (500+ orders)
- **Status Distribution**: Generates orders with varied statuses (pending/completed/cancelled) to populate donut chart
- **Date Variance**: Creates clients and orders across multiple months to test month comparison logic
- **Idempotent**: Script checks for existing data and can be safely re-run without duplicates
- **Type Safety**: Using Prisma Client ensures type-checked data creation matching schema

### Implementation Pattern
```typescript
// scripts/seed-dashboard-data.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const statuses = ['pending', 'completed', 'cancelled'];

async function seed() {
  const existingCount = await prisma.clients.count();
  if (existingCount >= 50) {
    console.log('Seed data already exists');
    return;
  }

  for (let i = 0; i < 50; i++) {
    const client = await prisma.clients.create({
      data: {
        name: `Client ${i + 1}`,
        email: `client${i + 1}@example.com`,
        mobile: `555-010${i.toString().padStart(2, '0')}`,
        address: `${i + 1} Main St, City`,
        created_at: randomDateInPastMonths(3)
      }
    });

    const orderCount = Math.floor(Math.random() * 8) + 3; // 3-10 orders
    for (let j = 0; j < orderCount; j++) {
      await prisma.orders.create({
        data: {
          client_id: client.id,
          description: `Order ${j + 1} for ${client.name}`,
          status: statuses[Math.floor(Math.random() * statuses.length)],
          created_at: randomDateInPastMonths(2)
        }
      });
    }
  }
}

seed().catch(console.error).finally(() => prisma.$disconnect());
```

### Alternatives Considered
- **Faker.js library**: More realistic names/addresses but adds dependency; rejected for simplicity (can be added later)
- **SQL INSERT statements**: Faster for bulk data but loses type safety and requires manual schema updates
- **JSON fixtures**: Harder to maintain and less flexible than programmatic generation

---

## 5. Unit Testing Strategy

### Decision
Use **Vitest** with **React Testing Library** for component tests and API route tests. Focus on behavior testing over implementation details.

### Rationale
- **Vitest**: Modern, fast test runner with built-in TypeScript support; compatible with Jest APIs but faster
- **React Testing Library**: Promotes testing user behavior (clicks, renders) rather than component internals
- **No Integration Tests**: Per user requirements, skip integration tests; focus on isolated unit tests
- **API Route Testing**: Use `node-mocks-http` or Next.js internal test utilities to mock Request/Response objects

### Test Coverage Targets
- DonutChart component: Renders with data, displays correct colors, shows tooltip on hover
- MetricCard component: Displays count and label correctly, handles loading state
- Dashboard page: Renders all sections, displays metrics from API response
- `/api/metrics` endpoint: Returns correct data structure, handles database errors

### Implementation Pattern
```typescript
// __tests__/dashboard/DonutChart.test.tsx
import { render, screen } from '@testing-library/react';
import { DonutChart } from '@/lib/components/dashboard/DonutChart';

describe('DonutChart', () => {
  const mockData = [
    { status: 'completed', value: 45 },
    { status: 'pending', value: 30 },
    { status: 'cancelled', value: 15 }
  ];

  it('renders chart with correct data', () => {
    render(<DonutChart data={mockData} />);
    expect(screen.getByText(/completed/i)).toBeInTheDocument();
  });

  it('displays correct color for each status', () => {
    const { container } = render(<DonutChart data={mockData} />);
    const cells = container.querySelectorAll('path[stroke]');
    expect(cells).toHaveLength(3);
  });
});
```

### Alternatives Considered
- **Jest**: More established but slower than Vitest; rejected for performance benefits in TypeScript projects
- **Cypress Component Testing**: Overkill for unit tests; rejected since integration tests are out of scope
- **E2E with Playwright**: Valuable but skipped per user requirements (no integration tests)

---

## 6. Responsive Grid Layout Patterns

### Decision
Use Tailwind CSS grid utilities with mobile-first breakpoints: single column on mobile (`<768px`), 2-column on tablet (`768px-1024px`), 3+ column on desktop (`>1024px`).

### Rationale
- **Built-in Responsiveness**: Tailwind breakpoints handle all device sizes without custom CSS
- **Grid Auto Layout**: CSS Grid with `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` pattern adapts automatically
- **Card Components**: Wrapping each section in card components maintains visual consistency across breakpoints
- **Mobile-First**: Starting with single column ensures mobile users get optimal experience (priority per modern web practices)

### Implementation Pattern
```tsx
// Dashboard layout structure
<div className="container mx-auto px-4 py-8">
  {/* Metric cards */}
  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    <MetricCard title="Total Clients" value={metrics.clientCount} />
    <MetricCard title="Total Orders" value={metrics.orderCount} />
    <MetricCard title="This Month Clients" value={metrics.thisMonthClients} />
    <MetricCard title="Last Month Clients" value={metrics.lastMonthClients} />
  </div>

  {/* Main content area */}
  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
    <div className="bg-white rounded-lg shadow p-6">
      <DonutChart data={metrics.statusBreakdown} />
    </div>
    <div className="bg-white rounded-lg shadow p-6">
      <RecentActivity clients={metrics.recentClients} orders={metrics.recentOrders} />
    </div>
  </div>

  {/* Latest clients */}
  <div className="bg-white rounded-lg shadow p-6">
    <LatestClients clients={metrics.latestClients} />
  </div>
</div>
```

### Alternatives Considered
- **Flexbox**: Could work but grid provides better two-dimensional layout control for card grid
- **CSS Grid with custom breakpoints**: Unnecessary complexity when Tailwind defaults align with requirements
- **Component library (MUI, Chakra)**: Rejected to maintain consistency with existing Tailwind-only codebase

---

## Summary

All technical unknowns resolved. Technology choices prioritize:
- **Consistency**: Tailwind CSS theme colors and existing patterns
- **Performance**: Server-side rendering, efficient Prisma queries, lightweight chart library
- **Developer Experience**: TypeScript safety, modern testing tools (Vitest), clear separation of concerns
- **User Requirements**: Seed data, unit tests, responsive design, theme colors all addressed

No blockers identified. Ready to proceed to Phase 1 (Design & Contracts).
