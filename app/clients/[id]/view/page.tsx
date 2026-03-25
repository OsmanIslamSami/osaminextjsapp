'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import StatusBadge from '@/lib/components/clients/StatusBadge';
import { ClientStatus } from '@/lib/generated/prisma/enums';

interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string;
  address: string;
  status: ClientStatus;
  created_at: string;
}

interface Order {
  id: number;
  order_date: string;
  description: string;
  address: string;
  mobile: string;
  created_at: string;
}

export default function ViewClient() {
  const params = useParams();
  const id = params.id as string;

  const [client, setClient] = useState<Client | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showAddOrder, setShowAddOrder] = useState(false);
  const [orderForm, setOrderForm] = useState({
    description: '',
    address: '',
    mobile: '',
  });
  const [submittingOrder, setSubmittingOrder] = useState(false);

  useEffect(() => {
    fetchClient();
    fetchOrders();
  }, [id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${id}`);
      if (!response.ok) {
        setError('Client not found');
        return;
      }
      const data = await response.json();
      setClient(data);
    } catch (err) {
      console.error('Error fetching client:', err);
      setError('Failed to load client');
    } finally {
      setLoading(false);
    }
  };

  const fetchOrders = async () => {
    try {
      const params = new URLSearchParams({ clientId: id });
      const response = await fetch(`/api/orders?${params}`);
      const data = await response.json();
      setOrders(data.orders);
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const handleAddOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittingOrder(true);

    try {
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          clientId: parseInt(id),
          ...orderForm,
        }),
      });

      if (!response.ok) {
        alert('Failed to create order');
        return;
      }

      setOrderForm({ description: '', address: '', mobile: '' });
      setShowAddOrder(false);
      fetchOrders();
    } catch (err) {
      console.error('Error creating order:', err);
      alert('An error occurred');
    } finally {
      setSubmittingOrder(false);
    }
  };

  if (loading) return <div className="container mx-auto py-8">Loading...</div>;
  if (!client) return <div className="container mx-auto py-8 text-red-700">{error || 'Client not found'}</div>;

  return (
    <div className="container mx-auto py-8">
      <div className="mb-6 flex justify-between items-center">
        <h1 className="text-3xl font-bold">Client Details</h1>
        <div className="flex gap-2">
          <Link href="/clients" className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600">
            Back to List
          </Link>
          <Link href={`/clients/${id}/edit`} className="bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600">
            Edit
          </Link>
        </div>
      </div>

      {/* Client Information */}
      <div className="bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-800 rounded-lg p-6 mb-8">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Name</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{client.name}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Email</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{client.email}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Mobile</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{client.mobile}</p>
          </div>
          <div>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Status</p>
            <div className="mt-1">
              <StatusBadge status={client.status} />
            </div>
          </div>
          <div>
            <p className="text-gray-600 dark:text-zinc-400 text-sm">ID</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{client.id}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Address</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{client.address}</p>
          </div>
          <div className="col-span-2">
            <p className="text-gray-600 dark:text-zinc-400 text-sm">Member Since</p>
            <p className="text-lg font-semibold dark:text-zinc-100">{new Date(client.created_at).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Orders Section */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">Order History</h2>
          <button
            onClick={() => setShowAddOrder(!showAddOrder)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            {showAddOrder ? 'Cancel' : 'Add Order'}
          </button>
        </div>

        {/* Add Order Form */}
        {showAddOrder && (
          <form onSubmit={handleAddOrder} className="bg-gray-100 border border-gray-300 rounded-lg p-4 mb-6">
            <div className="mb-4">
              <label htmlFor="description" className="block text-sm font-medium mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={orderForm.description}
                onChange={(e) => setOrderForm({ ...orderForm, description: e.target.value })}
                required
                rows={3}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="order-address" className="block text-sm font-medium mb-1">
                Address
              </label>
              <textarea
                id="order-address"
                value={orderForm.address}
                onChange={(e) => setOrderForm({ ...orderForm, address: e.target.value })}
                required
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="mb-4">
              <label htmlFor="order-mobile" className="block text-sm font-medium mb-1">
                Mobile
              </label>
              <input
                type="tel"
                id="order-mobile"
                value={orderForm.mobile}
                onChange={(e) => setOrderForm({ ...orderForm, mobile: e.target.value })}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <button
              type="submit"
              disabled={submittingOrder}
              className="bg-green-500 text-white px-6 py-2 rounded hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submittingOrder ? 'Creating...' : 'Create Order'}
            </button>
          </form>
        )}

        {/* Orders Table */}
        {orders.length === 0 ? (
          <p className="text-gray-600">No orders found for this client.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-300">
              <thead className="bg-gray-200">
                <tr>
                  <th className="border border-gray-300 px-4 py-2 text-left">Order ID</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Order Date</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Description</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Address</th>
                  <th className="border border-gray-300 px-4 py-2 text-left">Mobile</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-gray-100">
                    <td className="border border-gray-300 px-4 py-2">{order.id}</td>
                    <td className="border border-gray-300 px-4 py-2">
                      {new Date(order.order_date).toLocaleDateString()}
                    </td>
                    <td className="border border-gray-300 px-4 py-2">{order.description}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.address}</td>
                    <td className="border border-gray-300 px-4 py-2">{order.mobile}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
