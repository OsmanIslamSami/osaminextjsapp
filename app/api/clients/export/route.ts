import { query } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const search = searchParams.get('search') || '';

    // Fetch clients matching search criteria
    const result = await query(
      'SELECT id, name, email, mobile, address, created_at, updated_at, created_by, updated_by FROM clients WHERE is_deleted = false AND (name ILIKE $1 OR email ILIKE $1 OR mobile ILIKE $1) ORDER BY created_at DESC',
      [`%${search}%`]
    );

    // Prepare data for Excel
    const exportData = result.rows.map((client) => ({
      ID: client.id,
      Name: client.name,
      Email: client.email,
      Mobile: client.mobile || '',
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
    console.error('Export error:', error);
    return NextResponse.json(
      { error: 'Failed to export clients' },
      { status: 500 }
    );
  }
}
