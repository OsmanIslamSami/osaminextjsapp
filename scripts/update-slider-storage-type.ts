import 'dotenv/config';
import { prisma } from '../lib/db';

async function updateExistingSlides() {
  try {
    console.log('\n=== Updating existing slider content with storage_type ===\n');
    
    // Update all slides that don't have a storage_type set
    const result = await prisma.sliderContent.updateMany({
      where: {
        OR: [
          { media_url: { contains: 'vercel-storage.com' } },
          { media_url: { contains: 'blob.vercel' } },
        ]
      },
      data: {
        storage_type: 'blob',
      },
    });

    console.log(`✓ Updated ${result.count} slide(s) to use 'blob' storage type`);

    // Update local file uploads
    const localResult = await prisma.sliderContent.updateMany({
      where: {
        AND: [
          { media_url: { startsWith: '/uploads/' } },
        ]
      },
      data: {
        storage_type: 'local',
      },
    });

    console.log(`✓ Updated ${localResult.count} slide(s) to use 'local' storage type`);

    // Show current state
    const allSlides = await prisma.sliderContent.findMany({
      select: {
        id: true,
        media_url: true,
        storage_type: true,
      },
    });

    console.log('\n=== Current slider content ===\n');
    allSlides.forEach((slide, index) => {
      console.log(`Slide #${index + 1}:`);
      console.log(`  ID: ${slide.id}`);
      console.log(`  Storage Type: ${slide.storage_type}`);
      console.log(`  URL: ${slide.media_url}`);
      console.log('');
    });

  } catch (error) {
    console.error('Error updating slides:', error);
  } finally {
    await prisma.$disconnect();
  }
}

updateExistingSlides();
