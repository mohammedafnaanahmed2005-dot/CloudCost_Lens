import { describe, it, expect } from 'vitest';
import { aggregateBillingRecords } from '../engine/aggregator';
import { BillingRecord } from '../engine/types';

describe('Billing Record Aggregator', () => {
  const mockRecords: BillingRecord[] = [
    { id: '1', rowNumber: 2, date: '2026-10-01', service: 'EC2', cost: 100, currency: 'USD', project: 'Alpha' },
    { id: '2', rowNumber: 3, date: '2026-10-01', service: 'S3', cost: 20, currency: 'USD', project: 'Beta' },
    { id: '3', rowNumber: 4, date: '2026-10-02', service: 'EC2', cost: 80, currency: 'USD', project: 'Alpha' },
    { id: '4', rowNumber: 5, date: '2026-10-02', service: 'RDS', cost: 50, currency: 'USD', project: 'Alpha' },
  ];

  it('aggregates total spend correctly', () => {
    const summary = aggregateBillingRecords(mockRecords);
    expect(summary.totalCost).toBe(250);
    expect(summary.totalDays).toBe(2);
    expect(summary.uniqueServicesCount).toBe(3);
    expect(summary.uniqueProjectsCount).toBe(2);
  });

  it('groups daily spend chronologically with per-service breakdown', () => {
    const summary = aggregateBillingRecords(mockRecords);
    expect(summary.dailySpend).toHaveLength(2);
    expect(summary.dailySpend[0]).toEqual({
      date: '2026-10-01',
      cost: 120,
      recordCount: 2,
      services: { EC2: 100, S3: 20 }
    });
    expect(summary.dailySpend[1]).toEqual({
      date: '2026-10-02',
      cost: 130,
      recordCount: 2,
      services: { EC2: 80, RDS: 50 }
    });
  });

  it('calculates service cost percentages and ranks descending', () => {
    const summary = aggregateBillingRecords(mockRecords);
    expect(summary.serviceSpend[0].service).toBe('EC2');
    expect(summary.serviceSpend[0].cost).toBe(180);
    expect(summary.serviceSpend[0].percentage).toBe(72); // 180 / 250 = 72%

    expect(summary.serviceSpend[1].service).toBe('RDS');
    expect(summary.serviceSpend[1].cost).toBe(50);
    expect(summary.serviceSpend[1].percentage).toBe(20);

    expect(summary.serviceSpend[2].service).toBe('S3');
    expect(summary.serviceSpend[2].cost).toBe(20);
    expect(summary.serviceSpend[2].percentage).toBe(8);
  });

  it('isolates currencies and does not sum USD and EUR directly', () => {
    const multiRecords: BillingRecord[] = [
      { id: '1', rowNumber: 2, date: '2026-10-01', service: 'EC2', cost: 100, currency: 'USD' },
      { id: '2', rowNumber: 3, date: '2026-10-01', service: 'EC2', cost: 50, currency: 'EUR' },
    ];

    const usdSummary = aggregateBillingRecords(multiRecords, { currencyFilter: 'USD' });
    expect(usdSummary.totalCost).toBe(100);
    expect(usdSummary.currency).toBe('USD');

    const eurSummary = aggregateBillingRecords(multiRecords, { currencyFilter: 'EUR' });
    expect(eurSummary.totalCost).toBe(50);
    expect(eurSummary.currency).toBe('EUR');
  });

  it('handles empty records cleanly', () => {
    const summary = aggregateBillingRecords([]);
    expect(summary.totalCost).toBe(0);
    expect(summary.dailySpend).toHaveLength(0);
    expect(summary.serviceSpend).toHaveLength(0);
  });
});
