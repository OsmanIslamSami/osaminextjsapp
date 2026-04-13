'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import FAQForm from '@/lib/components/faq/FAQForm';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';
import type { FAQFormData } from '@/lib/types';

export default function EditFAQPage() {
  const router = useRouter();
  const params = useParams();
  const id = params.id as string;
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { showError, showSuccess } = useToast();
  
  const [faq, setFaq] = useState<FAQFormData | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    async function loadFAQ() {
      try {
        const response = await fetch(`/api/faq/${id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            showError('FAQ not found');
            router.push('/admin/faq');
            return;
          }
          throw new Error('Failed to load FAQ');
        }

        const data = await response.json();
        setFaq(data);
      } catch (error) {
        showError('Failed to load FAQ');
        console.error('Load FAQ error:', error);
      } finally {
        setLoading(false);
      }
    }

    loadFAQ();
  }, [userLoading, user, isAdmin, id, router, showError]);

  const handleSubmit = async (data: FAQFormData) => {
    setSubmitting(true);
    try {
      const response = await fetch(`/api/faq/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update FAQ');
      }

      showSuccess('FAQ updated successfully');
      router.push('/admin/faq');
    } catch (error) {
      showError(error instanceof Error ? error.message : 'Failed to update FAQ');
      console.error('Update FAQ error:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!faq) {
    return null;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
        {t('faq.editFAQ')}
      </h1>
      
      <div className="bg-white dark:bg-zinc-900 rounded-lg shadow-lg p-6">
        <FAQForm 
          initialData={faq}
          onSubmit={handleSubmit}
          isLoading={submitting}
        />
      </div>
    </div>
  );
}
