import { query } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// GET orders for a client
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const clientId = searchParams.get('clientId');
    const limit = parseInt(searchParams.get('limit') || '20');
    const offset = parseInt(searchParams.get('offset') || '0');

    if (!clientId) {
      return NextResponse.json(
        { error: 'clientId is required' },
        { status: 400 }
      );
    }

    const result = await query(
      'SELECT * FROM orders WHERE client_id = $1 ORDER BY order_date DESC LIMIT $2 OFFSET $3',
      [clientId, limit, offset]
    );

    const countResult = await query(
      'SELECT COUNT(*) as total FROM orders WHERE client_id = $1',
      [clientId]
    );

    return NextResponse.json({
      orders: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    );
  }
}

// POST create new order
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { clientId, orderDate, description, address, mobile } = body;

    if (!clientId || !description || !address || !mobile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Verify client exists
    const clientResult = await query('SELECT id FROM clients WHERE id = $1', [clientId]);
    if (clientResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }

    const result = await query(
      'INSERT INTO orders (client_id, order_date, description, address, mobile) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [clientId, orderDate || new Date(), description, address, mobile]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error) {
    logger.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    );
  }
}
