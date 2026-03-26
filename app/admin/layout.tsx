'use client';
import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useCurrentUser } from '@/lib/hooks/useCurrentUser';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAdmin, isLoading } = useCurrentUser();
  const router = useRouter();
  const pathname = usePathname();
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!isLoading) {
      if (!isAdmin) {
        router.push('/dashboard');
      } else {
        setChecked(true);
      }
    }
  }, [isAdmin, isLoading, router]);

  if (isLoading || !checked) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          Admin Panel
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          Manage your application settings and content
        </p>
      </div>

      {/* Navigation Tabs */}
      <div className="border-b border-gray-200 dark:border-zinc-800 mb-8">
        <nav className="flex gap-4">
          <Link
            href="/admin"
            className={`px-4 py-2 border-b-2 transition-colors ${
              pathname === '/admin'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
          >
            Overview
          </Link>
          <Link
            href="/admin/slider"
            className={`px-4 py-2 border-b-2 transition-colors ${
              pathname === '/admin/slider'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
          >
            Slider
          </Link>
          <Link
            href="/admin/users"
            className={`px-4 py-2 border-b-2 transition-colors ${
              pathname === '/admin/users'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
          >
            Users
          </Link>
          <Link
            href="/admin/social"
            className={`px-4 py-2 border-b-2 transition-colors ${
              pathname === '/admin/social'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400 font-medium'
                : 'border-transparent text-gray-600 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-zinc-100 hover:border-gray-300 dark:hover:border-zinc-700'
            }`}
          >
            Social Media
          </Link>
        </nav>
      </div>

      {children}
    </div>
  );
}
