'use client';
import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { User } from '@/lib/types';

export function useCurrentUser() {
  const { isSignedIn, isLoaded } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    // Wait for Clerk auth to load
    if (!isLoaded) {
      return;
    }

    // If not signed in, set defaults and finish loading
    if (!isSignedIn) {
      setUser(null);
      setIsAdmin(false);
      setIsLoading(false);
      return;
    }

    // Only fetch user data if signed in
    async function fetchCurrentUser() {
      try {
        const response = await fetch('/api/users/me');
        
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setIsAdmin(userData.role === 'admin' && userData.is_active);
        } else {
          setUser(null);
          setIsAdmin(false);
        }
      } catch (error) {
        console.error('Error fetching current user:', error);
        setUser(null);
        setIsAdmin(false);
      } finally {
        setIsLoading(false);
      }
    }

    fetchCurrentUser();
  }, [isSignedIn, isLoaded]);

  return { user, isAdmin, isLoading };
}
