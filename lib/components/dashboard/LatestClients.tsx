// Latest clients section displaying last 10 clients
interface LatestClient {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  created_at: string;
}

export default function LatestClients({ clients }: { clients: LatestClient[] }) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  if (clients.length === 0) {
    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
        <h3 className="text-lg font-semibold mb-4">Latest Clients</h3>
        <p className="text-gray-500 text-sm">No clients found</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 md:p-6 shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Latest Clients</h3>
      
      {/* Desktop table view */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Name</th>
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Email</th>
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Mobile</th>
              <th className="text-left py-2 px-2 text-sm font-medium text-gray-700">Added</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client) => (
              <tr key={client.id} className="border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                <td className="py-3 px-2 text-sm font-medium text-gray-900">{client.name}</td>
                <td className="py-3 px-2 text-sm text-gray-600">{client.email}</td>
                <td className="py-3 px-2 text-sm text-gray-600">{client.mobile || '-'}</td>
                <td className="py-3 px-2 text-sm text-gray-500">{formatDate(client.created_at)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Mobile card view */}
      <div className="md:hidden space-y-3">
        {clients.map((client) => (
          <div key={client.id} className="border border-gray-200 rounded-lg p-3 bg-gray-50">
            <div className="font-medium text-gray-900 mb-1">{client.name}</div>
            <div className="text-sm text-gray-600 mb-1">{client.email}</div>
            <div className="text-sm text-gray-600 mb-1">{client.mobile || 'No mobile'}</div>
            <div className="text-xs text-gray-500">{formatDate(client.created_at)}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
