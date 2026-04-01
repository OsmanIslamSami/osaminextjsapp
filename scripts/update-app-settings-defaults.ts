import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    console.log('Updating app_settings with default values...');
    
    // Get the first settings record
    const settings = await prisma.app_settings.findFirst();

    if (!settings) {
      console.log('No app_settings found, creating default...');
      await prisma.app_settings.create({
        data: {
          arabic_font: 'Cairo',
          english_font: 'Inter',
          theme: 'palette-1', // Dark & Teal palette as default
          site_title_en: 'Next App',
          site_title_ar: 'تطبيق نكست',
          site_description_en: 'A modern web application',
          site_description_ar: 'تطبيق ويب حديث',
          site_logo_storage_type: 'upload',
          og_image_storage_type: 'upload',
        }
      });
      console.log('Default app_settings created successfully');
    } else {
      console.log('App_settings already exists, no update needed');
    }
  } catch (error) {
    console.error('Error updating app_settings:', error);
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
