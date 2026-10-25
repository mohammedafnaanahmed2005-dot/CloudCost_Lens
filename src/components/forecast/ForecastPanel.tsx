import React from 'react';
import { ForecastResult } from '../../engine/types';
import { Compass, Info, TrendingUp, Calendar } from 'lucide-react';

interface ForecastPanelProps {
  forecast: ForecastResult;
  currency: string;
}

export const ForecastPanel: React.FC<ForecastPanelProps> = ({
  forecast,
  currency
}) => {
  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Compass className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">End-of-Month Cost Projections</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Dual-method predictive modeling with uncertainty boundaries and transparent operational assumptions
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs">
          <span className="px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20 font-mono">
            {forecast.dataCoveragePercentage}% Month Observed ({forecast.elapsedDays}/{forecast.totalPeriodDays}d)
          </span>
        </div>
      </div>

      {/* Projection Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Method 1: Standard Run-Rate */}
        <div className={`p-4 rounded-xl border relative transition ${
          forecast.method === 'run-rate'
            ? 'bg-blue-950/20 border-blue-800/60 shadow-lg'
            : 'bg-gray-900/40 border-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
              Standard Run-Rate Projection
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-gray-800 text-gray-300">
              Overall Average
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-white font-mono">
              ${forecast.runRateForecast.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-gray-400 ml-1.5 font-sans font-normal">{currency}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Extrapolates observed ${forecast.dailyAverageOverall.toFixed(2)}/day across all {forecast.totalPeriodDays} days.
            </p>
          </div>
        </div>

        {/* Method 2: Recent Trend Average */}
        <div className={`p-4 rounded-xl border relative transition ${
          forecast.method === 'recent-daily-average'
            ? 'bg-indigo-950/20 border-indigo-800/60 shadow-lg'
            : 'bg-gray-900/40 border-gray-800'
        }`}>
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5" /> Recent 7-Day Velocity Projection
            </span>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-900/40 text-indigo-300 border border-indigo-800/50">
              Adaptive
            </span>
          </div>
          <div className="mt-3">
            <p className="text-2xl font-extrabold text-indigo-300 font-mono">
              ${forecast.recentTrendForecast.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              <span className="text-xs text-gray-400 ml-1.5 font-sans font-normal">{currency}</span>
            </p>
            <p className="text-xs text-gray-400 mt-1">
              Projects recent ${forecast.recentAverageDaily.toFixed(2)}/day velocity onto the {forecast.remainingDays} remaining days.
            </p>
          </div>
        </div>
      </div>

      {/* Uncertainty Envelope */}
      <div className="p-4 rounded-xl bg-gray-900/60 border border-gray-800 text-xs space-y-2">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-gray-300 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-blue-400" /> Confidence & Uncertainty Interval (±1.5σ)
          </span>
          <span className="font-mono text-gray-400">
            ${forecast.uncertaintyRange.low.toFixed(2)} → ${forecast.uncertaintyRange.high.toFixed(2)} {currency}
          </span>
        </div>
        <div className="w-full bg-gray-800 rounded-full h-2 relative overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 to-indigo-500 h-full rounded-full"
            style={{
              width: '100%'
            }}
          />
        </div>
      </div>

      {/* Documented Assumptions & Disclaimers */}
      <div className="p-3.5 rounded-xl bg-gray-900/80 border border-gray-800/80 space-y-2 text-xs">
        <h4 className="font-semibold text-gray-300 flex items-center gap-1.5 text-[11px] uppercase tracking-wider">
          <Info className="w-3.5 h-3.5 text-blue-400" /> Documented Assumptions & Method Limitations
        </h4>
        <ul className="list-disc list-inside space-y-1 text-gray-400 text-[11px] pl-1">
          {forecast.assumptions.map((ass, i) => (
            <li key={i}>{ass}</li>
          ))}
          <li className="text-gray-500">
            Note: Projections are estimates based on observed expenditure patterns and do not guarantee cloud provider billing outcomes.
          </li>
        </ul>
      </div>
    </div>
  );
};
