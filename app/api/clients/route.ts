import { prisma } from '@/lib/db';
import { auth } from '@clerk/nextjs/server';
import { NextRequest, NextResponse } from 'next/server';
import { logger } from '@/lib/utils/logger';

// GET all clients with cursor-based pagination for infinite scroll
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100); // Max 100
    const cursorParam = searchParams.get('cursor');
    const cursor = cursorParam ? parseInt(cursorParam) : undefined;
    const statusFilter = searchParams.get('status') || undefined;

    // Build where clause
    const where: any = {
      is_deleted: false,
    };

    // Add search filter if provided
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { mobile: { contains: search, mode: 'insensitive' } },
      ];
    }

    // Add status filter if provided
    if (statusFilter === 'Active' || statusFilter === 'Inactive') {
      where.status = statusFilter;
    }

    // Cursor-based pagination: fetch limit+1 to determine if there are more results
    const clients = await prisma.clients.findMany({
      where,
      orderBy: { created_at: 'desc' },
      take: limit + 1,
      ...(cursor && { 
        skip: 1, // Skip the cursor item itself
        cursor: { id: cursor } 
      }),
    });

    // Check if there are more results
    const hasMore = clients.length > limit;
    const results = hasMore ? clients.slice(0, limit) : clients;
    const nextCursor = hasMore && results.length > 0 ? results[results.length - 1].id : null;

    return NextResponse.json({
      clients: results,
      hasMore,
      nextCursor,
    });
  } catch (error) {
    logger.error('API error:', error);
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
    const { name, address, email, mobile, status } = body;

    if (!name || !address || !email || !mobile) {
      return NextResponse.json(
        { error: 'Name, address, email, and mobile are required' },
        { status: 400 }
      );
    }

    const newClient = await prisma.clients.create({
      data: {
        name,
        address,
        email,
        mobile,
        status: status || 'Active',
      },
    });

    return NextResponse.json(newClient, { status: 201 });
  } catch (error: any) {
    logger.error('API error:', error);
    if (error.code === 'P2002') {
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