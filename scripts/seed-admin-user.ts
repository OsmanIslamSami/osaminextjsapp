import 'dotenv/config';
import { PrismaClient } from '@/lib/generated/prisma/client';
import { PrismaNeon } from '@prisma/adapter-neon';

const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Starting seed for admin user...');

  // Note: This script requires a Clerk user ID
  // Replace 'user_REPLACE_WITH_CLERK_ID' with an actual Clerk user ID
  const clerkUserId = process.env.ADMIN_CLERK_USER_ID || 'user_REPLACE_ME';
  const email = process.env.ADMIN_EMAIL || 'admin@example.com';
  const name = process.env.ADMIN_NAME || 'Admin User';

  if (clerkUserId === 'user_REPLACE_ME') {
    console.warn('⚠️  Warning: ADMIN_CLERK_USER_ID not set in environment variables');
    console.warn('Please set ADMIN_CLERK_USER_ID, ADMIN_EMAIL, and ADMIN_NAME to create an admin user');
    console.warn('Example: ADMIN_CLERK_USER_ID=user_2abc... npm run seed-admin');
    return;
  }

  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { clerk_user_id: clerkUserId },
  });

  if (existingUser) {
    console.log(`User already exists: ${existingUser.email}`);
    
    // Update to admin if not already
    if (existingUser.role !== 'admin') {
      await prisma.user.update({
        where: { id: existingUser.id },
        data: { role: 'admin' },
      });
      console.log(`✅ Updated ${existingUser.email} to admin role`);
    } else {
      console.log(`✅ User ${existingUser.email} is already an admin`);
    }
  } else {
    // Create new admin user
    const adminUser = await prisma.user.create({
      data: {
        clerk_user_id: clerkUserId,
        email,
        name,
        role: 'admin',
        is_active: true,
      },
    });

    console.log(`✅ Created admin user: ${adminUser.email}`);
  }

  console.log('✅ Admin user seed completed');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding admin user:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
