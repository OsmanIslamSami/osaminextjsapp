# Next App

A modern client management application built with Next.js, featuring a comprehensive dashboard with analytics, client search with full audit trails, real-time metrics, and content management for FAQ and Magazine sections.

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

### ❓ FAQ Management
- **Admin Interface** (`/admin/faq`):
  - Create, edit, and delete FAQs with bilingual content (English/Arabic)
  - Mark FAQs as favorites for priority display on home page
  - Pagination controls (10, 20, 50, 100, 500 items per page)
  - Toggle favorite status with visual star icon
  - Soft-delete functionality with audit trails
- **Public Pages**:
  - Home page section with accordion UI (single-open behavior)
  - Dedicated FAQ page (`/faq`) with pagination
  - Favorites appear first, followed by most recent
  - Smooth scroll animations and parallax effects
  - Fully responsive with RTL support

### 📚 Magazine Management
- **Admin Interface** (`/admin/magazines`):
  - Create and manage magazine entries with bilingual content
  - Upload cover images (JPEG, PNG, WebP, GIF - max 10MB)
  - Upload PDF files (max 50MB)
  - Vercel Blob storage integration with local fallback
  - Set published dates
  - Pagination controls
- **Public Pages**:
  - Home page grid section with magazine cards
  - Dedicated magazines page (`/magazines`) with pagination
  - Cover image zoom on hover
  - PDF download buttons
  - Card animations with hover effects
  - Responsive grid layout (1/2/3/4 columns)

### 🎨 Animation Features
- **Scroll-triggered animations**: Sections fade in and slide up on scroll
- **Parallax backgrounds**: Decorative gradients move at different speeds
- **Stagger animations**: FAQ items and magazine cards appear sequentially
- **Hover effects**: Cards lift and scale on hover
- **Smooth transitions**: Accordion expansion with AnimatePresence
- **Performance optimized**: GPU-accelerated transforms, respects `prefers-reduced-motion`

### 🏠 Home Navigation
- Quick link cards to Dashboard and Client Search
- FAQ section with accordion UI
- Magazine grid section with download links
- Clean, intuitive interface
- Clerk authentication integration

## Tech Stack

- **Framework**: Next.js 16.1.6 (App Router)
- **UI**: React 19.2.3, Tailwind CSS 4
- **Animations**: Framer Motion 12.38.0
- **Authentication**: Clerk
- **Database**: Neon PostgreSQL
- **ORM**: Prisma 7.5.0
- **Storage**: Vercel Blob (file uploads)
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
# Seed dashboard data (clients and orders)
npx tsx scripts/seed-dashboard-data.ts

# Seed FAQ and Magazine content
npx tsx scripts/seed-faq-magazines.ts

