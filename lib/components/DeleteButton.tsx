'use client';

import { useState } from 'react';
import ConfirmDialog from './ConfirmDialog';

interface DeleteButtonProps {
  clientId: number;
  clientName: string;
  onDelete: () => void;
  isAdmin?: boolean;
}

export default function DeleteButton({ clientId, clientName, onDelete, isAdmin = false }: DeleteButtonProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Don't render if user is not admin
  if (!isAdmin) {
    return null;
  }

  const handleDelete = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(`/api/clients/${clientId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete client');
      }

      setShowDialog(false);
      onDelete();
    } catch (err) {
      console.error('Delete error:', err);
      setError('Failed to delete client. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowDialog(true)}
        disabled={loading}
        className="px-3 py-1.5 border-2 border-red-200 dark:border-red-900/30 hover:border-red-400 dark:hover:border-red-500 text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 rounded-full transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
        title="Delete client"
      >
        Delete
      </button>

      <ConfirmDialog
        isOpen={showDialog}
        title="Delete Client"
        message={
          <>
            Are you sure you want to delete <strong>{clientName}</strong>?
            <br />
            <br />
            This action will soft-delete the client and remove them from all lists.
          </>
        }
        onCancel={() => setShowDialog(false)}
        onConfirm={handleDelete}
        confirmText={loading ? 'Deleting...' : 'Delete'}
        cancelText="Cancel"
      />

      {error && (
        <p className="text-red-600 text-xs mt-1">{error}</p>
      )}
    </>
  );
}
