import { describe, it, expect } from 'vitest';
import { calculateMedian, calculateMAD, detectAnomalies } from '../engine/anomaly';
import { AggregatedDaily, BillingRecord } from '../engine/types';

describe('Statistical Anomaly Detection (Median + MAD)', () => {
  it('calculates median correctly for odd and even arrays', () => {
    expect(calculateMedian([1, 3, 5])).toBe(3);
    expect(calculateMedian([1, 2, 3, 4])).toBe(2.5);
    expect(calculateMedian([50])).toBe(50);
    expect(calculateMedian([])).toBe(0);
  });

  it('calculates MAD correctly', () => {
    // Array: [1, 2, 3, 4, 5, 6, 7], median = 4
    // Deviations: [3, 2, 1, 0, 1, 2, 3], sorted: [0, 1, 1, 2, 2, 3, 3] -> median = 2
    expect(calculateMAD([1, 2, 3, 4, 5, 6, 7], 4)).toBe(2);
  });

  it('flags an abnormal spike when robust score R > 3.5', () => {
    // 10 stable days around $50, then a massive spike to $350
    const dailySpend: AggregatedDaily[] = [
      { date: '2026-10-01', cost: 50, recordCount: 1, services: { EC2: 50 } },
      { date: '2026-10-02', cost: 51, recordCount: 1, services: { EC2: 51 } },
      { date: '2026-10-03', cost: 49, recordCount: 1, services: { EC2: 49 } },
      { date: '2026-10-04', cost: 50, recordCount: 1, services: { EC2: 50 } },
      { date: '2026-10-05', cost: 52, recordCount: 1, services: { EC2: 52 } },
      { date: '2026-10-06', cost: 48, recordCount: 1, services: { EC2: 48 } },
      { date: '2026-10-07', cost: 50, recordCount: 1, services: { EC2: 50 } },
      { date: '2026-10-08', cost: 51, recordCount: 1, services: { EC2: 51 } },
      { date: '2026-10-09', cost: 350, recordCount: 1, services: { EC2: 350 } }, // Spike
    ];

    const records: BillingRecord[] = dailySpend.map((d, i) => ({
      id: String(i),
      rowNumber: i + 2,
      date: d.date,
      service: 'EC2',
      cost: d.cost,
      currency: 'USD'
    }));

    const alerts = detectAnomalies(dailySpend, records, { minHistoricalSamples: 7 });
    expect(alerts.length).toBeGreaterThan(0);
    const spikeAlert = alerts.find(a => a.date === '2026-10-09');
    expect(spikeAlert).toBeDefined();
    expect(spikeAlert?.currentSpend).toBe(350);
    expect(spikeAlert?.baselineMedian).toBeCloseTo(50, 1);
    expect(spikeAlert?.robustScore).toBeGreaterThan(3.5);
    expect(spikeAlert?.reason).toContain('exceeded baseline median');
  });

  it('handles flat baseline with zero-MAD fallback gracefully', () => {
    // 8 days of perfectly identical spend (MAD = 0)
    const dailySpend: AggregatedDaily[] = [
      { date: '2026-10-01', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-02', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-03', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-04', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-05', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-06', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-07', cost: 100, recordCount: 1, services: { RDS: 100 } },
      { date: '2026-10-08', cost: 260, recordCount: 1, services: { RDS: 260 } }, // Jump
    ];

    const alerts = detectAnomalies(dailySpend, [], { minHistoricalSamples: 7 });
    expect(alerts.length).toBe(1);
    expect(alerts[0].mad).toBe(0);
    expect(alerts[0].reason).toContain('Zero historical variance detected (MAD=0)');
  });

  it('does not flag alerts when historical observations are insufficient (< 7)', () => {
    const dailySpend: AggregatedDaily[] = [
      { date: '2026-10-01', cost: 50, recordCount: 1, services: { EC2: 50 } },
      { date: '2026-10-02', cost: 500, recordCount: 1, services: { EC2: 500 } },
    ];

    const alerts = detectAnomalies(dailySpend, [], { minHistoricalSamples: 7 });
    expect(alerts).toHaveLength(0);
  });
});
