import 'dotenv/config';
import { PrismaClient } from '../lib/generated/prisma/client.js';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Adding FAQ and Magazine sections to home_sections...');

  // Add FAQ section
  const existingFAQ = await prisma.home_sections.findUnique({
    where: { section_type: 'faq' }
  });

  if (existingFAQ) {
    console.log('✓ FAQ section already exists');
  } else {
    const faqSection = await prisma.home_sections.create({
      data: {
        section_type: 'faq',
        is_visible: true,
        title_en: 'Frequently Asked Questions',
        title_ar: 'الأسئلة المتكررة',
        display_order: 5,
      }
    });
    console.log('✓ Created FAQ section:', faqSection.section_type);
  }

  // Add Magazines section
  const existingMagazines = await prisma.home_sections.findUnique({
    where: { section_type: 'magazines' }
  });

  if (existingMagazines) {
    console.log('✓ Magazines section already exists');
  } else {
    const magazinesSection = await prisma.home_sections.create({
      data: {
        section_type: 'magazines',
        is_visible: true,
        title_en: 'Magazines',
        title_ar: 'المجلات',
        display_order: 6,
      }
    });
    console.log('✓ Created Magazines section:', magazinesSection.section_type);
  }

  console.log('\n✅ FAQ and Magazine sections setup completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
