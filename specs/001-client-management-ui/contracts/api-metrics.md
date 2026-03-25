# API Contract: Metrics Endpoint

**Endpoint**: `/api/metrics`  
**Date**: 2026-03-25  
**Feature**: 001-client-management-ui  
**Version**: 1.0.0

## Overview

The metrics endpoint provides aggregated data for the dashboard, including total counts, order status breakdown, recent activity, and month comparison metrics. This endpoint consolidates multiple database queries to reduce dashboard load time and enable future caching strategies.

---

## GET /api/metrics

Retrieves all dashboard metrics in a single response.

### Request

**Method**: `GET`  
**Path**: `/api/metrics`  
**Authentication**: Required (Clerk session)  
**Headers**:
```
Authorization: Bearer <clerk_session_token>
Content-Type: application/json
```

**Query Parameters**: None

### Response

**Status**: `200 OK`  
**Content-Type**: `application/json`

**Response Body**:
```json
{
  "clientCount": 1250,
  "orderCount": 4820,
  "thisMonthClients": 45,
  "lastMonthClients": 52,
  "thisMonthOrders": 156,
  "lastMonthOrders": 178,
  "statusBreakdown": [
    {
      "status": "completed",
      "count": 2891
    },
    {
      "status": "pending",
      "count": 1205
    },
    {
      "status": "cancelled",
      "count": 724
    }
  ],
  "recentClients": [
    {
      "id": 1248,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "created_at": "2026-03-25T10:30:00Z",
      "created_by": "user_2a1b2c3d4e5f"
    },
    {
      "id": 1247,
      "name": "Tech Solutions Inc",
      "email": "info@techsolutions.com",
      "created_at": "2026-03-24T15:45:00Z",
      "created_by": "user_9z8y7x6w5v4u"
    }
    // ... up to 5 clients total
  ],
  "recentOrders": [
    {
      "id": 4818,
      "description": "Website redesign project",
      "client_name": "Acme Corporation",
      "status": "pending",
      "created_at": "2026-03-25T11:00:00Z",
      "created_by": "user_2a1b2c3d4e5f"
    },
    {
      "id": 4817,
      "description": "Server maintenance",
      "client_name": "Tech Solutions Inc",
      "status": "completed",
      "created_at": "2026-03-25T09:15:00Z",
      "created_by": "user_9z8y7x6w5v4u"
    }
    // ... up to 5 orders total
  ],
  "latestClients": [
    {
      "id": 1248,
      "name": "Acme Corporation",
      "email": "contact@acme.com",
      "mobile": "555-0123",
      "created_at": "2026-03-25T10:30:00Z"
    }
    // ... up to 10 clients total
  ]
}
```

**Field Descriptions**:

| Field | Type | Description |
|-------|------|-------------|
| clientCount | integer | Total number of clients in the system |
| orderCount | integer | Total number of orders across all clients |
| thisMonthClients | integer | Number of clients created in the current calendar month |
| lastMonthClients | integer | Number of clients created in the previous calendar month |
| thisMonthOrders | integer | Number of orders created in the current calendar month |
| lastMonthOrders | integer | Number of orders created in the previous calendar month |
| statusBreakdown | array | Order status distribution for donut chart |
| statusBreakdown[].status | string | Order status: "pending", "completed", or "cancelled" |
| statusBreakdown[].count | integer | Number of orders with this status |
| recentClients | array | Last 5 clients added, sorted by created_at descending |
| recentClients[].id | integer | Client ID |
| recentClients[].name | string | Client name |
| recentClients[].email | string | Client email |
| recentClients[].created_at | string | ISO 8601 timestamp |
| recentClients[].created_by | string | Clerk user ID who created the client |
| recentOrders | array | Last 5 orders created, sorted by created_at descending |
| recentOrders[].id | integer | Order ID |
| recentOrders[].description | string | Order description |
| recentOrders[].client_name | string | Name of the associated client |
| recentOrders[].status | string | Order status |
| recentOrders[].created_at | string | ISO 8601 timestamp |
| recentOrders[].created_by | string | Clerk user ID who created the order |
| latestClients | array | Latest 10 clients added, sorted by created_at descending |
| latestClients[].id | integer | Client ID |
| latestClients[].name | string | Client name |
| latestClients[].email | string | Client email |
| latestClients[].mobile | string \| null | Client mobile number (optional) |
| latestClients[].created_at | string | ISO 8601 timestamp |

---

## Error Responses

### 401 Unauthorized
```json
{
  "error": "Unauthorized",
  "message": "Authentication required. Please log in."
}
```

**Cause**: No Clerk session token provided or invalid token.

