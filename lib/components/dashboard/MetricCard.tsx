// Metric card component with optional comparison
interface MetricCardProps {
  label: string;
  value: number;
  thisMonth?: number;
  lastMonth?: number;
}

export default function MetricCard({ label, value, thisMonth, lastMonth }: MetricCardProps) {
  const hasComparison = thisMonth !== undefined && lastMonth !== undefined;
  const percentChange = hasComparison && lastMonth > 0
    ? ((thisMonth - lastMonth) / lastMonth * 100).toFixed(1)
    : null;
  const isIncrease = hasComparison && thisMonth >= lastMonth;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-sm">
      <div className="text-sm text-gray-600 mb-2">{label}</div>
      <div className="text-3xl font-bold text-gray-900 mb-2">{value.toLocaleString()}</div>
      
      {hasComparison && (
        <div className="text-sm">
          <div className="flex items-center gap-2">
            <span className="text-gray-600">This month:</span>
            <span className="font-semibold">{thisMonth.toLocaleString()}</span>
            {percentChange !== null && (
              <span className={isIncrease ? 'text-green-600' : 'text-red-600'}>
                {isIncrease ? '↑' : '↓'} {Math.abs(parseFloat(percentChange))}%
              </span>
            )}
          </div>
          <div className="text-gray-500 mt-1">
            Last month: {lastMonth.toLocaleString()}
          </div>
        </div>
      )}
    </div>
  );
}
