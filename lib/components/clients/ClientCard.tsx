// Component to display a single client with all fields
import DeleteButton from '../DeleteButton';

interface Client {
  id: number;
  name: string;
  email: string;
  mobile: string | null;
  address: string | null;
  created_by: string;
  updated_by: string;
  created_at: string;
  updated_at: string;
}

interface ClientCardProps {
  client: Client;
  onDelete?: () => void;
  isAdmin?: boolean;
}

export default function ClientCard({ client, onDelete, isAdmin = false }: ClientCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm hover:shadow-md transition-smooth card-hover">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-lg font-semibold text-gray-900">{client.name}</h3>
        {onDelete && (
          <DeleteButton
            clientId={client.id}
            clientName={client.name}
            onDelete={onDelete}
            isAdmin={isAdmin}
          />
        )}
      </div>
      
      <div className="space-y-2 text-sm">
        <div className="flex items-center">
          <span className="font-medium text-gray-600 w-24">Email:</span>
          <span className="text-gray-900">{client.email}</span>
        </div>
        
        {client.mobile && (
          <div className="flex items-center">
            <span className="font-medium text-gray-600 w-24">Mobile:</span>
            <span className="text-gray-900">{client.mobile}</span>
          </div>
        )}
        
        {client.address && (
          <div className="flex items-start">
            <span className="font-medium text-gray-600 w-24">Address:</span>
            <span className="text-gray-900 flex-1">{client.address}</span>
          </div>
        )}
        
        <div className="border-t border-gray-200 mt-4 pt-4">
          <div className="flex items-center text-xs text-gray-500">
            <span className="font-medium w-24">Created:</span>
            <span>{formatDate(client.created_at)} by {client.created_by}</span>
          </div>
          
          <div className="flex items-center text-xs text-gray-500 mt-1">
            <span className="font-medium w-24">Updated:</span>
            <span>{formatDate(client.updated_at)} by {client.updated_by}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
