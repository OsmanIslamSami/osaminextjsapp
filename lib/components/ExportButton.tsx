'use client';

import { useState } from 'react';

interface ExportButtonProps {
  searchQuery?: string;
}

export default function ExportButton({ searchQuery = '' }: ExportButtonProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    try {
      setLoading(true);
      setError(null);

      const params = new URLSearchParams();
      if (searchQuery) {
        params.set('search', searchQuery);
      }

      const response = await fetch(`/api/clients/export?${params}`);
      
      if (!response.ok) {
        throw new Error('Export failed');
      }

      // Create blob from response
      const blob = await response.blob();
      
      // Create download link
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `clients_export_${new Date().toISOString().split('T')[0]}.xlsx`;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error('Export error:', err);
      setError('Failed to export clients. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={loading}
        className="flex items-center justify-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border-2 border-green-200 dark:border-green-900/30 hover:border-green-400 dark:hover:border-green-500 text-green-600 dark:text-green-400 hover:text-green-700 dark:hover:text-green-300 bg-transparent disabled:opacity-50 disabled:cursor-not-allowed w-full sm:w-auto"
      >
        {loading ? (
          <>
            <span className="animate-spin">⏳</span>
            <span>Exporting...</span>
          </>
        ) : (
          <>
            <span>Export to Excel</span>
          </>
        )}
      </button>
      {error && (
        <p className="text-red-600 text-sm mt-2">{error}</p>
      )}
    </div>
  );
}
