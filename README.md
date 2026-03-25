# Client Management System

A modern client management application built with Next.js, featuring a comprehensive dashboard with analytics, client search with full audit trails, and real-time metrics.

## Features

### 📊 Dashboard
- Real-time metrics for clients and orders
- Order status breakdown with interactive donut chart
- Month-over-month comparison (this month vs last month)
- Recent activity lists (last 5 clients and orders)
- Latest clients table (showing last 10 additions)

### 👥 Client Search
- Full-text search across client name, email, and mobile
- Responsive card-based grid layout
- Complete audit trail (created_by, updated_by, timestamps)
- Sortable by creation date and last update date
- Mobile-first responsive design

### 🏠 Home Navigation
- Quick link cards to Dashboard and Client Search
- Clean, intuitive interface
- Clerk authentication integration

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19.2.3, Tailwind CSS 4
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL
- **ORM**: Prisma 7.5.0
- **Charts**: Recharts
- **Testing**: Vitest + React Testing Library

## Getting Started

### Prerequisites

- Node.js 20+
- PostgreSQL database (Neon recommended)
- Clerk account for authentication

### Installation

1. Clone the repository
2. Install dependencies:

```bash
npm install
```

3. Set up environment variables in `.env`:

```env
DATABASE_URL=postgresql://user:password@host/database
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

4. Run database migrations:

```bash
npx prisma migrate dev
```

5. Generate Prisma Client:

```bash
npx prisma generate
```

6. Seed the database with test data:

```bash
npx tsx scripts/seed-dashboard-data.ts
```

This creates 50 clients with random orders distributed across the last 3 months.

7. Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm test` - Run unit tests with Vitest
- `npm run test:ui` - Run tests with Vitest UI
- `npm run init-db` - Initialize database (legacy)

## Project Structure

```
app/
├── page.tsx              # Home page with quick links
├── dashboard/           
│   └── page.tsx         # Dashboard with analytics
├── clients/
│   └── page.tsx         # Client search and list
└── api/
    └── metrics/
        └── route.ts     # Metrics endpoint

lib/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── clients/         # Client-specific components
│   └── ui/              # Shared UI components
├── db.ts                # Database pool configuration
└── types.ts             # TypeScript types

prisma/
├── schema.prisma        # Database schema
└── migrations/          # Database migrations

scripts/
└── seed-dashboard-data.ts  # Test data generation
```

## Database Schema

### Clients
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- Soft delete: `is_deleted`, `deleted_by`, `deleted_at`
- Indexed on: `created_at`, `updated_at`, `is_deleted`

### Orders
- Status enum: `pending`, `completed`, `cancelled`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- Indexed on: `status`, `created_at`, `client_id`

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Neon Serverless Postgres](https://neon.tech/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Recharts](https://recharts.org/en-US/)

## License

MIT
