import { auth, currentUser } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';

/**
 * Ensures that the authenticated Clerk user is synced to the database.
 * Creates a new user record if one doesn't exist, or updates existing record.
 * 
 * @returns The synced user record from the database
 * @throws Error if user is not authenticated
 */
export async function ensureUserSynced() {
  const { userId } = await auth();
  const clerkUser = await currentUser();

  if (!userId || !clerkUser) {
    throw new Error('User not authenticated');
  }

  // Check if user already exists in database
  let dbUser = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
  });

  if (!dbUser) {
    // Create new user record
    dbUser = await prisma.user.create({
      data: {
        clerk_user_id: userId,
        email: clerkUser.emailAddresses[0]?.emailAddress || '',
        name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || null,
        role: 'user', // Default role
        is_active: true,
      },
    });
  } else {
    // Update email and name if changed in Clerk
    const newEmail = clerkUser.emailAddresses[0]?.emailAddress || dbUser.email;
    const newName = `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || dbUser.name;

    if (newEmail !== dbUser.email || newName !== dbUser.name) {
      dbUser = await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          email: newEmail,
          name: newName || null,
        },
      });
    }
  }

  return dbUser;
}
