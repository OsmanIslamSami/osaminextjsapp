import { Prisma } from '@/lib/generated/prisma/client';

/**
 * Search and filter options for news queries
 */
export interface NewsSearchOptions {
  keyword?: string;
  dateFrom?: string;
  dateTo?: string;
  isVisible?: boolean;
  isDeleted?: boolean;
  status?: 'all' | 'visible' | 'hidden' | 'deleted';
}

/**
 * Builds a Prisma where clause for news search and filtering
 * @param options - Search and filter options
 * @param isPublic - Whether this is for public viewing (excludes deleted/hidden)
 * @returns Prisma where clause
 */
export function buildNewsWhereClause(
  options: NewsSearchOptions,
  isPublic: boolean = false
): Prisma.NewsWhereInput {
  const { keyword, dateFrom, dateTo, status } = options;

  const where: Prisma.NewsWhereInput = {};

  // Public queries only show visible, non-deleted, published news
  if (isPublic) {
    where.is_deleted = false;
    where.is_visible = true;
    // Show news published today or earlier (using end of today to include today's news)
    const endOfToday = new Date();
    endOfToday.setHours(23, 59, 59, 999);
    where.published_date = {
      lte: endOfToday,
    };
  } else {
    // Admin queries - handle status filter
    if (status === 'visible') {
      where.is_visible = true;
      where.is_deleted = false;
    } else if (status === 'hidden') {
      where.is_visible = false;
      where.is_deleted = false;
    } else if (status === 'deleted') {
      where.is_deleted = true;
    } else {
      // 'all' - no filter on visibility/deletion
      where.is_deleted = false; // Still exclude hard-deleted items
    }
  }

  // Keyword search on title fields
  if (keyword && keyword.trim()) {
    where.OR = [
      {
        title_en: {
          contains: keyword.trim(),
          mode: 'insensitive',
        },
      },
      {
        title_ar: {
          contains: keyword.trim(),
          mode: 'insensitive',
        },
      },
    ];
  }

  // Date range filter
  const dateConditions: any = {};
  
  // For public queries, preserve the lte: now() filter
  if (isPublic && where.published_date && typeof where.published_date === 'object') {
    dateConditions.lte = where.published_date.lte;
  }
  
  if (dateFrom) {
    const fromDate = new Date(dateFrom);
    if (!isNaN(fromDate.getTime())) {
      dateConditions.gte = fromDate;
    }
  }
  if (dateTo) {
    const toDate = new Date(dateTo);
    if (!isNaN(toDate.getTime())) {
      // Set to end of day
      toDate.setHours(23, 59, 59, 999);
      // For public queries, use the more restrictive date (earlier of the two)
      if (isPublic && dateConditions.lte) {
        dateConditions.lte = toDate < dateConditions.lte ? toDate : dateConditions.lte;
      } else {
        dateConditions.lte = toDate;
      }
    }
  }
  if (Object.keys(dateConditions).length > 0) {
    where.published_date = dateConditions;
  }

  return where;
}

/**
 * Validates and sanitizes pagination parameters
 * @param page - Page number (1-indexed)
 * @param limit - Items per page
 * @param maxLimit - Maximum allowed limit
 * @returns Validated pagination parameters
 */
export function validatePagination(
  page?: number | string,
  limit?: number | string,
  maxLimit: number = 50
): {
  page: number;
  limit: number;
  skip: number;
} {
  const pageNum = typeof page === 'string' ? parseInt(page, 10) : page || 1;
  const limitNum = typeof limit === 'string' ? parseInt(limit, 10) : limit || 12;

  const validatedPage = Math.max(1, pageNum);
  const validatedLimit = Math.min(maxLimit, Math.max(1, limitNum));
  const skip = (validatedPage - 1) * validatedLimit;

  return {
    page: validatedPage,
    limit: validatedLimit,
    skip,
  };
}

/**
 * Formats news data for Excel export
 * @param newsItems - News items from database
 * @returns Formatted data for Excel
 */
export function formatNewsForExport(newsItems: any[]): any[] {
  return newsItems.map((item) => ({
    ID: item.id,
    'Title (EN)': item.title_en || 'N/A',
    'Title (AR)': item.title_ar || 'N/A',
    'Published Date': new Date(item.published_date).toLocaleDateString('en-US'),
    Visible: item.is_visible ? 'Yes' : 'No',
    'Storage Type': item.storage_type === 'blob' ? 'Blob' : 'Local',
    'Created Date': new Date(item.created_at).toLocaleDateString('en-US'),
    Status: item.is_deleted
      ? 'Deleted'
      : item.is_visible
      ? 'Visible'
      : 'Hidden',
  }));
}
