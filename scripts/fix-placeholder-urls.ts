/**
 * Fix Placeholder URLs Script
 * 
 * Updates all via.placeholder.com URLs to placehold.co
 * Run with: npx tsx scripts/fix-placeholder-urls.ts
 */

import 'dotenv/config';
import { prisma } from '../lib/db';

async function fixPlaceholderUrls() {
  console.log('🔧 Fixing placeholder URLs...\n');

  try {
    // Update photos using raw SQL
    const photosUpdated = await prisma.$executeRaw`
      UPDATE photos 
      SET image_url = REPLACE(image_url, 'https://via.placeholder.com/', 'https://placehold.co/')
      WHERE image_url LIKE '%via.placeholder.com%'
    `;
    
    console.log(`✅ Updated ${photosUpdated} photo URLs`);

    // Update partners using raw SQL
    const partnersUpdated = await prisma.$executeRaw`
      UPDATE partners 
      SET image_url = REPLACE(image_url, 'https://via.placeholder.com/', 'https://placehold.co/')
      WHERE image_url LIKE '%via.placeholder.com%'
    `;

    console.log(`✅ Updated ${partnersUpdated} partner URLs`);

    console.log('\n✨ All placeholder URLs fixed successfully!');
  } catch (error) {
    console.error('❌ Error fixing placeholder URLs:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPlaceholderUrls()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
