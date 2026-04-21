import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { canDeleteClients } from '@/lib/auth/permissions';
import {
  handleApiError,
  handlePrismaError,
  handleValidationError,
  handleNotFoundError,
  isError
} from '@/lib/utils/error-handler';
import { logger } from '@/lib/utils/logger';

// GET single client
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const client = await prisma.clients.findFirst({
      where: {
        id: parseInt(id),
        is_deleted: false,
      },
    });

    if (!client) {
      return handleNotFoundError('Client not found');
    }

    return NextResponse.json(client);
  } catch (error) {
    return handleApiError(error, 'Failed to fetch client');
  }
}

// PUT update client
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    const { id } = await params;
    const body = await request.json();
    const { name, address, email, mobile, status } = body;

    if (!name || !address || !email || !mobile) {
      return NextResponse.json(
        { error: 'Name, address, email, and mobile are required' },
        { status: 400 }
      );
    }

    const updatedClient = await prisma.clients.update({
      where: {
        id: parseInt(id),
        is_deleted: false,
      },
      data: {
        name,
        address,
        email,
        mobile,
        status: status || 'Active',
        updated_by: userId || 'system',
        updated_at: new Date(),
      },
    });

    return NextResponse.json(updatedClient);
  } catch (error: unknown) {
    logger.error('API error:', error);
    // Handle Prisma-specific errors (P2002 = unique constraint, P2025 = not found)
    if (isError(error) && (error as any).code === 'P2002' || (error as any).code === 'P2025') {
      return handlePrismaError(error);
    }
    return handleApiError(error, 'Failed to update client');
  }
}

// DELETE client (soft delete)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user has admin permissions to delete clients
    const hasPermission = await canDeleteClients();
    if (!hasPermission) {
      return NextResponse.json(
        { error: 'Forbidden. Only administrators can delete clients.' },
        { status: 403 }
      );
    }

    const { id } = await params;
    
    await prisma.clients.update({
      where: {
        id: parseInt(id),
        is_deleted: false,
      },
      data: {
        is_deleted: true,
        deleted_by: userId,
        deleted_at: new Date(),
      },
    });

    return NextResponse.json({ message: 'Client deleted successfully' });
  } catch (error: any) {
    logger.error('API error:', error);
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Client not found' },
        { status: 404 }
      );
    }
    return NextResponse.json(
      { error: 'Failed to delete client' },
      { status: 500 }
    );
  }
}