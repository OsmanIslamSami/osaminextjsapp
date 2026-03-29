import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding news data...');

  const newsItems = [
    {
      title_en: 'AI Revolution in Business: How Technology is Transforming Industries',
      title_ar: 'ثورة الذكاء الاصطناعي في الأعمال: كيف تغير التكنولوجيا الصناعات',
      image_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-29'),
      is_visible: true,
    },
    {
      title_en: 'Global Market Expansion: New Opportunities in Emerging Markets',
      title_ar: 'التوسع في السوق العالمية: فرص جديدة في الأسواق الناشئة',
      image_url: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-28'),
      is_visible: true,
    },
    {
      title_en: 'Sustainability Initiative: Going Green in 2026',
      title_ar: 'مبادرة الاستدامة: التحول إلى الأخضر في ٢٠٢٦',
      image_url: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-27'),
      is_visible: true,
    },
    {
      title_en: 'Team Excellence Awards: Celebrating Outstanding Performance',
      title_ar: 'جوائز التميز للفريق: الاحتفال بالأداء المتميز',
      image_url: 'https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-26'),
      is_visible: true,
    },
    {
      title_en: 'Cybersecurity Best Practices: Protecting Your Digital Assets',
      title_ar: 'أفضل ممارسات الأمن السيبراني: حماية أصولك الرقمية',
      image_url: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-25'),
      is_visible: true,
    },
    {
      title_en: 'Innovation Lab Launch: Building the Future of Technology',
      title_ar: 'إطلاق مختبر الابتكار: بناء مستقبل التكنولوجيا',
      image_url: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-24'),
      is_visible: true,
    },
    {
      title_en: 'Customer Success Stories: Real Results from Real Businesses',
      title_ar: 'قصص نجاح العملاء: نتائج حقيقية من شركات حقيقية',
      image_url: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-23'),
      is_visible: true,
    },
    {
      title_en: 'Product Roadmap 2026: What\'s Coming Next',
      title_ar: 'خريطة طريق المنتج ٢٠٢٦: ما القادم',
      image_url: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-22'),
      is_visible: true,
    },
    {
      title_en: 'Remote Work Revolution: Tips for Distributed Teams',
      title_ar: 'ثورة العمل عن بعد: نصائح للفرق الموزعة',
      image_url: 'https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-21'),
      is_visible: true,
    },
    {
      title_en: 'Industry Insights: Market Trends and Financial Forecasts',
      title_ar: 'رؤى الصناعة: اتجاهات السوق والتوقعات المالية',
      image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&q=80',
      storage_type: 'blob',
      published_date: new Date('2026-03-20'),
      is_visible: true,
    },
  ];

  for (const newsData of newsItems) {
    try {
      const news = await prisma.news.create({
        data: newsData,
      });
      console.log(`✓ Created news: ${news.title_en || news.title_ar}`);
    } catch (error) {
      console.error(`✗ Failed to create news: ${newsData.title_en}`, error);
    }
  }

  console.log('News seeding completed!');
}

main()
  .catch((e) => {
    console.error('Error seeding news:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
