import { describe, it, expect } from 'vitest';
import { calculateForecast } from '../engine/forecast';
import { AggregatedDaily } from '../engine/types';

describe('End-of-Month Forecast Engine', () => {
  it('calculates transparent run-rate projection correctly', () => {
    // 10 days observed, $100/day = $1000 total. In a 30-day month, projection = $3000
    const dailySpend: AggregatedDaily[] = Array.from({ length: 10 }, (_, i) => ({
      date: `2026-10-${String(i + 1).padStart(2, '0')}`,
      cost: 100,
      recordCount: 1,
      services: { Svc: 100 }
    }));

    const result = calculateForecast(dailySpend, { billingCycleDays: 30 });
    expect(result.observedCost).toBe(1000);
    expect(result.elapsedDays).toBe(10);
    expect(result.remainingDays).toBe(20);
    expect(result.runRateForecast).toBe(3000);
    expect(result.dataCoveragePercentage).toBe(33.3);
  });

  it('calculates recent daily average trend when recent spending diverges', () => {
    // 10 days of $50, then 7 days of $150
    const dailySpend: AggregatedDaily[] = [
      ...Array.from({ length: 10 }, (_, i) => ({
        date: `2026-10-${String(i + 1).padStart(2, '0')}`,
        cost: 50,
        recordCount: 1,
        services: { Svc: 50 }
      })),
      ...Array.from({ length: 7 }, (_, i) => ({
        date: `2026-10-${String(i + 11).padStart(2, '0')}`,
        cost: 150,
        recordCount: 1,
        services: { Svc: 150 }
      }))
    ];

    const result = calculateForecast(dailySpend, { billingCycleDays: 30, recentWindowDays: 7 });
    expect(result.elapsedDays).toBe(17);
    expect(result.recentAverageDaily).toBe(150);
    // Recent trend projection = observed (10*50 + 7*150 = 1550) + 150 * 13 remaining = 1550 + 1950 = 3500
    expect(result.recentTrendForecast).toBe(3500);
    expect(result.runRateForecast).toBeLessThan(3500); // Overall run rate is dragged down by early $50 days
  });

  it('handles empty dataset safely without throwing', () => {
    const result = calculateForecast([]);
    expect(result.runRateForecast).toBe(0);
    expect(result.observedCost).toBe(0);
    expect(result.assumptions[0]).toContain('No historical observations');
  });
});
