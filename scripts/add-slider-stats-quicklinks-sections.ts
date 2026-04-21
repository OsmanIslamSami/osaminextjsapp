import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const newSections = [
  {
    section_type: 'slider',
    is_visible: true,
    title_en: 'Hero Slider',
    title_ar: 'السلايدر الرئيسي',
    display_order: 0,
  },
  {
    section_type: 'stats',
    is_visible: true,
    title_en: 'Quick Overview',
    title_ar: 'نظرة سريعة',
    display_order: 7,
  },
  {
    section_type: 'quicklinks',
    is_visible: true,
    title_en: 'Quick Links',
    title_ar: 'روابط سريعة',
    display_order: 8,
  },
];

async function main() {
  console.log('Adding Slider, Stats, and Quick Links sections to home_sections...');

  for (const section of newSections) {
    const existing = await prisma.home_sections.findUnique({
      where: { section_type: section.section_type },
    });

    if (existing) {
      console.log(`✓ ${section.section_type} section already exists (display_order: ${existing.display_order})`);
    } else {
      const created = await prisma.home_sections.create({ data: section });
      console.log(`✓ Created ${created.section_type} section (display_order: ${created.display_order})`);
    }
  }

  console.log('\n✅ All sections setup completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
