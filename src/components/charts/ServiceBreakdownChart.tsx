import React from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip
} from 'recharts';
import { AggregatedService } from '../../engine/types';
import { PieChart as PieIcon } from 'lucide-react';

interface ServiceBreakdownChartProps {
  serviceSpend: AggregatedService[];
  currency: string;
}

const PALETTE = [
  '#3B82F6', // Blue
  '#8B5CF6', // Purple
  '#10B981', // Emerald
  '#F59E0B', // Amber
  '#EC4899', // Pink
  '#06B6D4', // Cyan
  '#6366F1', // Indigo
  '#14B8A6'  // Teal
];

export const ServiceBreakdownChart: React.FC<ServiceBreakdownChartProps> = ({
  serviceSpend,
  currency
}) => {
  if (serviceSpend.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-gray-500">
        <PieIcon className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No service breakdown data available.</p>
      </div>
    );
  }

  // Top 5 services + 'Others' grouping if more than 5
  const topServices = serviceSpend.slice(0, 5);
  const others = serviceSpend.slice(5);
  const otherCost = others.reduce((acc, s) => acc + s.cost, 0);

  const chartData = [...topServices];
  if (otherCost > 0) {
    const totalCost = serviceSpend.reduce((acc, s) => acc + s.cost, 0);
    chartData.push({
      service: `Other Services (${others.length})`,
      cost: Number(otherCost.toFixed(2)),
      percentage: totalCost > 0 ? Number(((otherCost / totalCost) * 100).toFixed(1)) : 0,
      recordCount: others.reduce((acc, s) => acc + s.recordCount, 0),
      dailyAverage: 0
    });
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload as AggregatedService;
      return (
        <div className="bg-[#111827] border border-gray-700 p-3 rounded-xl shadow-xl text-xs space-y-1">
          <p className="font-semibold text-white">{data.service}</p>
          <p className="font-mono text-blue-400 font-bold">
            ${data.cost.toFixed(2)} {currency} ({data.percentage}%)
          </p>
          <p className="text-[11px] text-gray-400">{data.recordCount} billing items</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col md:flex-row items-center justify-between gap-4 h-72">
      <div className="w-full md:w-1/2 h-full">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="cost"
              nameKey="service"
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={85}
              paddingAngle={3}
            >
              {chartData.map((_, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={PALETTE[index % PALETTE.length]}
                  stroke="#111827"
                  strokeWidth={2}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Legend */}
      <div className="w-full md:w-1/2 space-y-2 pr-2 overflow-y-auto max-h-64">
        {chartData.map((item, index) => (
          <div key={item.service} className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 truncate max-w-[150px]">
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: PALETTE[index % PALETTE.length] }}
              />
              <span className="text-gray-300 font-medium truncate" title={item.service}>
                {item.service}
              </span>
            </div>
            <div className="flex items-center gap-2 font-mono">
              <span className="text-white font-semibold">${item.cost.toFixed(2)}</span>
              <span className="text-gray-500 w-10 text-right">({item.percentage}%)</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
