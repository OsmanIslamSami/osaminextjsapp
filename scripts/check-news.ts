import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function checkNews() {
  try {
    const count = await prisma.news.count();
    console.log(`Total news in database: ${count}`);

    const news = await prisma.news.findMany({
      where: {
        is_visible: true,
        is_deleted: false,
      },
      orderBy: {
        published_date: 'desc',
      },
      take: 6,
      select: {
        id: true,
        title_en: true,
        title_ar: true,
        published_date: true,
        is_visible: true,
      },
    });

    console.log(`\nVisible news items (${news.length}):`);
    news.forEach((item, i) => {
      console.log(`${i + 1}. ${item.title_en || item.title_ar} - ${new Date(item.published_date).toLocaleDateString()}`);
    });
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkNews();
