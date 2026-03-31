import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Adding news section to home_sections...');
    
    // Check if news section already exists
    const existingSection = await prisma.home_sections.findUnique({
      where: { section_type: 'news' }
    });

    if (existingSection) {
      console.log('News section already exists');
      return;
    }

    // Create news section
    const newsSection = await prisma.home_sections.create({
      data: {
        section_type: 'news',
        is_visible: true,
        title_en: 'Latest News',
        title_ar: 'آخر الأخبار',
        display_order: 0,
      }
    });

    console.log('News section added successfully:', newsSection);
  } catch (error) {
    console.error('Error adding news section:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