---

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch dashboard metrics. Please try again."
}
```

**Cause**: Database connection failure, query timeout, or unexpected exception.

---

## Performance Characteristics

- **Expected Response Time**: < 500ms for typical datasets (up to 10,000 records)
- **Timeout**: 10 seconds (should rarely occur with proper indexing)
- **Caching**: No caching in v1; all metrics are real-time
- **Rate Limiting**: No rate limiting enforced (inherits from general Clerk session limits)

---

## Database Queries

The endpoint executes the following queries in parallel:

1. `SELECT COUNT(*) FROM clients`
2. `SELECT COUNT(*) FROM orders`
3. `SELECT COUNT(*) FROM clients WHERE created_at >= [current_month_start]`
4. `SELECT COUNT(*) FROM clients WHERE created_at >= [last_month_start] AND created_at < [current_month_start]`
5. `SELECT COUNT(*) FROM orders WHERE created_at >= [current_month_start]`
6. `SELECT COUNT(*) FROM orders WHERE created_at >= [last_month_start] AND created_at < [current_month_start]`
7. `SELECT status, COUNT(*) FROM orders GROUP BY status`
8. `SELECT id, name, email, created_at, created_by FROM clients ORDER BY created_at DESC LIMIT 5`
9. `SELECT o.id, o.description, o.status, o.created_at, o.created_by, c.name FROM orders o JOIN clients c ON o.client_id = c.id ORDER BY o.created_at DESC LIMIT 5`
10. `SELECT id, name, email, mobile, created_at FROM clients ORDER BY created_at DESC LIMIT 10`

All queries use indexed columns (`created_at`, `status`) for optimal performance.

---

## Security Considerations

- **Authentication**: Clerk session token verified before query execution
- **Authorization**: No row-level filtering; all users see all metrics (change if multi-tenancy needed)
- **SQL Injection**: Prevented by Prisma parameterized queries
- **Data Exposure**: No sensitive data (passwords, tokens) included in response
- **Rate Limiting**: Consider adding if dashboard auto-refresh causes excessive load

---

## TypeScript Types

```typescript
// lib/types.ts or app/api/metrics/types.ts

export interface MetricsResponse {
  clientCount: number;
  orderCount: number;
  thisMonthClients: number;
  lastMonthClients: number;
  thisMonthOrders: number;
  lastMonthOrders: number;
  statusBreakdown: StatusBreakdownItem[];
  recentClients: RecentClient[];
  recentOrders: RecentOrder[];
  latestClients: LatestClient[];
}

export interface StatusBreakdownItem {
  status: 'pending' | 'completed' | 'cancelled';
  count: number;
}

export interface RecentClient {
  id: number;
  name: string;
  email: string;
  created_at: string; // ISO 8601
  created_by: string; // Clerk user ID
}

export interface RecentOrder {
  id: number;
  description: string;
  client_name: string;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string; // ISO 8601
  created_by: string; // Clerk user ID
}

export interface LatestClient {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  created_at: string; // ISO 8601
}
```

---

## Usage Example

### Client-Side Fetch (React Component)

```typescript
// app/dashboard/page.tsx or lib/hooks/useMetrics.ts
import { useEffect, useState } from 'react';
import type { MetricsResponse } from '@/lib/types';

export function useMetrics() {
  const [metrics, setMetrics] = useState<MetricsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMetrics() {
      try {
        const response = await fetch('/api/metrics');
        if (!response.ok) {
          throw new Error('Failed to fetch metrics');
        }
        const data = await response.json();
        setMetrics(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    }

    fetchMetrics();

    // Optional: Auto-refresh every 60 seconds
    const interval = setInterval(fetchMetrics, 60000);
    return () => clearInterval(interval);
  }, []);

  return { metrics, loading, error };
}
```

### Server Component (Next.js App Router)

```typescript
// app/dashboard/page.tsx
import { MetricsResponse } from '@/lib/types';

async function getMetrics(): Promise<MetricsResponse> {
  const response = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL}/api/metrics`, {
    cache: 'no-store' // Ensure fresh data
  });
  
  if (!response.ok) {
    throw new Error('Failed to fetch metrics');
  }
  
  return response.json();
}

export default async function DashboardPage() {
  const metrics = await getMetrics();
  
  return (
    <div>
      <h1>Dashboard</h1>
      <MetricCard title="Total Clients" value={metrics.clientCount} />
      {/* ... */}
    </div>
  );
}
```

---

## Testing

### Unit Test Example

```typescript
// __tests__/api/metrics.test.ts
import { GET } from '@/app/api/metrics/route';
import { NextRequest } from 'next/server';

describe('GET /api/metrics', () => {
  it('returns metrics with correct structure', async () => {
    const request = new NextRequest('http://localhost:3000/api/metrics');
    const response = await GET(request);
    
    expect(response.status).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('clientCount');
    expect(data).toHaveProperty('orderCount');
    expect(data).toHaveProperty('statusBreakdown');
    expect(data.statusBreakdown).toBeInstanceOf(Array);
  });

  it('returns 401 for unauthenticated requests', async () => {
    // Mock Clerk to return no session
    const request = new NextRequest('http://localhost:3000/api/metrics');
    const response = await GET(request);
    
    expect(response.status).toBe(401);
  });
});
```

---

## Future Enhancements

- **Caching**: Add Redis caching with 30-60 second TTL to reduce database load
- **Query Parameters**: Support date range filters (`?from=2026-01-01&to=2026-03-31`)
- **Pagination**: Add pagination for recentClients/recentOrders if lists grow
- **Aggregations**: Add more metrics (average order value, completion rate, etc.)
- **WebSocket**: Replace polling with WebSocket for real-time updates

---

## Version History

| Version | Date | Changes |
|---------|------|---------|
| 1.0.0 | 2026-03-25 | Initial contract definition |

---

## Summary

The `/api/metrics` endpoint provides a unified interface for all dashboard data needs, consolidating 10 database queries into a single HTTP request. It follows RESTful conventions, includes comprehensive TypeScript types, and is designed for optimal performance with indexed queries.
