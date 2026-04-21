'use client';

import { useState } from 'react';
import Link from 'next/link';
import StatusBadge from './StatusBadge';
import ConfirmDialog from '@/lib/components/ConfirmDialog';
import { ClientStatus } from '@/lib/generated/prisma/enums';
import { EyeIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/lib/components/ToastContainer';
import { logger } from '@/lib/utils/logger';

interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  status: ClientStatus;
}

interface ClientTableRowProps {
  client: Client;
  index: number;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export default function ClientTableRow({ client, index, onDelete, isAdmin = false }: ClientTableRowProps) {
  const { showError } = useToast();
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDeleteClick = () => {
    setShowConfirm(true);
  };

  const handleConfirmDelete = async () => {
    setDeleting(true);
    try {
      const response = await fetch(`/api/clients/${client.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setShowConfirm(false);
        onDelete?.();
      } else {
        const data = await response.json();
        showError(data.error || 'Failed to delete client');
      }
    } catch (error) {
      logger.error('Error deleting client:', error);
      showError('An error occurred while deleting the client');
    } finally {
      setDeleting(false);
    }
  };

  const handleCancelDelete = () => {
    setShowConfirm(false);
  };

  return (
    <>
      <tr className={`transition-colors hover:bg-gray-50 dark:hover:bg-zinc-900/50 ${
        index % 2 === 0 ? 'bg-white dark:bg-black' : 'bg-gray-50 dark:bg-zinc-900/30'
      }`}>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-zinc-100">
          {client.name}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
          {client.email}
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-zinc-400">
          {client.mobile || '-'}
        </td>
        <td className="px-6 py-4 whitespace-nowrap">
          <StatusBadge status={client.status} />
        </td>
        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
          <div className="flex items-center gap-2">
            <Link
              href={`/clients/${client.id}/view`}
              aria-label="View client details"
              className="text-gray-600 hover:text-blue-600 dark:text-zinc-400 dark:hover:text-blue-400 transition-colors"
            >
              <EyeIcon className="w-5 h-5" />
            </Link>
            <Link
              href={`/clients/${client.id}/edit`}
              aria-label="Edit client information"
              className="text-gray-600 hover:text-green-600 dark:text-zinc-400 dark:hover:text-green-400 transition-colors"
            >
              <PencilIcon className="w-5 h-5" />
            </Link>
            {isAdmin && (
              <button
                onClick={handleDeleteClick}
                aria-label="Delete client"
                className="text-gray-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400 transition-colors"
              >
                <TrashIcon className="w-5 h-5" />
              </button>
            )}
          </div>
        </td>
      </tr>

      <ConfirmDialog
        isOpen={showConfirm}
        title="Delete Client"
        message={
          <>
            Are you sure you want to delete <strong>{client.name}</strong>?
            <br />
            This action cannot be undone.
          </>
        }
        onConfirm={handleConfirmDelete}
        onCancel={handleCancelDelete}
        confirmText={deleting ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />
    </>
  );
}
