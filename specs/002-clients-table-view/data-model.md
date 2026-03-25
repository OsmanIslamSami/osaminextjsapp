# Data Model: Clients Table with Action Icons

**Feature**: 002-clients-table-view  
**Phase**: 1 (Design & Contracts)  
**Date**: March 25, 2026

## Overview

This document defines the data model changes required to support the clients table feature with company and status fields. The changes extend the existing clients schema without breaking backward compatibility.

## Schema Changes

### New Enum: ClientStatus

**Purpose**: Track whether a client is actively doing business or inactive

```prisma
enum ClientStatus {
  Active
  Inactive
}
```

**Values**:
- `Active`: Client is currently active and doing business
- `Inactive`: Client is not currently active (paused, dormant, or former client)

**Design Notes**:
- Two-state model chosen for simplicity (per clarifications)
- More complex statuses (Prospect, Lead, Archived) deferred to future features
- Maps to PostgreSQL ENUM type for type safety and storage efficiency

---

### Enhanced Model: clients

**Current Schema** (from prisma/schema.prisma):
```prisma
model clients {
  id         Int       @id @default(autoincrement())
  name       String    @db.VarChar(255)
  address    String?
  email      String    @unique @db.VarChar(255)
  mobile     String?   @db.VarChar(20)
  created_by String    @default("system") @db.VarChar(255)
  updated_by String    @default("system") @db.VarChar(255)
  created_at DateTime  @default(now()) @db.Timestamp(6)
  updated_at DateTime  @default(now()) @updatedAt @db.Timestamp(6)
  is_deleted Boolean   @default(false)
  deleted_by String?   @db.VarChar(255)
  deleted_at DateTime? @db.Timestamp(6)
  orders     orders[]

  @@index([created_at], map: "idx_clients_created_at")
  @@index([updated_at], map: "idx_clients_updated_at")
  @@index([is_deleted], map: "idx_clients_is_deleted")
}
```

**New Fields** (additions):
```prisma
model clients {
  // ... all existing fields unchanged ...
  
  company    String?       @db.VarChar(255)  // NEW: Company/business name (optional)
  status     ClientStatus  @default(Active)  // NEW: Active or Inactive

  @@index([status], map: "idx_clients_status")  // NEW: Index for filtering by status
}
```

**Complete Updated Schema**:
```prisma
model clients {
  id         Int          @id @default(autoincrement())
  name       String       @db.VarChar(255)
  address    String?
  email      String       @unique @db.VarChar(255)
  mobile     String?      @db.VarChar(20)
  company    String?      @db.VarChar(255)           // NEW
  status     ClientStatus @default(Active)            // NEW
  created_by String       @default("system") @db.VarChar(255)
  updated_by String       @default("system") @db.VarChar(255)
  created_at DateTime     @default(now()) @db.Timestamp(6)
  updated_at DateTime     @default(now()) @updatedAt @db.Timestamp(6)
  is_deleted Boolean      @default(false)
  deleted_by String?      @db.VarChar(255)
  deleted_at DateTime?    @db.Timestamp(6)
  orders     orders[]

  @@index([created_at], map: "idx_clients_created_at")
  @@index([updated_at], map: "idx_clients_updated_at")
  @@index([is_deleted], map: "idx_clients_is_deleted")
  @@index([status], map: "idx_clients_status")       // NEW
}
```

---

## Field Specifications

### company

| Property | Value |
|----------|-------|
| **Type** | String (nullable) |
| **Database Type** | VARCHAR(255) |
| **Nullable** | Yes |
| **Default** | NULL |
| **Purpose** | Store company or business name associated with client |
| **Validation** | Max 255 characters, no special validation |
| **Display** | Show in table column, allow empty |

**Rationale**:
- Nullable to support gradual data entry and backward compatibility
- 255 characters sufficient for most company names
- No uniqueness constraint (multiple clients can work for same company)

**Migration Impact**:
- Zero-downtime: column added as nullable
- Existing records: company will be NULL
- No backfill required
- Can be populated via Edit Client form

**Usage in Feature**:
- Displayed in table as "Company" column
- Empty cells show "-" or blank
- Sortable and searchable (future enhancement)

---

### status

| Property | Value |
|----------|-------|
| **Type** | ClientStatus enum |
| **Database Type** | PostgreSQL ENUM |
| **Nullable** | No |
| **Default** | Active |
| **Values** | Active, Inactive |
| **Purpose** | Track client activity status |
| **Validation** | Must be one of enum values |
| **Display** | Colored badge in table |

**Rationale**:
- Default to Active preserves expected behavior for existing records
- Enum type enforces data integrity at database level
- Index on status enables efficient filtering (future feature: "Show only active clients")

**Migration Impact**:
- Zero-downtime: new column with default value
- Existing records: automatically set to Active
- No backfill required
- Can be modified via Edit Client form

**Usage in Feature**:
- Displayed as colored badge: green (Active), gray (Inactive)
- Required field in add/edit forms (dropdown)
- Filterable (future enhancement)

---

## Migration Plan

### Migration File

**Location**: `prisma/migrations/[timestamp]_add_client_company_status/migration.sql`

**Forward Migration**:
```sql
-- Create ClientStatus enum
CREATE TYPE "ClientStatus" AS ENUM ('Active', 'Inactive');

-- Add company column (nullable)
ALTER TABLE "clients" ADD COLUMN "company" VARCHAR(255);

-- Add status column with default
ALTER TABLE "clients" ADD COLUMN "status" "ClientStatus" NOT NULL DEFAULT 'Active'::"ClientStatus";

-- Add index for status filtering
CREATE INDEX "idx_clients_status" ON "clients"("status");

-- Add comment for documentation
COMMENT ON COLUMN "clients"."company" IS 'Company or business name (optional)';
COMMENT ON COLUMN "clients"."status" IS 'Client activity status: Active or Inactive';
```

