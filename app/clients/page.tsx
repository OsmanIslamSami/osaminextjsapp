'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import ClientSearchBar from '@/lib/components/clients/ClientSearchBar';
import ClientGrid from '@/lib/components/clients/ClientGrid';
import SortableColumnHeader from '@/lib/components/SortableColumnHeader';
import ExportButton from '@/lib/components/ExportButton';

interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

export default function ClientsList() {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [sortField, setSortField] = useState<'created_at' | 'updated_at'>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    fetchClients();
  }, []);

  useEffect(() => {
    // Filter clients based on search term
    if (search.trim() === '') {
      setFilteredClients(clients);
    } else {
      const searchLower = search.toLowerCase();
      const filtered = clients.filter(
        (client) =>
          client.name.toLowerCase().includes(searchLower) ||
          client.email.toLowerCase().includes(searchLower) ||
          (client.mobile && client.mobile.toLowerCase().includes(searchLower))
      );
      setFilteredClients(filtered);
    }
  }, [search, clients]);

  useEffect(() => {
    // Sort filtered clients
    const sorted = [...filteredClients].sort((a, b) => {
      const aValue = new Date(a[sortField]).getTime();
      const bValue = new Date(b[sortField]).getTime();
      return sortDirection === 'asc' ? aValue - bValue : bValue - aValue;
    });
    setFilteredClients(sorted);
  }, [sortField, sortDirection]);

  const fetchClients = async () => {
    setLoading(true);
    try {
      // Fetch all clients without pagination for client-side filtering and sorting
      const response = await fetch(`/api/clients?limit=1000`);
      const data = await response.json();
      setClients(data.clients);
      setFilteredClients(data.clients);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this client?')) return;

    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        fetchClients();
      }
    } catch (error) {
      console.error('Error deleting client:', error);
    }
  };

  const handleSort = (field: 'created_at' | 'updated_at') => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Clients Management</h1>
        <div className="flex gap-3">
          <ExportButton searchQuery={search} />
          <Link 
            href="/clients/add" 
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Add Client
          </Link>
        </div>
      </div>

      <ClientSearchBar value={search} onChange={setSearch} />

      <div className="flex gap-4 mb-6 items-center">
        <span className="text-sm text-gray-600">Sort by:</span>
        <SortableColumnHeader
          field="created_at"
          label="Added Date"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
        <SortableColumnHeader
          field="updated_at"
          label="Updated Date"
          sortField={sortField}
          sortDirection={sortDirection}
          onSort={handleSort}
        />
      </div>

      {loading ? (
        <div className="text-center py-12">
          <p className="text-gray-600">Loading...</p>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600">
            {search ? 'No clients match your search.' : 'No clients found.'}{' '}
            {!search && <Link href="/clients/add" className="text-blue-500 hover:underline">Add one?</Link>}
          </p>
        </div>
      ) : (
        <>
          <div className="mb-4 text-sm text-gray-600">
            Showing {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'}
            {search && ` matching "${search}"`}
          </div>
          <ClientGrid clients={filteredClients} onDelete={fetchClients} />
        </>
      )}
    </div>
  );
}
