# Data Model: Client Management UI with Dashboard

**Date**: 2026-03-25  
**Feature**: 001-client-management-ui  
**Status**: Complete

## Overview

This document defines the data entities and their relationships for the dashboard feature. The feature primarily uses existing `clients` and `orders` tables with **required schema extensions** to support audit trails and order status tracking.

---

## Entities

### Client

Represents a customer or business contact in the system.

**Table**: `clients`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique client identifier |
| name | VARCHAR(255) | NOT NULL | Client full name or business name |
| email | VARCHAR(255) | NOT NULL, UNIQUE | Primary email address |
| mobile | VARCHAR(20) | NULLABLE | Phone number (optional) |
| address | TEXT | NULLABLE | Physical or mailing address (optional) |
| created_by | VARCHAR(255) | **NEW**, NOT NULL | Clerk user ID who created the record |
| updated_by | VARCHAR(255) | **NEW**, NOT NULL | Clerk user ID who last updated the record |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Last update timestamp |
| is_deleted | BOOLEAN | **NEW**, NOT NULL, DEFAULT false | Soft-delete flag (true = deleted, false = active) |
| deleted_by | VARCHAR(255) | **NEW**, NULLABLE | Clerk user ID who deleted the record (null if not deleted) |
| deleted_at | TIMESTAMP | **NEW**, NULLABLE | Soft-delete timestamp (null if not deleted) |

**Indexes**:
- PRIMARY KEY on `id`
- UNIQUE INDEX on `email`
- INDEX on `created_at` (for sorting and month filtering)
- INDEX on `updated_at` (for sorting)

**Relationships**:
- ONE client → MANY orders (one-to-many)

**Validation Rules**:
- `name`: Required, max 255 characters
- `email`: Required, valid email format, unique across all clients
- `mobile`: Optional, max 20 characters
- `address`: Optional, text field for long addresses
- `created_by`, `updated_by`: Populated from Clerk session user ID

