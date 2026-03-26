'use client';
import { useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';

/**
 * Component that ensures Clerk users are synced to the database.
 * Should be rendered at the root level of the app.
 */
export function UserSyncHandler() {
  const { isSignedIn, isLoaded } = useAuth();

  useEffect(() => {
    if (isLoaded && isSignedIn) {
      // Call the sync API endpoint
      fetch('/api/users/sync', {
        method: 'POST',
      }).catch(err => {
        console.error('Failed to sync user:', err);
      });
    }
  }, [isLoaded, isSignedIn]);

  return null; // This component doesn't render anything
}
