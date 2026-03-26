'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';

export default function AdminPage() {
  const [stats, setStats] = useState({
    totalUsers: 0,
    adminUsers: 0,
    activeUsers: 0,
    socialLinks: 0,
    sliderSlides: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // Fetch users
        const usersRes = await fetch('/api/users');
        if (usersRes.ok) {
          const users: User[] = await usersRes.json();
          setStats(prev => ({
            ...prev,
            totalUsers: users.length,
            adminUsers: users.filter(u => u.role === 'admin').length,
            activeUsers: users.filter(u => u.is_active).length,
          }));
        }

        // Fetch social links
        const socialRes = await fetch('/api/social-media');
        if (socialRes.ok) {
          const links = await socialRes.json();
          setStats(prev => ({
            ...prev,
            socialLinks: links.length,
          }));
        }

        // Fetch slider content
        const sliderRes = await fetch('/api/slider');
        if (sliderRes.ok) {
          const data = await sliderRes.json();
          setStats(prev => ({
            ...prev,
            sliderSlides: data.slides?.length || 0,
          }));
        }
      } catch (error) {
        console.error('Error fetching admin stats:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Total Users */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">
            Total Users
          </div>
          <div className="text-3xl font-bold text-gray-900 dark:text-zinc-100">
            {stats.totalUsers}
          </div>
        </div>

        {/* Admin Users */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">
            Administrators
          </div>
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
            {stats.adminUsers}
          </div>
        </div>

        {/* Slider Slides */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">
            Slider Slides
          </div>
          <div className="text-3xl font-bold text-orange-600 dark:text-orange-400">
            {stats.sliderSlides}
          </div>
        </div>

        {/* Social Links */}
        <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
          <div className="text-sm font-medium text-gray-600 dark:text-zinc-400 mb-1">
            Social Media Links
          </div>
          <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
            {stats.socialLinks}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 p-6">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-zinc-100 mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <a
            href="/admin/users"
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-zinc-100">
                Manage Users
              </div>
              <div className="text-sm text-gray-600 dark:text-zinc-400">
                View and edit user roles and permissions
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/admin/slider"
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-zinc-100">
                Manage Slider
              </div>
              <div className="text-sm text-gray-600 dark:text-zinc-400">
                Add and edit home page slider content
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/admin/social"
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-zinc-100">
                Social Media Links
              </div>
              <div className="text-sm text-gray-600 dark:text-zinc-400">
                Manage footer social media links
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>

          <a
            href="/clients"
            className="flex items-center justify-between p-4 bg-gray-50 dark:bg-zinc-800 rounded-lg hover:bg-gray-100 dark:hover:bg-zinc-700 transition-colors"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-zinc-100">
                Manage Clients
              </div>
              <div className="text-sm text-gray-600 dark:text-zinc-400">
                View and manage client database
              </div>
            </div>
            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>
      </div>

      {/* Info Notice */}
      <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-start gap-3">
          <svg className="w-5 h-5 text-green-600 dark:text-green-400 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
          </svg>
          <div>
            <h3 className="font-medium text-green-900 dark:text-green-100 mb-1">
              Admin Panel Ready
            </h3>
            <p className="text-sm text-green-800 dark:text-green-200">
              This admin panel provides complete management capabilities for users, slider content, and social media links. 
              All core features are now available including the home page slider management, bilingual support (English/Arabic with RTL), 
              mobile-responsive layouts, and smooth animations.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
