import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('🔗 Seeding social media links...');

  const socialMediaLinks = [
    {
      platform: 'Facebook',
      url: 'https://facebook.com/example',
      icon_path: '/icons/facebook.svg',
      display_order: 1,
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/example',
      icon_path: '/icons/twitter.svg',
      display_order: 2,
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/example',
      icon_path: '/icons/instagram.svg',
      display_order: 3,
    },
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/company/example',
      icon_path: '/icons/linkedin.svg',
      display_order: 4,
    },
    {
      platform: 'YouTube',
      url: 'https://youtube.com/@example',
      icon_path: '/icons/youtube.svg',
      display_order: 5,
    },
  ];

  for (const link of socialMediaLinks) {
    // Check if link already exists
    const existing = await prisma.socialMediaLink.findFirst({
      where: {
        platform: link.platform,
        is_deleted: false,
      },
    });

    if (existing) {
      console.log(`⊘ ${link.platform} already exists, skipping`);
    } else {
      await prisma.socialMediaLink.create({
        data: link,
      });
      console.log(`✓ Created ${link.platform} link`);
    }
  }

  console.log('');
  console.log('✅ Social media links seed completed!');
  console.log('📝 Note: Update the URLs in the admin panel at /admin/social');
  console.log('   Current URLs are placeholders (https://example.com)');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding social media links:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
