/**
 * Seed Script: Media Library (Photos, Videos, Partners, Home Sections)
 * Creates sample data for development and testing
 */

import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding media library...');

  // Step 1: Initialize home section configurations
  console.log('\n📋 Creating home section configurations...');
  
  const photosSection = await prisma.home_sections.upsert({
    where: { section_type: 'photos' },
    update: {},
    create: {
      section_type: 'photos',
      is_visible: true,
      display_order: 1,
    },
  });

  const videosSection = await prisma.home_sections.upsert({
    where: { section_type: 'videos' },
    update: {},
    create: {
      section_type: 'videos',
      is_visible: true,
      display_order: 2,
    },
  });

  const partnersSection = await prisma.home_sections.upsert({
    where: { section_type: 'partners' },
    update: {},
    create: {
      section_type: 'partners',
      is_visible: true,
      display_order: 3,
      partners_display_mode: 'all',
    },
  });

  console.log('✅ Home sections configured:', {
    photos: photosSection.id,
    videos: videosSection.id,
    partners: partnersSection.id,
  });

  // Step 2: Create 30 sample photos
  console.log('\n📸 Creating 30 sample photos...');
  
  const photoTitles = [
    ['Grand Opening Ceremony', 'حفل الافتتاح الكبير'],
    ['Team Meeting 2026', 'اجتماع الفريق 2026'],
    ['Product Launch Event', 'حدث إطلاق المنتج'],
    ['Office Renovation', 'تجديد المكتب'],
    ['Annual Conference', 'المؤتمر السنوي'],
    ['Community Outreach', 'التواصل المجتمعي'],
    ['Training Workshop', 'ورشة تدريبية'],
    ['Award Ceremony', 'حفل توزيع الجوائز'],
    ['Christmas Party 2025', 'حفل عيد الميلاد 2025'],
    ['Summer Festival', 'مهرجان الصيف'],
    ['New Branch Opening', 'افتتاح الفرع الجديد'],
    ['Employee Recognition', 'تكريم الموظفين'],
    ['Charity Event', 'حدث خيري'],
    ['Sports Day', 'يوم رياضي'],
    ['Technology Showcase', 'عرض التكنولوجيا'],
    ['Client Appreciation', 'تقدير العملاء'],
    ['Product Demo', 'عرض توضيحي للمنتج'],
    ['Board Meeting', 'اجتماع مجلس الإدارة'],
    ['Corporate Retreat', 'تراجع الشركة'],
    ['Innovation Lab', 'مختبر الابتكار'],
    ['Green Initiative', 'المبادرة الخضراء'],
    ['Safety Training', 'تدريب السلامة'],
    ['Quality Assurance', 'ضمان الجودة'],
    ['Customer Service Excellence', 'التميز في خدمة العملاء'],
    ['Digital Transformation', 'التحول الرقمي'],
    ['Partnership Signing', 'توقيع الشراكة'],
    ['Factory Tour', 'جولة المصنع'],
    ['Research Lab', 'مختبر الأبحاث'],
    ['Supply Chain Optimization', 'تحسين سلسلة التوريد'],
    ['Market Expansion', 'التوسع في السوق'],
  ];

  const photoDescriptions = [
    ['A grand ceremony marking the official opening of our new facility with executives and partners.', 'حفل كبير يمثل الافتتاح الرسمي لمنشأتنا الجديدة مع المسؤولين التنفيذيين والشركاء.'],
    ['Our team gathered for the quarterly planning session to discuss goals and strategies.', 'اجتمع فريقنا لجلسة التخطيط الفصلية لمناقشة الأهداف والاستراتيجيات.'],
    ['Unveiling our latest innovation to customers and media representatives.', 'الكشف عن أحدث ابتكاراتنا للعملاء وممثلي وسائل الإعلام.'],
    ['Transformation of our workspace into a modern, collaborative environment.', 'تحويل مساحة العمل لدينا إلى بيئة حديثة وتعاونية.'],
    ['Annual gathering of industry leaders and stakeholders sharing insights.', 'التجمع السنوي لقادة الصناعة وأصحاب المصلحة لتبادل الأفكار.'],
  ];

  for (let i = 0; i < 30; i++) {
    const photoIndex = i % photoTitles.length;
    const descIndex = i % photoDescriptions.length;
    const isFeatured = i < 5; // Make first 5 photos featured
    
    await prisma.photos.create({
      data: {
        title_en: photoTitles[photoIndex][0],
        title_ar: photoTitles[photoIndex][1],
        description_en: photoDescriptions[descIndex][0],
        description_ar: photoDescriptions[descIndex][1],
        image_url: `https://placehold.co/800x600/4285f4/ffffff/png?text=${encodeURIComponent(photoTitles[photoIndex][0])}`,
        storage_type: 'blob',
        file_name: `photo-${i + 1}.jpg`,
        file_size: 150000 + Math.floor(Math.random() * 100000),
        mime_type: 'image/jpeg',
        is_featured: isFeatured,
        is_visible: true,
        published_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000), // Stagger by days
      },
    });
  }

  console.log('✅ Created 30 sample photos (5 featured)');

  // Step 3: Create 30 sample videos
  console.log('\n🎥 Creating 30 sample videos...');
  
  const videoTitles = [
    ['Company Overview 2026', 'نظرة عامة على الشركة 2026'],
    ['Product Tutorial Series', 'سلسلة دروس المنتج'],
    ['Behind the Scenes', 'خلف الكواليس'],
    ['Customer Success Story', 'قصة نجاح العميل'],
    ['Industry Insights', 'رؤى الصناعة'],
    ['How It Works', 'كيف يعمل'],
    ['Team Culture Video', 'فيديو ثقافة الفريق'],
    ['Safety Procedures', 'إجراءات السلامة'],
    ['New Product Launch', 'إطلاق منتج جديد'],
    ['CEO Message', 'رسالة الرئيس التنفيذي'],
    ['Training Module 1', 'وحدة التدريب 1'],
    ['Factory Walkthrough', 'جولة في المصنع'],
    ['Quality Standards', 'معايير الجودة'],
    ['Innovation Showcase', 'عرض الابتكار'],
    ['Sustainability Initiatives', 'مبادرات الاستدامة'],
    ['Partnership Highlights', 'أبرز الشراكات'],
    ['Annual Report Video', 'فيديو التقرير السنوي'],
    ['Employee Testimonials', 'شهادات الموظفين'],
    ['Technical Deep Dive', 'تحليل تقني عميق'],
    ['Market Analysis', 'تحليل السوق'],
    ['Customer Onboarding', 'تأهيل العملاء'],
    ['Maintenance Guide', 'دليل الصيانة'],
    ['Troubleshooting Tips', 'نصائح استكشاف الأخطاء'],
    ['Webinar Recording', 'تسجيل الندوة عبر الإنترنت'],
    ['Event Highlights', 'أبرز الأحداث'],
    ['Research Findings', 'نتائج البحث'],
    ['Installation Tutorial', 'دليل التثبيت'],
    ['Performance Metrics', 'مقاييس الأداء'],
    ['Strategic Vision', 'الرؤية الاستراتيجية'],
    ['Community Impact', 'التأثير المجتمعي'],
  ];

  // Sample YouTube video IDs (using public domain/Creative Commons videos)
  const sampleVideoIds = [
    'dQw4w9WgXcQ', // Sample video 1
    'M7lc1UVf-VE', // Sample video 2
    '9bZkp7q19f0', // Sample video 3
    'jNQXAC9IVRw', // Sample video 4
    'oHg5SJYRHA0', // Sample video 5
  ];

  for (let i = 0; i < 30; i++) {
    const videoIndex = i % videoTitles.length;
    const videoId = sampleVideoIds[i % sampleVideoIds.length];
    const isFeatured = i < 6; // Make first 6 videos featured
    
    await prisma.videos.create({
      data: {
        title_en: videoTitles[videoIndex][0],
        title_ar: videoTitles[videoIndex][1],
        description_en: `Watch this comprehensive video about ${videoTitles[videoIndex][0].toLowerCase()}.`,
        description_ar: `شاهد هذا الفيديو الشامل عن ${videoTitles[videoIndex][1]}.`,
        youtube_url: `https://www.youtube.com/watch?v=${videoId}`,
        video_id: videoId,
        thumbnail_url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        storage_type: 'blob',
        file_name: `thumbnail-${i + 1}.jpg`,
        file_size: 80000 + Math.floor(Math.random() * 50000),
        mime_type: 'image/jpeg',
        is_featured: isFeatured,
        is_visible: true,
        published_date: new Date(Date.now() - i * 24 * 60 * 60 * 1000),
      },
    });
  }

  console.log('✅ Created 30 sample videos (6 featured)');

  // Step 4: Create 30 sample partners
  console.log('\n🤝 Creating 30 sample partners...');
  
  const partnerNames = [
    ['Global Tech Solutions', 'حلول التكنولوجيا العالمية'],
    ['Innovation Partners', 'شركاء الابتكار'],
    ['Future Industries', 'صناعات المستقبل'],
    ['Sustainable Energy Co', 'شركة الطاقة المستدامة'],
    ['Digital Dynamics', 'الديناميكيات الرقمية'],
    ['Smart Systems Inc', 'شركة الأنظمة الذكية'],
    ['Prime Logistics', 'الخدمات اللوجستية الأولى'],
    ['Quality Assurance Ltd', 'شركة ضمان الجودة المحدودة'],
    ['Advanced Materials', 'المواد المتقدمة'],
    ['Precision Engineering', 'الهندسة الدقيقة'],
    ['Eco Solutions Group', 'مجموعة الحلول البيئية'],
    ['Integrated Services', 'الخدمات المتكاملة'],
    ['Strategic Consulting', 'الاستشارات الاستراتيجية'],
    ['Tech Innovations', 'ابتكارات التكنولوجيا'],
    ['Elite Manufacturing', 'التصنيع الراقي'],
    ['Global Supply Chain', 'سلسلة التوريد العالمية'],
    ['Digital Marketing Pro', 'التسويق الرقمي الاحترافي'],
    ['Advanced Analytics', 'التحليلات المتقدمة'],
    ['Cloud Services Plus', 'خدمات السحابة بلس'],
    ['Security Systems Corp', 'شركة أنظمة الأمن'],
    ['Renewable Resources', 'الموارد المتجددة'],
    ['Data Solutions Hub', 'مركز حلول البيانات'],
    ['Process Optimization', 'تحسين العمليات'],
    ['Automation Experts', 'خبراء الأتمتة'],
    ['Network Solutions', 'حلول الشبكات'],
    ['Project Management Pro', 'إدارة المشاريع الاحترافية'],
    ['Quality Control Systems', 'أنظمة مراقبة الجودة'],
    ['Business Intelligence', 'ذكاء الأعمال'],
    ['Enterprise Software', 'برامج المؤسسات'],
    ['Technical Support Plus', 'الدعم الفني بلس'],
  ];

  for (let i = 0; i < 30; i++) {
    const partnerIndex = i % partnerNames.length;
    const isFeatured = i < 8; // Make first 8 partners featured
    
    await prisma.partners.create({
      data: {
        title_en: partnerNames[partnerIndex][0],
        title_ar: partnerNames[partnerIndex][1],
        url: `https://partner${i + 1}.example.com`,
        image_url: `https://placehold.co/200x200/34a853/ffffff/png?text=${encodeURIComponent(partnerNames[partnerIndex][0].substring(0, 2))}`,
        storage_type: 'blob',
        file_name: `partner-logo-${i + 1}.png`,
        file_size: 20000 + Math.floor(Math.random() * 30000),
        mime_type: 'image/png',
        is_featured: isFeatured,
        is_visible: true,
      },
    });
  }

  console.log('✅ Created 30 sample partners (8 featured)');

  console.log('\n🎉 Media library seeded successfully!');
  console.log('\nSummary:');
  console.log('- 3 home section configurations');
  console.log('- 30 photos (5 featured)');
  console.log('- 30 videos (6 featured)');
  console.log('- 30 partners (8 featured)');
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
