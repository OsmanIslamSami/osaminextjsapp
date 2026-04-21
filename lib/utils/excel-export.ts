import ExcelJS from 'exceljs';

export interface ExcelColumn {
  header: string;
  key: string;
  width?: number;
}

export interface ExcelExportOptions {
  fileName: string;
  sheetName: string;
  columns: ExcelColumn[];
  data: Record<string, unknown>[];
  autoFilter?: boolean;
  headerStyle?: Partial<ExcelJS.Style>;
}

/**
 * Generates an Excel workbook from data
 * @param options - Export configuration
 * @returns Excel workbook buffer
 */
export async function generateExcel(
  options: ExcelExportOptions
): Promise<Buffer> {
  const {
    sheetName,
    columns,
    data,
    autoFilter = true,
    headerStyle = {
      font: { bold: true, color: { argb: 'FFFFFFFF' } },
      fill: {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FF2563EB' }, // Blue-600
      },
      alignment: { vertical: 'middle', horizontal: 'left' },
    },
  } = options;

  const workbook = new ExcelJS.Workbook();
  const worksheet = workbook.addWorksheet(sheetName);

  // Add columns
  worksheet.columns = columns.map((col) => ({
    header: col.header,
    key: col.key,
    width: col.width || 15,
  }));

  // Style the header row
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell((cell) => {
    cell.style = headerStyle as ExcelJS.Style;
  });
  headerRow.height = 20;

  // Add data rows
  data.forEach((item) => {
    worksheet.addRow(item);
  });

  // Apply auto filter
  if (autoFilter && data.length > 0) {
    worksheet.autoFilter = {
      from: { row: 1, column: 1 },
      to: { row: 1, column: columns.length },
    };
  }

  // Freeze the header row
  worksheet.views = [{ state: 'frozen', ySplit: 1 }];

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Creates an HTTP response with Excel file download headers
 * @param buffer - Excel file buffer
 * @param fileName - Name of the file to download
 * @returns Response object
 */
export function createExcelResponse(
  buffer: Buffer,
  fileName: string
): Response {
  const headers = new Headers();
  headers.set('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  headers.set('Content-Disposition', `attachment; filename="${fileName}"`);
  headers.set('Content-Length', buffer.length.toString());

  return new Response(buffer as any, {
    status: 200,
    headers,
  });
}
