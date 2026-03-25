# API Contract: Clients Infinite Scroll

**Feature**: 002-clients-table-view  
**Endpoint**: `/api/clients`  
**Method**: GET  
**Purpose**: Retrieve paginated client list for infinite scroll table view

## Overview

This document defines the API contract for fetching clients with cursor-based pagination to support infinite scroll functionality in the clients table.

## Endpoint Specification

### Base Endpoint

```
GET /api/clients
```

### Authentication

**Required**: Yes  
**Method**: Clerk session token  
**Header**: `Authorization: Bearer <token>` (automatic with Clerk client)

**Validation**:
- Must have valid Clerk session
- Returns 401 Unauthorized if not authenticated

---

## Request Parameters

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `limit` | integer | No | 50 | Number of clients to return per request |
| `cursor` | integer | No | null | ID of last client from previous request (cursor) |
| `search` | string | No | null | Search term for filtering (name, email, mobile, company) |
| `status` | string | No | null | Filter by status: "Active", "Inactive", or omit for all |

### Parameter Validation

**limit**:
- Range: 1-100
- Default: 50
- If > 100, capped at 100
- If < 1, defaults to 50

**cursor**:
- Must be valid client ID (integer)
- If invalid ID, returns empty results
- If omitted, returns first page (newest clients)

**search**:
- Max length: 255 characters
- Case-insensitive matching
- Searches across: name, email, mobile, company fields
- SQL: `WHERE (name ILIKE %search% OR email ILIKE %search% OR mobile ILIKE %search% OR company ILIKE %search%)`

**status**:
- Values: "Active", "Inactive"
- Case-sensitive
- If invalid value, ignored (returns all)
- Empty string treated as no filter

---

## Request Examples

### Initial Load (First Page)

```http
GET /api/clients?limit=50
```

### Load More (Infinite Scroll)

```http
GET /api/clients?limit=50&cursor=42
```

### Search + Pagination

```http
GET /api/clients?limit=50&cursor=42&search=acme
```

### Filter by Status

```http
GET /api/clients?limit=50&status=Active
```

### Combined Filters

```http
GET /api/clients?limit=50&cursor=42&search=john&status=Active
```

---

## Response Format

### Success Response (200 OK)

```typescript
{
  clients: Array<{
    id: number;
    name: string;
    email: string;
    mobile: string | null;
    company: string | null;
    status: "Active" | "Inactive";
    address: string | null;
    created_at: string;  // ISO 8601 timestamp
    updated_at: string;  // ISO 8601 timestamp
    created_by: string;
    updated_by: string;
  }>;
  hasMore: boolean;
  nextCursor: number | null;
}
```

### Response Fields

**clients**: Array of client objects
- Ordered by `id DESC` (newest first for initial load)
- When using cursor, returns clients with `id < cursor`
- Limited to `limit` parameter count
- Excludes soft-deleted clients (`is_deleted = false`)

**hasMore**: boolean
- `true` if more clients exist beyond current page
- `false` if end of results reached
- Calculated by checking if query returned full `limit` count

**nextCursor**: number | null
- ID of last client in current page
- Use this value for next request's `cursor` parameter
- `null` if no more results (`hasMore = false`)

---

## Response Examples

### First Page (Has More Results)

```json
{
  "clients": [
    {
      "id": 100,
      "name": "John Doe",
      "email": "john@example.com",
      "mobile": "+1234567890",
      "company": "Acme Corp",
      "status": "Active",
      "address": "123 Main St",
      "created_at": "2026-03-25T10:30:00Z",
      "updated_at": "2026-03-25T10:30:00Z",
      "created_by": "user_xyz",
      "updated_by": "user_xyz"
    },
    // ... 49 more clients
  ],
  "hasMore": true,
  "nextCursor": 51
}
```

### Last Page (No More Results)

```json
{
  "clients": [
    {
      "id": 5,
      "name": "Jane Smith",
      "email": "jane@example.com",
      "mobile": null,
      "company": null,
      "status": "Inactive",
      "address": null,
      "created_at": "2026-01-15T08:00:00Z",
      "updated_at": "2026-01-15T08:00:00Z",
      "created_by": "system",
      "updated_by": "system"
    }
    // ... fewer clients (less than limit)
  ],
  "hasMore": false,
  "nextCursor": null
}
```

### Empty Results (No Matches)

```json
{
  "clients": [],
  "hasMore": false,
  "nextCursor": null
}
```

---

## Error Responses

### 401 Unauthorized

**Trigger**: No valid Clerk session

```json
{
  "error": "Unauthorized",
  "message": "Authentication required"
}
```

### 400 Bad Request

**Trigger**: Invalid query parameters

```json
{
  "error": "Bad Request",
  "message": "Invalid limit parameter. Must be between 1 and 100."
}
```

### 500 Internal Server Error

**Trigger**: Database error, unexpected exception

```json
{
  "error": "Internal Server Error",
  "message": "An unexpected error occurred"
}
```

---

## Implementation Query

### Prisma Query Logic

