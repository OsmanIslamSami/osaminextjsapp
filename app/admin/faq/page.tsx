'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { useToast } from '@/lib/components/ToastContainer';
import Link from 'next/link';
import FAQList from '@/lib/components/faq/FAQList';
import LoadingSpinner from '@/lib/components/ui/LoadingSpinner';

interface FAQ {
  id: string;
  question_en: string;
  question_ar: string;
  answer_en: string;
  answer_ar: string;
  is_favorite: boolean;
  created_at: string;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function AdminFAQPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, isAdmin, isLoading: userLoading } = useCurrentUser();
  const { t } = useTranslation();
  const { showError } = useToast();
  
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: parseInt(searchParams.get('page') || '1'),
    limit: parseInt(searchParams.get('limit') || '20'),
    total: 0,
    totalPages: 0,
  });

  useEffect(() => {
    if (userLoading) return;
    
    if (!user || !isAdmin) {
      router.push('/login');
      return;
    }

    loadFAQs();
  }, [userLoading, user, isAdmin, router, searchParams]);

  async function loadFAQs() {
    try {
      setLoading(true);
      const page = searchParams.get('page') || '1';
      const limit = searchParams.get('limit') || '20';
      
      const response = await fetch(`/api/faq?page=${page}&limit=${limit}`);
      
      if (!response.ok) {
        throw new Error('Failed to load FAQs');
      }

      const result = await response.json();
      setFaqs(result.data);
      setPagination({
        page: result.currentPage,
        limit: result.limit,
        total: result.totalCount,
        totalPages: result.totalPages,
      });
    } catch (error) {
      showError('Failed to load FAQs');
      console.error('Load FAQs error:', error);
    } finally {
      setLoading(false);
    }
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('page', newPage.toString());
    router.push(`/admin/faq?${params.toString()}`);
  };

  const handleLimitChange = (newLimit: number) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('limit', newLimit.toString());
    params.set('page', '1'); // Reset to first page
    router.push(`/admin/faq?${params.toString()}`);
  };

  if (userLoading || loading) {
    return <LoadingSpinner className="min-h-screen" size="lg" />;
  }

  if (!user || !isAdmin) {
    return null;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          {t('faq.title')}
        </h1>
        <Link
          href="/admin/faq/add"
          className="px-6 py-3 bg-gray-900 dark:bg-white text-white dark:text-gray-900 rounded-full font-medium hover:bg-gray-800 dark:hover:bg-gray-100 transition-all"
        >
          {t('faq.addFAQ')}
        </Link>
      </div>

      <FAQList 
        faqs={faqs} 
        pagination={pagination}
        onPageChange={handlePageChange}
        onLimitChange={handleLimitChange}
        showPagination={true}
      />
    </div>
  );
}
