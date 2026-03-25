// Sortable column header component with sort indicator icons
'use client';

interface SortableColumnHeaderProps {
  field: 'created_at' | 'updated_at';
  label: string;
  sortField: 'created_at' | 'updated_at';
  sortDirection: 'asc' | 'desc';
  onSort: (field: 'created_at' | 'updated_at') => void;
}

export default function SortableColumnHeader({
  field,
  label,
  sortField,
  sortDirection,
  onSort,
}: SortableColumnHeaderProps) {
  const isActive = sortField === field;

  return (
    <button
      onClick={() => onSort(field)}
      className="flex items-center gap-2 hover:text-blue-600 transition-colors"
    >
      <span>{label}</span>
      <span className="text-gray-400">
        {isActive ? (
          sortDirection === 'asc' ? '↑' : '↓'
        ) : (
          '↕'
        )}
      </span>
    </button>
  );
}
