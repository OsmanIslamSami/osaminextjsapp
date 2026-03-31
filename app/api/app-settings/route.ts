import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

// GET /api/app-settings - Get application settings
export async function GET(request: NextRequest) {
  try {
    // Get the first (and should be only) settings record
    let settings = await prisma.app_settings.findFirst();

    // If no settings exist, create default settings
    if (!settings) {
      settings = await prisma.app_settings.create({
        data: {
          arabic_font: 'Cairo',
          english_font: 'Inter',
          theme: 'default',
          site_title_en: 'Next App',
          site_title_ar: 'تطبيق نكست',
          site_description_en: 'A modern web application',
          site_description_ar: 'تطبيق ويب حديث',
          site_logo_storage_type: 'upload',
          og_image_storage_type: 'upload',
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('App settings GET error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch app settings' },
      { status: 500 }
    );
  }
}

// PATCH /api/app-settings - Update application settings
export async function PATCH(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { clerk_user_id: userId },
    });

    if (!user || user.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Forbidden - Admin access required' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const {
      arabic_font,
      english_font,
      theme,
      primary_color,
      secondary_color,
      site_title_en,
      site_title_ar,
      site_description_en,
      site_description_ar,
      site_logo_url,
      site_logo_storage_type,
      og_image_url,
      og_image_storage_type,
      site_keywords_en,
      site_keywords_ar,
    } = body;

    // Get existing settings or create new
    let settings = await prisma.app_settings.findFirst();

    if (!settings) {
      // Create new settings
      settings = await prisma.app_settings.create({
        data: {
          arabic_font: arabic_font || 'Cairo',
          english_font: english_font || 'Inter',
          theme: theme || 'default',
          primary_color,
          secondary_color,
          site_title_en: site_title_en || 'Next App',
          site_title_ar: site_title_ar || 'تطبيق نكست',
          site_description_en: site_description_en || 'A modern web application',
          site_description_ar: site_description_ar || 'تطبيق ويب حديث',
          site_logo_url,
          site_logo_storage_type: site_logo_storage_type || 'upload',
          og_image_url,
          og_image_storage_type: og_image_storage_type || 'upload',
          site_keywords_en,
          site_keywords_ar,
          updated_by: user.id,
        },
      });
    } else {
      // Update existing settings
      settings = await prisma.app_settings.update({
        where: { id: settings.id },
        data: {
          ...(arabic_font !== undefined && { arabic_font }),
          ...(english_font !== undefined && { english_font }),
          ...(theme !== undefined && { theme }),
          ...(primary_color !== undefined && { primary_color }),
          ...(secondary_color !== undefined && { secondary_color }),
          ...(site_title_en !== undefined && { site_title_en }),
          ...(site_title_ar !== undefined && { site_title_ar }),
          ...(site_description_en !== undefined && { site_description_en }),
          ...(site_description_ar !== undefined && { site_description_ar }),
          ...(site_logo_url !== undefined && { site_logo_url }),
          ...(site_logo_storage_type !== undefined && { site_logo_storage_type }),
          ...(og_image_url !== undefined && { og_image_url }),
          ...(og_image_storage_type !== undefined && { og_image_storage_type }),
          ...(site_keywords_en !== undefined && { site_keywords_en }),
          ...(site_keywords_ar !== undefined && { site_keywords_ar }),
          updated_by: user.id,
        },
      });
    }

    return NextResponse.json({ success: true, data: settings });
  } catch (error) {
    console.error('App settings PATCH error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update app settings' },
      { status: 500 }
    );
  }
}
