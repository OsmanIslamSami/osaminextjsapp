'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTranslation } from '@/lib/i18n/useTranslation';
import { logger } from '@/lib/utils/logger';

export default function AddClient() {
  const router = useRouter();
  const { t } = useTranslation();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    mobile: '',
    address: '',
    status: 'Active',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to create client');
        return;
      }

      router.push('/clients');
    } catch (err) {
      logger.error('Error creating client:', err);
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-4 md:py-8 px-4 page-transition">
      <h1 className="text-2xl md:text-3xl font-bold mb-6 md:mb-8">{t('clients.addNewClient')}</h1>

      <form onSubmit={handleSubmit} className="max-w-md">\n        {error && (
          <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
            {error}
          </div>
        )}

        <div className="mb-4">
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            {t('clients.name')}
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all min-h-[44px]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            {t('clients.email')}
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all min-h-[44px]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="mobile" className="block text-sm font-medium mb-1">
            {t('clients.mobile')}
          </label>
          <input
            type="tel"
            id="mobile"
            name="mobile"
            value={formData.mobile}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all min-h-[44px]"
          />
        </div>

        <div className="mb-4">
          <label htmlFor="status" className="block text-sm font-medium mb-1">
            {t('clients.status')}
          </label>
          <select
            id="status"
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-full bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all min-h-[44px] cursor-pointer"
          >
            <option value="Active">{t('clients.statusActive')}</option>
            <option value="Inactive">{t('clients.statusInactive')}</option>
          </select>
        </div>

        <div className="mb-6">
          <label htmlFor="address" className="block text-sm font-medium mb-1">
            {t('clients.address')}
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-3 border-2 border-gray-200 dark:border-zinc-700 rounded-2xl bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-gray-400 dark:focus:ring-zinc-500 focus:border-transparent transition-all resize-none"
          />
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <button
            type="submit"
            disabled={loading}
            className="w-full sm:w-auto px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
          >
            {loading ? t('buttons.creating') : t('buttons.createClient')}
          </button>
          <Link href="/clients" className="w-full sm:w-auto px-5 py-2 rounded-full border-2 border-gray-300 dark:border-zinc-600 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 bg-transparent text-center flex items-center justify-center transition-all font-medium text-sm">
            {t('buttons.cancel')}
          </Link>
        </div>
      </form>
    </div>
  );
}
