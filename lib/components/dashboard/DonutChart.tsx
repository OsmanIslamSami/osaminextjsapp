'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

interface StatusData {
  status: string;
  count: number;
}

const COLORS = {
  completed: 'rgb(34 197 94)',  // green-500
  pending: 'rgb(234 179 8)',    // yellow-500
  cancelled: 'rgb(239 68 68)',  // red-500
};

export default function DonutChart({ data }: { data: StatusData[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-500">
        No order data available
      </div>
    );
  }

  const chartData = data.map(item => ({
    name: item.status.charAt(0).toUpperCase() + item.status.slice(1),
    value: item.count,
    status: item.status,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <PieChart>
        <Pie
          data={chartData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={90}
          paddingAngle={2}
        >
          {chartData.map((entry, index) => (
            <Cell 
              key={`cell-${index}`} 
              fill={COLORS[entry.status as keyof typeof COLORS] || '#999'} 
            />
          ))}
        </Pie>
        <Tooltip 
          formatter={(value) => [`${value} orders`, 'Count']}
          contentStyle={{
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
          }}
        />
        <Legend 
          verticalAlign="bottom" 
          height={36}
          formatter={(value, entry: any) => `${value}: ${entry.payload.value}`}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
