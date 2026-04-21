import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { logger } from '@/lib/utils/logger';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Build where clause
    const where: Record<string, unknown> = {
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

    // Fetch clients matching search criteria
    const clients = await prisma.clients.findMany({
      where,
      orderBy: { created_at: 'desc' },
    });

    // Prepare data for Excel
    const exportData = clients.map((client) => ({
      ID: client.id,
      Name: client.name,
      Email: client.email,
      Mobile: client.mobile || '',
      Status: client.status,
      Address: client.address || '',
      'Created At': new Date(client.created_at).toLocaleString(),
      'Updated At': new Date(client.updated_at).toLocaleString(),
      'Created By': client.created_by,
      'Updated By': client.updated_by,
    }));

    // Create workbook and worksheet
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Set column widths
    worksheet['!cols'] = [
      { wch: 5 },   // ID
      { wch: 20 },  // Name
      { wch: 25 },  // Email
      { wch: 15 },  // Mobile
      { wch: 10 },  // Status
      { wch: 30 },  // Address
      { wch: 20 },  // Created At
      { wch: 20 },  // Updated At
      { wch: 15 },  // Created By
      { wch: 15 },  // Updated By
    ];

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clients');

    // Generate Excel file buffer
    const excelBuffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    // Generate filename with current date
    const date = new Date().toISOString().split('T')[0];
    const filename = `clients_export_${date}.xlsx`;

    // Return Excel file as response
    return new NextResponse(excelBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    logger.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    );
  }
}