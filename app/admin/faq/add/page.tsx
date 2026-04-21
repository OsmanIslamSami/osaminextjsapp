'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import FAQForm from '@/lib/components/faq/FAQForm';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import type { FAQFormData } from '@/lib/types';
import { logger } from '@/lib/utils/logger';

export default function AddFAQPage() {
  const router = useRouter();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
    }
  }, [userLoading, user, isAdmin, router]);

  const handleSubmit = async (data: FAQFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch('/api/faq', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create FAQ');
      }

      showSuccess('FAQ created successfully');
      router.push('/admin/faq');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to create FAQ');
      logger.error('Create FAQ error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('faq.addFAQ')}
      </h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <FAQForm 
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