```typescript
const limit = Math.min(Math.max(parseInt(req.query.limit) || 50, 1), 100);
const cursor = req.query.cursor ? parseInt(req.query.cursor) : undefined;
const search = req.query.search?.toString() || '';
const status = req.query.status?.toString() || '';

const where = {
  is_deleted: false,
  ...(search && {
    OR: [
      { name: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { mobile: { contains: search, mode: 'insensitive' } },
      { company: { contains: search, mode: 'insensitive' } },
    ],
  }),
  ...(status && { status: status as ClientStatus }),
};

const clients = await prisma.clients.findMany({
  where,
  take: limit + 1, // Fetch one extra to check if more exist
  ...(cursor && { cursor: { id: cursor }, skip: 1 }), // Skip cursor itself
  orderBy: { id: 'desc' },
  select: {
    id: true,
    name: true,
    email: true,
    mobile: true,
    company: true,
    status: true,
    address: true,
    created_at: true,
    updated_at: true,
    created_by: true,
    updated_by: true,
  },
});

const hasMore = clients.length > limit;
const results = hasMore ? clients.slice(0, limit) : clients;
const nextCursor = hasMore ? results[results.length - 1].id : null;

return {
  clients: results,
  hasMore,
  nextCursor,
};
```

---

## Performance Considerations

### Database Indices

**Required for Efficient Queries**:
- `id` (primary key) - For cursor-based pagination
- `is_deleted` (existing) - For filtering soft-deleted records
- `status` (new) - For status filtering
- `created_at` (existing) - For date sorting

**Composite Index Not Needed**:
- Cursor pagination uses primary key (id)
- Individual field indices sufficient for filters

### Query Performance Targets

| Scenario | Target Response Time | Notes |
|----------|---------------------|-------|
| Initial load (no filters) | < 100ms | Most common case, simple query |
| With cursor pagination | < 150ms | Cursor lookup + filter |
| With search | < 300ms | ILIKE search across 4 fields |
| With search + status filter | < 350ms | Combined filters |
| Large result set (100 items) | < 500ms | Maximum allowed limit |

### Optimization Notes

1. **ILIKE Search**: PostgreSQL `ILIKE` used for case-insensitive search
   - Consider GIN index on search fields if search becomes slow
   - Current approach acceptable for <10,000 clients

2. **Cursor-Based Pagination**: More stable than offset-based
   - Handles record additions/deletions during scroll
   - No "jumping" or duplicate results
   - Efficient with `id` primary key index

3. **Limit + 1 Pattern**: Fetch one extra record to determine `hasMore`
   - Avoids separate COUNT query
   - Minimal overhead (one extra row)

4. **Select Specific Fields**: Only return needed fields
   - Excludes `is_deleted`, `deleted_by`, `deleted_at` from response
   - Reduces response payload size

---

## Client-Side Integration

### React Hook Pattern

```typescript
const usePaginatedClients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [cursor, setCursor] = useState<number | null>(null);

  const loadMore = async () => {
    if (loading || !hasMore) return;
    
    setLoading(true);
    const params = new URLSearchParams({
      limit: '50',
      ...(cursor && { cursor: String(cursor) }),
    });
    
    const response = await fetch(`/api/clients?${params}`);
    const data = await response.json();
    
    setClients(prev => [...prev, ...data.clients]);
    setHasMore(data.hasMore);
    setCursor(data.nextCursor);
    setLoading(false);
  };

  return { clients, loading, hasMore, loadMore };
};
```

### Intersection Observer Pattern

```typescript
const sentinelRef = useRef<HTMLDivElement>(null);

useEffect(() => {
  const observer = new IntersectionObserver(
    (entries) => {
      if (entries[0].isIntersecting && hasMore && !loading) {
        loadMore();
      }
    },
    { threshold: 0.1 }
  );

  if (sentinelRef.current) {
    observer.observe(sentinelRef.current);
  }

  return () => observer.disconnect();
}, [hasMore, loading]);
```

---

## Backward Compatibility

### Existing API Behavior

**Current Implementation**: Returns all clients up to `limit` parameter

**Changes**:
- Adds `hasMore` and `nextCursor` fields to response
- Existing clients consuming `clients` array: No breaking changes
- Response structure extended, not modified

### Migration Path

1. Deploy API with new fields (`hasMore`, `nextCursor`)
2. Old clients ignore new fields (forward compatible)
3. Update frontend to use new pagination fields
4. Old query pattern still works: `GET /api/clients?limit=1000`

---

## Testing Checklist

- [ ] Initial load returns first 50 clients
- [ ] Cursor pagination returns next 50 clients
- [ ] Last page sets `hasMore: false` and `nextCursor: null`
- [ ] Empty results return empty array
- [ ] Search filters clients correctly
- [ ] Status filter works for Active/Inactive
- [ ] Combined search + status + cursor works
- [ ] Invalid cursor returns empty results (graceful)
- [ ] Limit validation (min 1, max 100)
- [ ] Authentication required (401 without session)
- [ ] Soft-deleted clients excluded from results
- [ ] Response time meets performance targets

---

## References

- Implementation: `app/api/clients/route.ts`
- Prisma Schema: `prisma/schema.prisma`
- Frontend Integration: `app/clients/page.tsx`
- Constitution Principle VI: API-First Development
- Feature Spec: `specs/002-clients-table-view/spec.md`
