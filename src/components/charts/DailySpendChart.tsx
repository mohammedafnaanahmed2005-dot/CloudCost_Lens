import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import { AggregatedDaily, AnomalyAlert } from '../../engine/types';
import { Calendar, AlertCircle } from 'lucide-react';

interface DailySpendChartProps {
  dailySpend: AggregatedDaily[];
  anomalies?: AnomalyAlert[];
  currency: string;
}

export const DailySpendChart: React.FC<DailySpendChartProps> = ({
  dailySpend,
  anomalies = [],
  currency
}) => {
  const anomalyDates = new Set(anomalies.map(a => a.date));

  // Augment chart data with anomaly marker flag
  const chartData = dailySpend.map(d => ({
    date: d.date,
    cost: d.cost,
    recordCount: d.recordCount,
    isAnomaly: anomalyDates.has(d.date),
    services: d.services
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAnomaly = data.isAnomaly;
      const anomalyInfo = anomalies.find(a => a.date === label);

      return (
        <div className="bg-[#111827] border border-gray-700/80 p-3.5 rounded-xl shadow-2xl text-xs space-y-2 min-w-[200px] backdrop-blur-lg">
          <div className="flex items-center justify-between border-b border-gray-800 pb-2">
            <span className="font-semibold text-gray-200">{label}</span>
            {isAnomaly && (
              <span className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-400 border border-rose-500/30 text-[10px] font-bold flex items-center gap-1">
                <AlertCircle className="w-3 h-3" /> Anomaly
              </span>
            )}
          </div>

          <div className="flex items-baseline justify-between py-1">
            <span className="text-gray-400">Total Spend:</span>
            <span className="font-mono text-sm font-bold text-white">
              ${data.cost.toFixed(2)} {currency}
            </span>
          </div>

          {anomalyInfo && (
            <div className="p-2 bg-rose-950/30 border border-rose-800/40 rounded text-[11px] text-rose-300">
              <p>Baseline: ${anomalyInfo.baselineMedian.toFixed(2)}</p>
              <p>Robust R: {anomalyInfo.robustScore.toFixed(2)} (Threshold: {anomalyInfo.threshold})</p>
            </div>
          )}

          {data.services && Object.keys(data.services).length > 0 && (
            <div className="pt-1.5 border-t border-gray-800/60 space-y-1">
              <span className="text-[10px] uppercase font-semibold text-gray-400">Services:</span>
              {Object.entries(data.services as Record<string, number>)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 4)
                .map(([svc, cost]) => (
                  <div key={svc} className="flex justify-between text-gray-300">
                    <span className="truncate max-w-[130px]">{svc}:</span>
                    <span className="font-mono">${cost.toFixed(2)}</span>
                  </div>
                ))}
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  if (dailySpend.length === 0) {
    return (
      <div className="h-72 flex flex-col items-center justify-center text-gray-500">
        <Calendar className="w-8 h-8 mb-2 opacity-50" />
        <p className="text-sm">No daily spending records available to chart.</p>
      </div>
    );
  }

  return (
    <div className="w-full h-72">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            <linearGradient id="spendGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#3B82F6" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1F2937" vertical={false} />
          <XAxis
            dataKey="date"
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val: string) => {
              const parts = val.split('-');
              return parts.length === 3 ? `${parts[1]}/${parts[2]}` : val;
            }}
          />
          <YAxis
            stroke="#6B7280"
            fontSize={11}
            tickLine={false}
            tickFormatter={(val: number) => `$${val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="cost"
            stroke="#3B82F6"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#spendGradient)"
            dot={(props: any) => {
              const { cx, cy, payload } = props;
              if (payload.isAnomaly) {
                return (
                  <circle
                    key={`dot-${payload.date}`}
                    cx={cx}
                    cy={cy}
                    r={5}
                    fill="#EF4444"
                    stroke="#FFFFFF"
                    strokeWidth={2}
                  />
                );
              }
              return (
                <circle
                  key={`dot-${payload.date}`}
                  cx={cx}
                  cy={cy}
                  r={2.5}
                  fill="#3B82F6"
                />
              );
            }}
            activeDot={{ r: 6, fill: '#60A5FA', stroke: '#1E40AF', strokeWidth: 2 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
