import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { logger } from '@/lib/utils/logger';

/**
 * GET /api/faq
 * List FAQs with optional pagination and filtering
 * Auth: Required (any authenticated user)
 */
export async function GET(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const favoritesOnly = searchParams.get('favorites_only') === 'true';
    const homePage = searchParams.get('home_page') === 'true';
    
    // Validate limit values
    const allowedLimits = [10, 20, 50, 100, 500];
    const validLimit = allowedLimits.includes(limit) ? limit : 10;
    
    // Calculate pagination
    const skip = (page - 1) * validLimit;
    
    // Build where clause
    const where: any = {
      is_deleted: false,
    };
    
    if (favoritesOnly) {
      where.is_favorite = true;
    }
    
    // Build orderBy clause
    let orderBy: any = { created_at: 'desc' };
    
    if (homePage || favoritesOnly) {
      // For home page: favorites first, then by creation date
      orderBy = [
        { is_favorite: 'desc' },
        { created_at: 'desc' }
      ];
    }
    
    // Adjust limit for home page
    const finalLimit = homePage ? Math.min(validLimit, 10) : validLimit;
    
    // Fetch FAQs with pagination
    const [faqs, totalCount] = await Promise.all([
      prisma.fAQ.findMany({
        where,
        orderBy,
        skip,
        take: finalLimit,
        select: {
          id: true,
          question_en: true,
          question_ar: true,
          answer_en: true,
          answer_ar: true,
          is_favorite: true,
          is_visible: true,
          display_order: true,
          created_at: true,
          updated_at: true,
        }
      }),
      prisma.fAQ.count({ where })
    ]);
    
    const totalPages = Math.ceil(totalCount / finalLimit);
    
    return NextResponse.json({
      data: faqs,
      totalCount,
      totalPages,
      currentPage: page,
      limit: finalLimit
    });
    
  } catch (error) {
    logger.error('Error fetching FAQs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch FAQs' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/faq
 * Create a new FAQ
 * Auth: Admin only
 */
export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
      select: { id: true, role: true }
    });
    
    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }
    
    const body = await request.json();
    const { question_en, question_ar, answer_en, answer_ar, is_favorite } = body;
    
    // Validate required fields
    if (!question_en || !question_ar || !answer_en || !answer_ar) {
      return NextResponse.json(
        { error: 'Missing required fields: question_en, question_ar, answer_en, answer_ar' },
        { status: 400 }
      );
    }
    
    // Validate field lengths
    if (question_en.length > 500 || question_ar.length > 500) {
      return NextResponse.json(
        { error: 'Question text must not exceed 500 characters' },
        { status: 400 }
      );
    }
    
    // Create FAQ
    const faq = await prisma.fAQ.create({
      data: {
        question_en,
        question_ar,
        answer_en,
        answer_ar,
        is_favorite: is_favorite || false,
        created_by: user.id,
        updated_by: user.id,
      },
      select: {
        id: true,
        question_en: true,
        question_ar: true,
        answer_en: true,
        answer_ar: true,
        is_favorite: true,
        display_order: true,
        created_by: true,
        updated_by: true,
        created_at: true,
        updated_at: true,
      }
    });
    
    return NextResponse.json(
      { data: faq },
      { status: 201 }
    );
    
  } catch (error) {
    logger.error('Error creating FAQ:', error);
    return NextResponse.json(
      { error: 'Failed to create FAQ' },
      { status: 500 }
    );
  }
}