'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

export function useCurrentUser() {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
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
  }, []);

  return { user, isAdmin, isLoading };
}
