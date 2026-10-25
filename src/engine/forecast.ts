import { AggregatedDaily, ForecastResult } from './types';

export interface ForecastOptions {
  billingCycleDays?: number; // default: 30 days
  recentWindowDays?: number; // default: 7 days
}

/**
 * Generates transparent end-of-month and run-rate forecasts.
 * Accommodates datasets spanning partial months with clear assumptions and uncertainty bounds.
 */
export function calculateForecast(
  dailySpend: AggregatedDaily[],
  options: ForecastOptions = {}
): ForecastResult {
  const cycleDays = options.billingCycleDays ?? 30;
  const recentDays = options.recentWindowDays ?? 7;

  const observedCost = dailySpend.reduce((sum, d) => sum + d.cost, 0);
  const elapsedDays = dailySpend.length;

  if (elapsedDays === 0) {
    return {
      observedCost: 0,
      elapsedDays: 0,
      totalPeriodDays: cycleDays,
      remainingDays: cycleDays,
      runRateForecast: 0,
      recentAverageDaily: 0,
      recentTrendForecast: 0,
      dailyAverageOverall: 0,
      uncertaintyRange: { low: 0, high: 0 },
      method: 'run-rate',
      assumptions: ['No historical observations available to generate forecast.'],
      dataCoveragePercentage: 0
    };
  }

  const remainingDays = Math.max(0, cycleDays - elapsedDays);
  const dailyAverageOverall = observedCost / elapsedDays;

  // Run-Rate Projection
  const runRateForecast = Number(((observedCost / elapsedDays) * cycleDays).toFixed(2));

  // Recent Daily Average Projection (last 7 days or all available)
  const recentSlice = dailySpend.slice(Math.max(0, elapsedDays - recentDays));
  const recentSliceCost = recentSlice.reduce((sum, d) => sum + d.cost, 0);
  const recentAverageDaily = recentSlice.length > 0 ? recentSliceCost / recentSlice.length : dailyAverageOverall;
  const recentTrendForecast = Number((observedCost + recentAverageDaily * remainingDays).toFixed(2));

  // Compute variance for uncertainty range
  const dailyCosts = dailySpend.map(d => d.cost);
  const mean = dailyAverageOverall;
  const variance = dailyCosts.reduce((acc, c) => acc + Math.pow(c - mean, 2), 0) / elapsedDays;
  const stdDev = Math.sqrt(variance);

  // Uncertainty envelope based on standard deviation
  const margin = stdDev * Math.sqrt(remainingDays) * 1.5;
  const uncertaintyRange = {
    low: Number(Math.max(observedCost, runRateForecast - margin).toFixed(2)),
    high: Number((runRateForecast + margin).toFixed(2))
  };

  const assumptions: string[] = [
    `Assumes standard ${cycleDays}-day monthly billing period (${elapsedDays} days observed, ${remainingDays} remaining).`,
    `Run-rate projects overall observed daily burn rate ($${dailyAverageOverall.toFixed(2)}/day).`,
    `Recent trend projects latest ${recentSlice.length}-day burn rate ($${recentAverageDaily.toFixed(2)}/day) across remaining days.`
  ];

  if (recentSlice.length >= 7 && Math.abs(recentAverageDaily - dailyAverageOverall) > 10) {
    assumptions.push('Recent spending divergence observed; recent-trend projection reflects current operational velocity.');
  }

  const dataCoveragePercentage = Number(((elapsedDays / cycleDays) * 100).toFixed(1));

  return {
    observedCost: Number(observedCost.toFixed(2)),
    elapsedDays,
    totalPeriodDays: cycleDays,
    remainingDays,
    runRateForecast,
    recentAverageDaily: Number(recentAverageDaily.toFixed(2)),
    recentTrendForecast,
    dailyAverageOverall: Number(dailyAverageOverall.toFixed(2)),
    uncertaintyRange,
    method: recentSlice.length >= 7 ? 'recent-daily-average' : 'run-rate',
    assumptions,
    dataCoveragePercentage
  };
}
