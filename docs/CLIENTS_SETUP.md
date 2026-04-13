# Client Management System - Setup Guide

## Quick Start

### 1. Install Dependencies
```bash
npm install
```

### 2. Initialize Database
Run this command to create the `clients` and `orders` tables in your Neon Postgres database:
```bash
npm run init-db
```

This will create:
- **clients table** with columns: id, name, address, email, mobile, created_at, updated_at
- **orders table** with columns: id, client_id, order_date, description, address, mobile, created_at, updated_at

### 3. Start the Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Features

### Pages Created

1. **Clients List Page** (`/clients`)
   - View all clients with pagination
   - Search clients by name, email, or mobile
   - Add, Edit, View, and Delete clients

2. **Add Client Page** (`/clients/add`)
   - Form to create a new client
   - Fields: Name, Email, Mobile, Address

3. **Edit Client Page** (`/clients/[id]/edit`)
   - Update existing client information
   - All fields are editable

4. **View Client Page** (`/clients/[id]/view`)
   - View complete client details
   - See all orders associated with the client
   - Add new orders for the client
   - View order history with dates and details

### API Endpoints

#### Clients
- `GET /api/clients` - Get all clients with search and pagination
  - Query params: `search`, `limit`, `offset`
- `POST /api/clients` - Create a new client
- `GET /api/clients/[id]` - Get a specific client
- `PUT /api/clients/[id]` - Update a client
- `DELETE /api/clients/[id]` - Delete a client

#### Orders
- `GET /api/orders` - Get orders for a client
  - Query params: `clientId`, `limit`, `offset`
- `POST /api/orders` - Create a new order

## Database Schema

### Clients Table
```
id (PRIMARY KEY)
name (VARCHAR 255, NOT NULL)
address (TEXT, NOT NULL)
email (VARCHAR 255, NOT NULL, UNIQUE)
mobile (VARCHAR 20, NOT NULL)
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

### Orders Table
```
id (PRIMARY KEY)
client_id (INTEGER, FOREIGN KEY -> clients.id)
order_date (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
description (TEXT, NOT NULL)
address (TEXT, NOT NULL)
mobile (VARCHAR 20, NOT NULL)
created_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
updated_at (TIMESTAMP, DEFAULT CURRENT_TIMESTAMP)
```

## Technology Stack

- **Next.js 16** - React framework
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling
- **PostgreSQL (Neon)** - Database
- **pg** - PostgreSQL client
- **Clerk** - Authentication

## Authentication

The client management system requires users to be signed in (via Clerk) to access the Clients section. The Clients link only appears in the header when a user is authenticated.

## Features

✅ Full CRUD operations for clients
✅ Search functionality with pagination
✅ Order history tracking per client
✅ Add orders directly from client view
✅ Responsive design with Tailwind CSS
✅ Type-safe with TypeScript
✅ PostgreSQL with Neon Serverless Database

## Directory Structure

```
app/
├── api/
│   ├── clients/
│   │   ├── route.ts (GET all, POST create)
│   │   └── [id]/route.ts (GET, PUT, DELETE)
│   └── orders/
│       └── route.ts (GET, POST)
├── clients/
│   ├── page.tsx (List & Search)
│   ├── add/page.tsx (Add new client)
│   └── [id]/
│       ├── edit/page.tsx (Edit client)
│       └── view/page.tsx (View client & orders)
└── header.tsx (Navigation)

lib/
└── db.ts (Database connection)

scripts/
└── init-db.js (Database initialization)
```

## Troubleshooting

### Database Connection Error
- Make sure `DATABASE_URL` is set in `.env`
- Verify your Neon Postgres connection string is correct
- Check that the database is accessible from your location

### Initialization Failed
- Ensure you have run `npm install` first
- Check that `pg` package is installed
- Verify the `.env` file has the correct `DATABASE_URL`

### Clerk Authentication Issues
- Verify `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` and `CLERK_SECRET_KEY` are set
- Check Clerk dashboard for correct keys

## Next Steps

You can further enhance this system by adding:
- Order status tracking
- Client notes/comments
- Invoice generation
- Email notifications
- User roles and permissions
- Advanced filtering and reporting
