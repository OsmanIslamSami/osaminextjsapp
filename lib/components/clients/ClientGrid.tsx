// Responsive grid layout for client cards
import ClientCard from './ClientCard';

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

interface ClientGridProps {
  clients: Client[];
  onDelete?: () => void;
}

export default function ClientGrid({ clients, onDelete }: ClientGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {clients.map((client) => (
        <ClientCard key={client.id} client={client} onDelete={onDelete} />
      ))}
    </div>
  );
}
