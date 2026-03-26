import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const sampleSlides = [
  {
    media_url: '/uploads/slides/sample-hero-1.jpg',
    media_type: 'image',
    title_en: 'Welcome to Our Platform',
    title_ar: 'مرحبًا بك في منصتنا',
    button_text_en: 'Get Started',
    button_text_ar: 'ابدأ الآن',
    button_url: '/clients',
    show_button: true,
    display_order: 0,
    is_visible: true,
  },
  {
    media_url: '/uploads/slides/sample-hero-2.jpg',
    media_type: 'image',
    title_en: 'Manage Your Clients Efficiently',
    title_ar: 'إدارة عملائك بكفاءة',
    button_text_en: 'View Dashboard',
    button_text_ar: 'عرض لوحة التحكم',
    button_url: '/dashboard',
    show_button: true,
    display_order: 1,
    is_visible: true,
  },
  {
    media_url: '/uploads/slides/sample-hero-3.jpg',
    media_type: 'image',
    title_en: 'Professional Client Management',
    title_ar: 'إدارة احترافية للعملاء',
    button_text_en: null,
    button_text_ar: null,
    button_url: null,
    show_button: false,
    display_order: 2,
    is_visible: true,
  },
];

async function main() {
  console.log('🎯 Seeding slider content...');

  for (const slide of sampleSlides) {
    // Check if slide with same display_order exists
    const existing = await prisma.sliderContent.findFirst({
      where: {
        display_order: slide.display_order,
        is_deleted: false,
      },
    });

    if (!existing) {
      await prisma.sliderContent.create({
        data: slide,
      });
      console.log(`✓ Created slide: ${slide.title_en} (order: ${slide.display_order})`);
    } else {
      console.log(`⊘ Slide at order ${slide.display_order} already exists, skipping`);
    }
  }

  console.log('✅ Slider seeding complete!');
  console.log('');
  console.log('📝 Note: Replace sample image URLs in /uploads/slides/ with actual images');
  console.log('   You can upload images through the admin panel at /admin/slider');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding slider:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