**Rollback Migration**:
```sql
-- Drop index
DROP INDEX IF EXISTS "idx_clients_status";

-- Drop columns
ALTER TABLE "clients" DROP COLUMN IF EXISTS "status";
ALTER TABLE "clients" DROP COLUMN IF EXISTS "company";

-- Drop enum
DROP TYPE IF EXISTS "ClientStatus";
```

### Migration Testing Checklist

- [ ] Create Neon temporary branch for testing
- [ ] Apply migration in temp branch
- [ ] Verify schema structure with `\d clients`
- [ ] Insert test record with company and status
- [ ] Insert test record without company (NULL)
- [ ] Verify default status is Active
- [ ] Test enum constraint (reject invalid status)
- [ ] Verify index exists with `\di`
- [ ] Run Prisma generate to update client types
- [ ] Test rollback migration in temp branch
- [ ] Verify schema restored to original state
- [ ] Delete temp branch
- [ ] Apply migration to main branch

### Zero-Downtime Verification

**Compatibility Checks**:
1. ✅ Existing code reading clients: No breaking changes (new fields returned as extra data)
2. ✅ Existing code writing clients: No breaking changes (optional company, status has default)
3. ✅ Existing queries: No breaking changes (WHERE, ORDER BY clauses unaffected)
4. ✅ API responses: Backward compatible (clients without company show null, status shows "Active")

**Deployment Strategy**:
1. Apply migration to database (zero downtime, additive only)
2. Deploy updated Prisma schema
3. Deploy updated API routes (handle company and status)
4. Deploy updated UI components (table, badges)
5. No rollback required unless critical bug found

---

## API Type Changes

### TypeScript Interface (Generated by Prisma)

**Before**:
```typescript
interface clients {
  id: number;
  name: string;
  address: string | null;
  email: string;
  mobile: string | null;
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_at: Date | null;
}
```

**After**:
```typescript
enum ClientStatus {
  Active = "Active",
  Inactive = "Inactive"
}

interface clients {
  id: number;
  name: string;
  address: string | null;
  email: string;
  mobile: string | null;
  company: string | null;        // NEW
  status: ClientStatus;           // NEW
  created_by: string;
  updated_by: string;
  created_at: Date;
  updated_at: Date;
  is_deleted: boolean;
  deleted_by: string | null;
  deleted_at: Date | null;
}
```

**Import Changes**:
```typescript
// Before
import { clients } from '@/lib/generated/prisma/client';

// After
import { clients, ClientStatus } from '@/lib/generated/prisma/client';
```

---

## Validation Rules

### company Field

- **Length**: 0-255 characters
- **Required**: No (optional)
- **Format**: Free text, no special validation
- **Uniqueness**: Not enforced (multiple clients can have same company)
- **Sanitization**: Trim whitespace, escape HTML entities

### status Field

- **Values**: Must be Active or Inactive (enum)
- **Required**: Yes (always has default)
- **Default**: Active for new records
- **Validation**: Enforced at database level via ENUM type
- **API**: Accept string, validate against enum values

---

## Indexing Strategy

### Existing Indices (Unchanged)

1. `idx_clients_created_at` - For sorting by creation date
2. `idx_clients_updated_at` - For sorting by update date
3. `idx_clients_is_deleted` - For filtering soft-deleted records

### New Index

4. `idx_clients_status` - For filtering by Active/Inactive status

**Rationale**:
- Supports future "Show only active clients" filter
- Improves query performance for status-based searches
- Small overhead (single ENUM column)
- Composite index not needed (status alone is high-selectivity)

**Query Performance Expected**:
- Filter by status: O(log n) with index
- Full table scan avoided
- Minimal storage overhead (<5% of table size)

---

## Data Population Strategy

### Existing Records

All existing client records will receive:
- `company`: NULL (can be populated manually via Edit form)
- `status`: Active (default, matches expected business logic)

### New Records

All new client records created after migration:
- `company`: Optional field in Add Client form (can leave blank)
- `status`: Dropdown selection (Active or Inactive, default Active)

### Bulk Update (Optional)

If company data exists elsewhere:
```sql
-- Example: Populate company from orders.address if pattern exists
UPDATE clients 
SET company = 'Acme Corp' 
WHERE email LIKE '%@acmecorp.com' AND company IS NULL;
```

Not required for feature launch. Can be done post-deployment.

---

## Impact Summary

| Area | Impact Level | Details |
|------|-------------|---------|
| Database Schema | Medium | Two new fields, one new enum, one new index |
| API Routes | Low | Return two additional fields in responses |
| Frontend Components | High | New table, badges, columns |
| Existing Pages | Low | Add/Edit forms need company and status fields |
| Data Migration | None | Zero-downtime, no backfill required |
| Performance | Low | One additional index, minimal overhead |
| Testing | Medium | New fields require test coverage |

---

## References

- Prisma Schema: `prisma/schema.prisma`
- Migration: `prisma/migrations/[timestamp]_add_client_company_status/`
- Constitution Principle III: Zero-downtime migrations
- Feature Spec: `specs/002-clients-table-view/spec.md`
- Research: `specs/002-clients-table-view/research.md`
