'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import MagazineForm from '@/lib/components/magazines/MagazineForm';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

export default function AddMagazinePage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t } = useTranslation();

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [userLoading, user, isAdmin, router]);

  if (userLoading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('magazines.addMagazine')}
      </h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <MagazineForm />
      </div>
    </div>
  );
}
