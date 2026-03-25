import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

// GET all clients with search
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');

    let queryText = 'SELECT * FROM clients WHERE is_deleted = false AND (name ILIKE $1 OR email ILIKE $1 OR mobile ILIKE $1) ORDER BY created_at DESC LIMIT $2 OFFSET $3';
    const result = await query(queryText, [`%${search}%`, limit, offset]);

    // Get total count for pagination
    const countResult = await query(
      'SELECT COUNT(*) as total FROM clients WHERE is_deleted = false AND (name ILIKE $1 OR email ILIKE $1 OR mobile ILIKE $1)',
      [`%${search}%`]
    );

    return NextResponse.json({
      clients: result.rows,
      total: parseInt(countResult.rows[0].total),
      limit,
      offset,
    });
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch clients' },
      { status: 500 }
    );
  }
}

// POST create new client
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, address, email, mobile } = body;

    if (!name || !address || !email || !mobile) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    const result = await query(
      'INSERT INTO clients (name, address, email, mobile) VALUES ($1, $2, $3, $4) RETURNING *',
      [name, address, email, mobile]
    );

    return NextResponse.json(result.rows[0], { status: 201 });
  } catch (error: any) {
    console.error('API error:', error);
    if (error.code === '23505') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to create client' },
      { status: 500 }
    );
  }
}
