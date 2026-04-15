import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('⚠️  This seed script is deprecated. Use seed-navigation.ts instead.');
  console.log('🌱 Seeding header navigation (legacy)...');

  // Clear existing header navigation
  await prisma.navigation.deleteMany({ where: { location: 'header' } });

  // Create Media dropdown and its items
  const mediaDropdown = await prisma.navigation.create({
    data: {
      label_en: 'Media',
      label_ar: 'الوسائط',
      url: '#',
      location: 'header',
      type: 'dropdown',
      is_visible: true,
      display_order: 1,
    },
  });

  await prisma.navigation.createMany({
    data: [
      {
        label_en: 'All News',
        label_ar: 'جميع الأخبار',
        url: '/news',
        location: 'header',
        type: 'dropdown-item',
        parent_id: mediaDropdown.id,
        is_visible: true,
        display_order: 1,
      },
      {
        label_en: 'All Photos',
        label_ar: 'جميع الصور',
        url: '/photos',
        location: 'header',
        type: 'dropdown-item',
        parent_id: mediaDropdown.id,
        is_visible: true,
        display_order: 2,
      },
      {
        label_en: 'All Videos',
        label_ar: 'جميع الفيديوهات',
        url: '/videos',
        location: 'header',
        type: 'dropdown-item',
        parent_id: mediaDropdown.id,
        is_visible: true,
        display_order: 3,
      },
      {
        label_en: 'Magazines',
        label_ar: 'المجلات',
        url: '/magazines',
        location: 'header',
        type: 'dropdown-item',
        parent_id: mediaDropdown.id,
        is_visible: true,
        display_order: 4,
      },
    ],
  });

  // Create standalone links
  await prisma.navigation.createMany({
    data: [
      {
        label_en: 'FAQs',
        label_ar: 'الأسئلة المتكررة',
        url: '/faq',
        location: 'header',
        type: 'link',
        is_visible: true,
        display_order: 2,
      },
      {
        label_en: 'Partners',
        label_ar: 'الشركاء',
        url: '/partners',
        location: 'header',
        type: 'link',
        is_visible: true,
        display_order: 3,
      },
    ],
  });

  console.log('✅ Header navigation seeded successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding header navigation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
