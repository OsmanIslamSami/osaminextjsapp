import { auth } from '@clerk/nextjs/server';
import { prisma } from '@/lib/db';
import { User } from '@/lib/types';

/**
 * Gets the current authenticated user from the database.
 * Does not create a new user if one doesn't exist - use ensureUserSynced for that.
 * 
 * @returns The user record from the database, or null if not found or not authenticated
 */
export async function getCurrentUser(): Promise<User | null> {
  const { userId } = await auth();

  if (!userId) {
    return null;
  }

  const dbUser = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
  });

  if (!dbUser) {
    return null;
  }

  // Convert Prisma model to User type
  return {
    id: dbUser.id,
    clerk_user_id: dbUser.clerk_user_id,
    email: dbUser.email,
    name: dbUser.name,
    role: dbUser.role as 'admin' | 'user',
    is_active: dbUser.is_active,
    created_at: dbUser.created_at.toISOString(),
    updated_at: dbUser.updated_at.toISOString(),
  };
}

/**
 * Checks if the current user has permission to delete clients.
 * Only admin users can delete clients.
 * 
 * @returns true if the user is an admin and active, false otherwise
 */
export async function canDeleteClients(): Promise<boolean> {
  const user = await getCurrentUser();

  if (!user) {
    return false;
  }

  return user.role === 'admin' && user.is_active;
}

/**
 * Generic permission checker based on permission strings.
 * Permission format: "resource:action" (e.g., "news:write", "slider:delete")
 * 
 * @param userId - The Clerk user ID
 * @param permission - The permission string to check
 * @returns true if the user has the permission, false otherwise
 */
export async function hasPermission(
  userId: string,
  permission: string
): Promise<boolean> {
  const dbUser = await prisma.user.findUnique({
    where: { clerk_user_id: userId },
  });

  if (!dbUser || !dbUser.is_active) {
    return false;
  }

  // Admin users have all permissions
  if (dbUser.role === 'admin') {
    return true;
  }

  // Parse permission string
  const [resource, action] = permission.split(':');

  // For now, only admin users have write/delete permissions
  // Regular users only have read permissions
  if (action === 'read') {
    return true;
  }

  return false;
}
