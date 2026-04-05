'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import ClientSearchBar from '@/lib/components/clients/ClientSearchBar';
import ClientTable from '@/lib/components/clients/ClientTable';
import ClientTableRow from '@/lib/components/clients/ClientTableRow';
import ClientCard from '@/lib/components/clients/ClientCard';
import ExportButton from '@/lib/components/ExportButton';
import { ClientStatus } from '@/lib/generated/prisma/enums';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';
import { useTranslation } from '@/lib/i18n/useTranslation';

interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  status: ClientStatus;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export default function ClientsList() {
  const { t } = useTranslation();
  const [clients, setClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const { isAdmin } = useCurrentUser();
  
  const sentinelRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);

  // Fetch initial clients or search results
  const fetchClients = useCallback(async (searchQuery: string = '', reset: boolean = false) => {
    if (reset) {
      setLoading(true);
      setClients([]);
      setNextCursor(null);
      setHasMore(true);
    } else {
      setLoadingMore(true);
    }
    
    setError(null);

    try {
      const params = new URLSearchParams();
      params.set('limit', '50');
      if (searchQuery) params.set('search', searchQuery);
      if (!reset && nextCursor) params.set('cursor', nextCursor.toString());

      const response = await fetch(`/api/clients?${params.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch clients');
      
      const data = await response.json();
      
      if (reset) {
        setClients(data.clients);
      } else {
        setClients(prev => [...prev, ...data.clients]);
      }
      
      setHasMore(data.hasMore);
      setNextCursor(data.nextCursor);
    } catch (error) {
      console.error('Error fetching clients:', error);
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [nextCursor]);

  // Load more when sentinel is visible
  const loadMore = useCallback(() => {
    if (!loadingMore && !loading && hasMore && nextCursor) {
      fetchClients(search, false);
    }
  }, [loadingMore, loading, hasMore, nextCursor, search, fetchClients]);

  // Initial load
  useEffect(() => {
    fetchClients('', true);
  }, []);

  // Reset and search when search term changes
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchClients(search, true);
    }, 300); // Debounce search

    return () => clearTimeout(timer);
  }, [search]);

  // Intersection Observer for infinite scroll
  useEffect(() => {
    if (!sentinelRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1 }
    );

    observerRef.current.observe(sentinelRef.current);

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, [loadMore]);

  const handleRetry = () => {
    fetchClients(search, true);
  };

  const handleDelete = () => {
    // Refresh the current list after deletion
    fetchClients(search, true);
  };

  return (
    <div className="container mx-auto py-8 px-4 page-transition">
      <div className="mb-6 md:mb-8 md:flex md:justify-between md:items-center">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 md:mb-0">{t('clients.title')}</h1>
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-3">
          <ExportButton searchQuery={search} />
          <Link 
            href="/clients/add" 
            className="px-5 py-2 rounded-full bg-gray-900 dark:bg-white text-white dark:text-gray-900 hover:bg-gray-800 dark:hover:bg-gray-100 transition-all font-medium text-sm text-center"
          >
            {t('clients.addClient')}
          </Link>
        </div>
      </div>

      <ClientSearchBar value={search} onChange={setSearch} />

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-800 dark:text-red-200 mb-2">{error}</p>
          <button
            onClick={handleRetry}
            className="px-3 py-1.5 rounded-full text-sm font-medium border-2 border-red-200 dark:border-red-900/30 hover:border-red-400 dark:hover:border-red-500 text-red-600 dark:text-red-400 bg-transparent transition-all"
          >
            Retry
          </button>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-zinc-100"></div>
          <p className="text-gray-600 dark:text-zinc-400 mt-4">Loading clients...</p>
        </div>
      ) : clients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800">
          <p className="text-gray-600 dark:text-zinc-400">
            {search ? `No clients match "${search}".` : 'No clients found.'}{' '}
            {!search && <Link href="/clients/add" className="hover:underline" style={{ color: 'var(--color-primary)' }}>Add one?</Link>}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600 dark:text-zinc-400">
            Showing {clients.length} {clients.length === 1 ? 'client' : 'clients'}
            {search && ` matching "${search}"`}
          </div>
          
          {/* Desktop table view */}
          <div className="hidden md:block">
            <ClientTable>
              {clients.map((client, index) => (
                <ClientTableRow 
                  key={client.id} 
                  client={client} 
                  index={index}
                  onDelete={handleDelete}
                  isAdmin={isAdmin}
                />
              ))}
            </ClientTable>
          </div>
          
          {/* Mobile card view */}
          <div className="md:hidden grid grid-cols-1 gap-4">
            {clients.map((client) => (
              <ClientCard
                key={client.id}
                client={client}
                onDelete={handleDelete}
                isAdmin={isAdmin}
              />
            ))}
          </div>

          {/* Sentinel for infinite scroll */}
          <div ref={sentinelRef} className="h-4" />

          {/* Loading more indicator */}
          {loadingMore && (
            <div className="text-center py-8">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 dark:border-zinc-100"></div>
              <p className="text-gray-600 dark:text-zinc-400 mt-2 text-sm">Loading more...</p>
            </div>
          )}

          {/* End of results indicator */}
          {!hasMore && clients.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500 dark:text-zinc-500 text-sm">
                All clients loaded
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
