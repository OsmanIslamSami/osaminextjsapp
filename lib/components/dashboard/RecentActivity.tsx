// Recent activity lists for clients and orders
interface RecentClient {
  id: number;
  name: string;
  email: string;
  created_at: string;
  created_by: string;
}

interface RecentOrder {
  id: number;
  description: string;
  client_name: string;
  status: string;
  created_at: string;
  created_by: string;
}

interface RecentActivityProps {
  recentClients: RecentClient[];
  recentOrders: RecentOrder[];
}

export default function RecentActivity({ recentClients, recentOrders }: RecentActivityProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Recent Clients */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Clients</h3>
        {recentClients.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent clients</p>
        ) : (
          <div className="space-y-3">
            {recentClients.map((client) => (
              <div key={client.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                <div className="font-medium text-gray-900">{client.name}</div>
                <div className="text-sm text-gray-600">{client.email}</div>
                <div className="text-xs text-gray-500 mt-1">
                  Added {formatDate(client.created_at)} by {client.created_by}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Recent Orders */}
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Recent Orders</h3>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">No recent orders</p>
        ) : (
          <div className="space-y-3">
            {recentOrders.map((order) => (
              <div key={order.id} className="border-b border-gray-100 last:border-b-0 pb-3 last:pb-0">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">{order.description}</div>
                    <div className="text-sm text-gray-600">{order.client_name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      {formatDate(order.created_at)} by {order.created_by}
                    </div>
                  </div>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