**State Transitions**: None (clients don't have state)

---

### Order

Represents a purchase or service order associated with a client.

**Table**: `orders`

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | INT | PRIMARY KEY, AUTO_INCREMENT | Unique order identifier |
| client_id | INT | NOT NULL, FOREIGN KEY → clients.id | Associated client |
| order_date | TIMESTAMP | NOT NULL, DEFAULT now() | Order placement date |
| description | TEXT | NOT NULL | Order details or items description |
| address | TEXT | NULLABLE | Delivery address (can differ from client address) |
| mobile | VARCHAR(20) | NULLABLE | Contact number for delivery (can differ from client mobile) |
| status | VARCHAR(20) | **NEW**, NOT NULL, DEFAULT 'pending' | Order status (pending/completed/cancelled) |
| created_by | VARCHAR(255) | **NEW**, NOT NULL | Clerk user ID who created the order |
| updated_by | VARCHAR(255) | **NEW**, NOT NULL | Clerk user ID who last updated the order |
| created_at | TIMESTAMP | NOT NULL, DEFAULT now() | Record creation timestamp |
| updated_at | TIMESTAMP | NOT NULL, DEFAULT now() | Last update timestamp |

**Indexes**:
- PRIMARY KEY on `id`
- INDEX on `client_id` (for client order history lookup)
- INDEX on `status` (for dashboard donut chart aggregation)
- INDEX on `created_at` (for month comparison and recent activity)

**Relationships**:
- MANY orders → ONE client (foreign key: client_id)

**Validation Rules**:
- `client_id`: Required, must reference existing client
- `description`: Required, text field
- `status`: Required, must be one of: `pending`, `completed`, `cancelled`
- `order_date`, `created_at`, `updated_at`: Automatically populated by database

**State Transitions**:
```
pending → completed
pending → cancelled
completed → [no further transitions]
cancelled → [no further transitions]
```

**Enum Definition**:
```prisma
enum OrderStatus {
  pending
  completed
  cancelled
}
```

---

## Schema Changes Required

### Migration: Add Audit Fields and Order Status

**Objective**: Extend existing tables to support Clerk user audit trails and order status tracking.

**Changes**:

1. **clients table**:
   - ADD COLUMN `created_by` VARCHAR(255) NOT NULL DEFAULT 'system'
   - ADD COLUMN `updated_by` VARCHAR(255) NOT NULL DEFAULT 'system'
   - ADD COLUMN `is_deleted` BOOLEAN NOT NULL DEFAULT false
   - ADD COLUMN `deleted_by` VARCHAR(255) DEFAULT NULL
   - ADD COLUMN `deleted_at` TIMESTAMP DEFAULT NULL
   - CREATE INDEX `idx_clients_created_at` ON clients(created_at)
   - CREATE INDEX `idx_clients_updated_at` ON clients(updated_at)
   - CREATE INDEX `idx_clients_is_deleted` ON clients(is_deleted)

2. **orders table**:
   - ADD COLUMN `status` VARCHAR(20) NOT NULL DEFAULT 'pending'
   - ADD COLUMN `created_by` VARCHAR(255) NOT NULL DEFAULT 'system'
   - ADD COLUMN `updated_by` VARCHAR(255) NOT NULL DEFAULT 'system'
   - ADD CONSTRAINT `chk_order_status` CHECK (status IN ('pending', 'completed', 'cancelled'))
   - CREATE INDEX `idx_orders_status` ON orders(status)
   - CREATE INDEX `idx_orders_created_at` ON orders(created_at)

**Backward Compatibility**:
- Existing records will have `created_by` and `updated_by` set to 'system' (placeholder)
- All future operations must populate these fields with actual Clerk user IDs
- Existing orders default to 'pending' status
- No data loss; all changes are additive

**Rollback Procedure** (if needed):
```sql
-- Rollback clients
ALTER TABLE clients DROP COLUMN created_by;
ALTER TABLE clients DROP COLUMN updated_by;
DROP INDEX idx_clients_created_at;
DROP INDEX idx_clients_updated_at;

-- Rollback orders
ALTER TABLE orders DROP COLUMN status;
ALTER TABLE orders DROP COLUMN created_by;
ALTER TABLE orders DROP COLUMN updated_by;
DROP INDEX idx_orders_status;
DROP INDEX idx_orders_created_at;
```

---

## Data Relationships Diagram

```
┌─────────────┐
│   clients   │
├─────────────┤
│ id (PK)     │
│ name        │
│ email (UK)  │
│ mobile      │
│ address     │
│ created_by  │◄──── Clerk user ID
│ updated_by  │◄──── Clerk user ID
│ created_at  │
│ updated_at  │
└─────────────┘
       │
       │ 1:N
       │
       ▼
┌─────────────┐
│   orders    │
├─────────────┤
│ id (PK)     │
│ client_id(FK)│─────► clients.id
│ order_date  │
│ description │
│ address     │
│ mobile      │
│ status      │◄──── NEW: pending/completed/cancelled
│ created_by  │◄──── NEW: Clerk user ID
│ updated_by  │◄──── NEW: Clerk user ID
│ created_at  │
│ updated_at  │
└─────────────┘
```

---

## Dashboard Metrics Queries

### Total Counts
```sql
-- Total clients (exclude soft-deleted)
SELECT COUNT(*) FROM clients WHERE is_deleted = false;

-- Total orders (only for non-deleted clients)
SELECT COUNT(*) FROM orders 
WHERE client_id IN (SELECT id FROM clients WHERE is_deleted = false);
```

### Order Status Breakdown (for Donut Chart)
```sql
SELECT 
  status,
  COUNT(*) as count
FROM orders
GROUP BY status;
```

Expected result:
```json
[
  { "status": "pending", "count": 150 },
  { "status": "completed", "count": 300 },
  { "status": "cancelled", "count": 50 }
]
```

### Month Comparison
```sql
-- This month clients
SELECT COUNT(*) FROM clients
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';

-- Last month clients
SELECT COUNT(*) FROM clients
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE) - INTERVAL '1 month'
  AND created_at < DATE_TRUNC('month', CURRENT_DATE);

-- Same for orders
SELECT COUNT(*) FROM orders
WHERE created_at >= DATE_TRUNC('month', CURRENT_DATE)
  AND created_at < DATE_TRUNC('month', CURRENT_DATE) + INTERVAL '1 month';
```

### Recent Activity
```sql
-- Last 5 clients added
SELECT id, name, email, created_at, created_by
FROM clients
ORDER BY created_at DESC
LIMIT 5;

-- Last 5 orders created
SELECT o.id, o.description, o.created_at, o.created_by, c.name as client_name
FROM orders o
JOIN clients c ON o.client_id = c.id
ORDER BY o.created_at DESC
LIMIT 5;
```

### Latest Clients (for insights section)
```sql
SELECT id, name, email, mobile, created_at
FROM clients
ORDER BY created_at DESC
LIMIT 10;
```

---

## Prisma Schema Update

The following Prisma schema changes are required:

```prisma
generator client {
  provider = "prisma-client"
  output   = "../lib/generated/prisma"
}

datasource db {
  provider = "postgresql"
}

// Add enum for order status
enum OrderStatus {
  pending
  completed
  cancelled
}

model clients {
  id         Int       @id @default(autoincrement())
  name       String    @db.VarChar(255)
  address    String?   // Make nullable for optional fields
  email      String    @unique @db.VarChar(255)
  mobile     String?   @db.VarChar(20) // Make nullable
  created_by String    @db.VarChar(255) @default("system") // NEW
  updated_by String    @db.VarChar(255) @default("system") // NEW
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
  address     String?     // Make nullable
  mobile      String?     @db.VarChar(20) // Make nullable
  status      OrderStatus @default(pending) // NEW
  created_by  String      @db.VarChar(255) @default("system") // NEW
  updated_by  String      @db.VarChar(255) @default("system") // NEW
  created_at  DateTime    @default(now()) @db.Timestamp(6)
  updated_at  DateTime    @default(now()) @updatedAt @db.Timestamp(6)
  clients     clients     @relation(fields: [client_id], references: [id], onDelete: Cascade, onUpdate: NoAction)

  @@index([client_id], map: "idx_orders_client_id")
  @@index([status], map: "idx_orders_status") // NEW
  @@index([created_at], map: "idx_orders_created_at") // NEW
}
```

---

## Seed Data Specifications

Per user requirements, generate seed data for testing:

- **50 clients** with varied data:
  - Names: "Client 1" through "Client 50" (or use faker for more realistic names)
  - Emails: `client1@example.com` through `client50@example.com`
  - Mobile: Random phone numbers in format `555-0100` through `555-0149`
  - Address: Mix of present and null values (50% populated)
  - created_by/updated_by: "seed-script"
  - created_at: Distributed across last 3 months

- **Multiple orders per client** (3-10 orders each, total ~350 orders):
  - Description: "Order [N] for [Client Name]"
  - Status: Random distribution: 60% completed, 25% pending, 15% cancelled
  - created_at: Distributed across last 2 months
  - created_by/updated_by: "seed-script"

**Implementation**: See `scripts/seed-dashboard-data.ts`

---

## Summary

- ✅ Entities defined: clients, orders
- ✅ Relationships mapped: 1:N (clients → orders)
- ✅ Schema changes documented: audit fields (created_by, updated_by), order status enum
- ✅ Validation rules specified: constraints, required fields, status enum
- ✅ Indexes planned: created_at, status for dashboard queries
- ✅ Dashboard queries defined: counts, breakdowns, recent activity, month comparison
- ✅ Seed data specifications complete: 50 clients, ~350 orders

**Next Steps**: Phase 1 - Define API contracts and quickstart guide.
