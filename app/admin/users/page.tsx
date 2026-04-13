'use client';
import { useEffect, useState } from 'react';
import { User } from '@/lib/types';
import { useToast } from '@/lib/components/ToastContainer';
import { useTranslation } from '@/lib/i18n/useTranslation';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const { showError, showSuccess } = useToast();
  const { t } = useTranslation();

  useEffect(() => {
    async function fetchUsers() {
      try {
        const response = await fetch('/api/users');
        if (response.ok) {
          const data = await response.json();
          setUsers(data);
        }
      } catch (error) {
        console.error('Error fetching users:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: 'admin' | 'user') => {
    try {
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        showSuccess(t('admin.users.messages.roleUpdated'));
        // Refresh users list
        const updatedResponse = await fetch('/api/users');
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setUsers(data);
        }
      } else {
        const error = await response.json();
        showError(error.error || t('admin.users.messages.roleUpdateFailed'));
      }
    } catch (error) {
      console.error('Error updating role:', error);
      showError(t('admin.users.messages.roleUpdateFailed'));
    }
  };

  const handleToggleActive = async (userId: string, isActive: boolean) => {
    try {
      const endpoint = isActive ? 'deactivate' : 'activate';
      const response = await fetch(`/api/users/${userId}/${endpoint}`, {
        method: 'PUT',
      });

      if (response.ok) {
        showSuccess(isActive ? t('admin.users.messages.userDeactivated') : t('admin.users.messages.userActivated'));
        // Refresh users list
        const updatedResponse = await fetch('/api/users');
        if (updatedResponse.ok) {
          const data = await updatedResponse.json();
          setUsers(data);
        }
      } else {
        const error = await response.json();
        showError(error.error || t('admin.users.messages.statusUpdateFailed'));
      }
    } catch (error) {
      console.error(`Error ${isActive ? 'deactivating' : 'activating'} user:`, error);
      showError(t('admin.users.messages.statusUpdateFailed'));
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-zinc-100"></div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-zinc-100 mb-2">
          {t('admin.users.title')}
        </h1>
        <p className="text-gray-600 dark:text-zinc-400">
          {t('admin.users.subtitle')}
        </p>
      </div>

      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-gray-200 dark:border-zinc-800 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-zinc-800">
          <thead className="bg-gray-50 dark:bg-zinc-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.users.tableHeaders.user')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.users.tableHeaders.email')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.users.tableHeaders.role')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.users.tableHeaders.status')}
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-zinc-400 uppercase tracking-wider">
                {t('admin.users.tableHeaders.actions')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white dark:bg-zinc-900 divide-y divide-gray-200 dark:divide-zinc-800">
            {users.map((user) => (
              <tr key={user.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900 dark:text-zinc-100">
                    {user.name || 'No name'}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500 dark:text-zinc-400">
                    {user.email}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <select
                    value={user.role}
                    onChange={(e) => handleRoleChange(user.id, e.target.value as 'admin' | 'user')}
                    className="text-sm border border-gray-300 dark:border-zinc-700 rounded px-2 py-1 bg-white dark:bg-zinc-800 text-gray-900 dark:text-zinc-100"
                  >
                    <option value="user">{t('admin.users.roles.user')}</option>
                    <option value="admin">{t('admin.users.roles.admin')}</option>
                  </select>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                    user.is_active
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                      : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                  }`}>
                    {user.is_active ? t('admin.users.statuses.active') : t('admin.users.statuses.inactive')}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <button
                    onClick={() => handleToggleActive(user.id, user.is_active)}
                    className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                  >
                    {user.is_active ? t('admin.users.actions.deactivate') : t('admin.users.actions.activate')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {users.length === 0 && (
        <div className="text-center py-12 text-gray-500 dark:text-zinc-400">
          No users found
        </div>
      )}
    </div>
  );
}
