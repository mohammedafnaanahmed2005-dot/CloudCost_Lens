import React from 'react';
import { AggregationSummary, BudgetUtilization } from '../../engine/types';
import { DollarSign, TrendingUp, TrendingDown, Target, Layers, AlertTriangle } from 'lucide-react';

interface OverviewCardsProps {
  summary: AggregationSummary;
  budgetInfo: BudgetUtilization;
  anomalyCount: number;
}

export const OverviewCards: React.FC<OverviewCardsProps> = ({
  summary,
  budgetInfo,
  anomalyCount
}) => {
  const { totalCost, currency, dateRange, totalDays, previousPeriodChange, serviceSpend } = summary;
  const topService = serviceSpend[0];
  const dailyAverage = totalDays > 0 ? totalCost / totalDays : 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Total Spend */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Observed Cost</span>
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <DollarSign className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <p className="text-3xl font-extrabold text-white tracking-tight flex items-baseline gap-1.5">
            <span>${totalCost.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            <span className="text-xs font-mono text-gray-400 uppercase">{currency}</span>
          </p>
          <div className="mt-2 flex items-center justify-between text-xs text-gray-400">
            <span>{dateRange ? `${dateRange.start} → ${dateRange.end}` : 'No date range'}</span>
            <span className="font-mono text-gray-300 font-medium">${dailyAverage.toFixed(2)}/day</span>
          </div>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-80" />
      </div>

      {/* Spending Velocity / Period Change */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Period Spending Change</span>
          <div className={`p-2 rounded-xl border ${
            previousPeriodChange && previousPeriodChange.percentage > 0
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
          }`}>
            {previousPeriodChange && previousPeriodChange.percentage > 0 ? (
              <TrendingUp className="w-4 h-4" />
            ) : (
              <TrendingDown className="w-4 h-4" />
            )}
          </div>
        </div>
        <div className="mt-3">
          {previousPeriodChange ? (
            <>
              <div className="flex items-baseline gap-2">
                <span className={`text-3xl font-extrabold tracking-tight ${
                  previousPeriodChange.percentage > 0 ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {previousPeriodChange.percentage > 0 ? '+' : ''}{previousPeriodChange.percentage}%
                </span>
                <span className="text-xs font-mono text-gray-400">
                  (${previousPeriodChange.absolute > 0 ? '+' : ''}{previousPeriodChange.absolute.toFixed(2)})
                </span>
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Comparing second half to first half of window
              </p>
            </>
          ) : (
            <>
              <p className="text-xl font-bold text-gray-400">Baseline Window</p>
              <p className="mt-2 text-xs text-gray-500">Requires ≥4 days for trend velocity</p>
            </>
          )}
        </div>
        <div className={`absolute inset-x-0 bottom-0 h-1 ${
          previousPeriodChange && previousPeriodChange.percentage > 0
            ? 'bg-rose-500'
            : 'bg-emerald-500'
        }`} />
      </div>

      {/* Budget Utilization */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Budget Utilization</span>
          <div className={`p-2 rounded-xl border ${
            budgetInfo.isOverBudget
              ? 'bg-rose-500/10 text-rose-400 border-rose-500/20'
              : budgetInfo.utilizationPercentage > 80
              ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
              : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
          }`}>
            <Target className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold text-white tracking-tight">
              {budgetInfo.utilizationPercentage}%
            </span>
            <span className="text-xs font-mono text-gray-400">
              Budget: ${budgetInfo.configuredBudget.toLocaleString()}
            </span>
          </div>

          <div className="w-full bg-gray-800 rounded-full h-2 mt-3 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                budgetInfo.isOverBudget
                  ? 'bg-rose-500'
                  : budgetInfo.utilizationPercentage > 80
                  ? 'bg-amber-500'
                  : 'bg-blue-500'
              }`}
              style={{ width: `${Math.min(budgetInfo.utilizationPercentage, 100)}%` }}
            />
          </div>

          <p className="mt-2 text-xs text-gray-400 flex items-center justify-between">
            <span>
              {budgetInfo.isOverBudget
                ? `Exceeded by $${Math.abs(budgetInfo.remainingBudget).toFixed(2)}`
                : `$${budgetInfo.remainingBudget.toFixed(2)} remaining`}
            </span>
            {budgetInfo.isProjectedOverBudget && (
              <span className="text-rose-400 font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" /> Projected Overrun
              </span>
            )}
          </p>
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500" />
      </div>

      {/* Top Cost Driver & Anomalies */}
      <div className="p-5 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl relative overflow-hidden group hover:border-gray-700 transition">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Dominant Cost Driver</span>
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Layers className="w-4 h-4" />
          </div>
        </div>
        <div className="mt-3">
          {topService ? (
            <>
              <p className="text-xl font-bold text-white truncate" title={topService.service}>
                {topService.service}
              </p>
              <div className="mt-1 flex items-baseline gap-2">
                <span className="text-2xl font-extrabold text-purple-400 font-mono">
                  {topService.percentage}%
                </span>
                <span className="text-xs text-gray-400 font-mono">(${topService.cost.toFixed(2)})</span>
              </div>
              <div className="mt-2 text-xs flex items-center justify-between text-gray-400">
                <span>{summary.uniqueServicesCount} services total</span>
                {anomalyCount > 0 ? (
                  <span className="text-amber-400 font-medium">{anomalyCount} potential alert{anomalyCount > 1 ? 's' : ''}</span>
                ) : (
                  <span className="text-emerald-400">Stable</span>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500 text-sm">No service data</p>
          )}
        </div>
        <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-purple-500 to-pink-500" />
      </div>
    </div>
  );
};