# Create admin user (required for admin access)
npx tsx scripts/seed-admin-user.ts
```

The FAQ/Magazine seed creates:
- 5 FAQs (2 marked as favorites)
- 5 Magazines with sample content
- 1 deleted FAQ for testing soft-delete filtering

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
├── page.tsx              # Home page with quick links, FAQ, and Magazine sections
├── dashboard/           
│   └── page.tsx         # Dashboard with analytics
├── clients/
│   └── page.tsx         # Client search and list
├── faq/
│   └── page.tsx         # Public FAQ page with pagination
├── magazines/
│   └── page.tsx         # Public Magazine page with pagination
├── admin/
│   ├── faq/             # Admin FAQ management
│   │   ├── page.tsx              # FAQ list with pagination and favorites
│   │   ├── add/page.tsx          # Create new FAQ
│   │   └── [id]/edit/page.tsx    # Edit FAQ
│   └── magazines/       # Admin Magazine management
│       ├── page.tsx              # Magazine list with pagination
│       ├── add/page.tsx          # Create new Magazine
│       └── [id]/edit/page.tsx    # Edit Magazine
└── api/
    ├── metrics/
    │   └── route.ts     # Metrics endpoint
    ├── faq/
    │   ├── route.ts     # FAQ list and create
    │   └── [id]/
    │       ├── route.ts        # FAQ get, update, delete
    │       └── favorite/       # Toggle favorite status
    │           └── route.ts
    └── magazines/
        ├── route.ts     # Magazine list and create
        └── [id]/
            └── route.ts # Magazine get, update, delete

lib/
├── components/
│   ├── dashboard/       # Dashboard-specific components
│   ├── clients/         # Client-specific components
│   ├── faq/            # FAQ components (FAQForm, FAQList, FAQAccordionItem)
│   ├── magazines/      # Magazine components (MagazineForm, MagazineList, MagazineCard)
│   ├── home/           # Home page sections (FAQSection, MagazineSection)
│   └── ui/             # Shared UI components (LoadingSpinner, etc.)
├── utils/
│   ├── fileValidation.ts  # File upload validation (images, PDFs)
│   └── bilingual.ts       # Bilingual field accessors
├── db.ts                # Database pool configuration
└── types.ts             # TypeScript types (FAQ, Magazine, etc.)

prisma/
├── schema.prisma        # Database schema (Client, Order, FAQ, Magazine)
└── migrations/          # Database migrations

scripts/
├── seed-dashboard-data.ts   # Test data for clients and orders
├── seed-faq-magazines.ts    # Test data for FAQ and Magazine content
└── seed-admin-user.ts       # Create admin user
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

### FAQ
- Bilingual fields: `question_en`, `question_ar`, `answer_en`, `answer_ar`
- Features: `is_favorite`, `display_order`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`
- Soft delete: `is_deleted`, `deleted_by`, `deleted_at`
- Indexed on: `is_favorite`, `is_deleted`, `display_order`

### Magazine
- Bilingual fields: `title_en`, `title_ar`, `description_en`, `description_ar`
- Media: `image_url`, `storage_type`, `file_data`, `file_name`, `file_size`, `mime_type`
- Download: `download_link` (PDF URL)
- Published date: `published_date`
- Audit fields: `created_by`, `updated_by`, `created_at`, `updated_at`  
- Soft delete: `is_deleted`, `deleted_by`, `deleted_at`
- Indexed on: `published_date`, `is_deleted`

## API Endpoints

### FAQ
- `GET /api/faq` - List FAQs with pagination (supports `page`, `limit`, `favorites_only`, `home_page` params)
- `POST /api/faq` - Create new FAQ (admin only)
- `GET /api/faq/[id]` - Get single FAQ
- `PUT /api/faq/[id]` - Update FAQ (admin only)
- `DELETE /api/faq/[id]` - Soft-delete FAQ (admin only)
- `PATCH /api/faq/[id]/favorite` - Toggle favorite status (admin only)

### Magazine
- `GET /api/magazines` - List magazines with pagination (supports `page`, `limit`, `home_page` params)
- `POST /api/magazines` - Create new magazine with file uploads (admin only)
- `GET /api/magazines/[id]` - Get single magazine
- `PUT /api/magazines/[id]` - Update magazine with file uploads (admin only)
- `DELETE /api/magazines/[id]` - Soft-delete magazine (admin only)

## Admin Access

Admin features require authentication with Clerk and `role: 'admin'` in the User table.

**Admin Pages**:
- `/admin/faq` - FAQ management
- `/admin/magazines` - Magazine management
- `/admin` - Dashboard and other admin features

**Create Admin User**:
```bash
npx tsx scripts/seed-admin-user.ts
```

## Learn More

To learn more about the technologies used:

- [Next.js Documentation](https://nextjs.org/docs)
- [Clerk Authentication](https://clerk.com/docs)
- [Neon Serverless Postgres](https://neon.tech/docs)
- [Prisma ORM](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Framer Motion](https://www.framer.com/motion/)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Recharts](https://recharts.org/en-US/)

## License

MIT
