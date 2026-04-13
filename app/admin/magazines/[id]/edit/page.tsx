'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import MagazineForm from '@/lib/components/magazines/MagazineForm';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

export default function EditMagazinePage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { showError } = useToast();
  
  const [magazine, setMagazine] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    async function loadMagazine() {
      try {
        const response = await fetch(`/api/magazines/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            showError('Magazine not found');
            router.push('/admin/magazines');
            return;
          }
          throw new Error('Failed to load magazine');
        }

        const { data } = await response.json();
        setMagazine(data);
      } catch (error) {
        showError('Failed to load magazine');
        console.error('Load magazine error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadMagazine();
  }, [userLoading, user, isAdmin, id, router, showError]);

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!magazine) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('magazines.editMagazine')}
      </h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <MagazineForm magazine={magazine} />
      </div>
    </div>
  );
}
