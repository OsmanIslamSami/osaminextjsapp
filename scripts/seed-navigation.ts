import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🌱 Seeding navigation...');

  // Clear existing navigation
  await prisma.navigation.deleteMany();

  // =====================
  // HEADER NAVIGATION
  // =====================

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

  // Standalone header links
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

  // =====================
  // FOOTER NAVIGATION
  // =====================

  // Quick Links section
  const quickLinks = await prisma.navigation.create({
    data: {
      label_en: 'Quick Links',
      label_ar: 'روابط سريعة',
      url: '#',
      location: 'footer',
      type: 'section-header',
      is_visible: true,
      display_order: 1,
    },
  });

  await prisma.navigation.createMany({
    data: [
      {
        label_en: 'News',
        label_ar: 'الأخبار',
        url: '/news',
        location: 'footer',
        type: 'link',
        parent_id: quickLinks.id,
        is_visible: true,
        display_order: 1,
      },
      {
        label_en: 'Photos',
        label_ar: 'الصور',
        url: '/photos',
        location: 'footer',
        type: 'link',
        parent_id: quickLinks.id,
        is_visible: true,
        display_order: 2,
      },
      {
        label_en: 'Videos',
        label_ar: 'الفيديوهات',
        url: '/videos',
        location: 'footer',
        type: 'link',
        parent_id: quickLinks.id,
        is_visible: true,
        display_order: 3,
      },
    ],
  });

  // Resources section
  const resources = await prisma.navigation.create({
    data: {
      label_en: 'Resources',
      label_ar: 'الموارد',
      url: '#',
      location: 'footer',
      type: 'section-header',
      is_visible: true,
      display_order: 2,
    },
  });

  await prisma.navigation.createMany({
    data: [
      {
        label_en: 'FAQs',
        label_ar: 'الأسئلة المتكررة',
        url: '/faq',
        location: 'footer',
        type: 'link',
        parent_id: resources.id,
        is_visible: true,
        display_order: 1,
      },
      {
        label_en: 'Partners',
        label_ar: 'الشركاء',
        url: '/partners',
        location: 'footer',
        type: 'link',
        parent_id: resources.id,
        is_visible: true,
        display_order: 2,
      },
      {
        label_en: 'Magazines',
        label_ar: 'المجلات',
        url: '/magazines',
        location: 'footer',
        type: 'link',
        parent_id: resources.id,
        is_visible: true,
        display_order: 3,
      },
    ],
  });

  console.log('✅ Navigation seeded successfully!');
  console.log('   Header: Media dropdown (News, Photos, Videos, Magazines) + FAQs + Partners');
  console.log('   Footer: Quick Links (News, Photos, Videos) + Resources (FAQs, Partners, Magazines)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding navigation:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
