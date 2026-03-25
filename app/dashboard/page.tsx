'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DonutChart from '@/lib/components/dashboard/DonutChart';
import MetricCard from '@/lib/components/dashboard/MetricCard';
import RecentActivity from '@/lib/components/dashboard/RecentActivity';
import LatestClients from '@/lib/components/dashboard/LatestClients';

interface DashboardMetrics {
  clientCount: number;
  orderCount: number;
  thisMonthClients: number;
  lastMonthClients: number;
  thisMonthOrders: number;
  lastMonthOrders: number;
  statusBreakdown: { status: string; count: number }[];
  recentClients: any[];
  recentOrders: any[];
  latestClients: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMetrics();
  }, []);

  const fetchMetrics = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/metrics');
      
      if (response.status === 401) {
        router.push('/login');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to fetch metrics');
      }

      const data = await response.json();
      setMetrics(data);
    } catch (err) {
      console.error('Error fetching metrics:', err);
      setError('Failed to load dashboard metrics. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-800">{error}</p>
          <button
            onClick={fetchMetrics}
            className="mt-4 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!metrics) {
    return null;
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <MetricCard
          label="Total Clients"
          value={metrics.clientCount}
          thisMonth={metrics.thisMonthClients}
          lastMonth={metrics.lastMonthClients}
        />
        <MetricCard
          label="Total Orders"
          value={metrics.orderCount}
          thisMonth={metrics.thisMonthOrders}
          lastMonth={metrics.lastMonthOrders}
        />
      </div>

      {/* Order Status Donut Chart */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm mb-8">
        <h2 className="text-xl font-semibold mb-4">Order Status Breakdown</h2>
        <DonutChart data={metrics.statusBreakdown} />
      </div>

      {/* Recent Activity */}
      <div className="mb-8">
        <RecentActivity
          recentClients={metrics.recentClients}
          recentOrders={metrics.recentOrders}
        />
      </div>

      {/* Latest Clients */}
      <LatestClients clients={metrics.latestClients} />
    </div>
  );
}
