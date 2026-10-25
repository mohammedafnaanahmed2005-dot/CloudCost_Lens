import { describe, it, expect } from 'vitest';
import { parseBillingCsv } from '../engine/parser';
import { aggregateBillingRecords } from '../engine/aggregator';
import { detectAnomalies } from '../engine/anomaly';
import { calculateForecast } from '../engine/forecast';
import { generateRecommendations } from '../engine/recommendations';
import { calculateBudgetUtilization } from '../engine/budget';

describe('Sprint 4: Robust QA & Edge Case Suite', () => {
  describe('Malformed & Corrupted Input Handling', () => {
    it('handles files with completely garbage non-CSV text without crashing', () => {
      const garbage = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.';
      const res = parseBillingCsv(garbage);
      expect(res.errors.length).toBeGreaterThan(0);
      expect(res.validRows).toBe(0);
    });

    it('handles dates with invalid months or days properly', () => {
      const csv = `date,service,cost,currency
2026-02-31,EC2,10.00,USD
2026-14-10,EC2,20.00,USD
2026-10-05,EC2,30.00,USD`;

      const res = parseBillingCsv(csv);
      expect(res.validRows).toBe(1); // Only 2026-10-05 is valid
      expect(res.errors).toHaveLength(2);
      expect(res.errors.map(e => e.rowNumber)).toEqual([2, 3]);
    });

    it('tracks non-numeric cost strings and reports the exact row', () => {
      const csv = `date,service,cost,currency
2026-10-01,EC2,NaN,USD
2026-10-02,EC2,$FREE,USD
2026-10-03,EC2,50.00,USD`;

      const res = parseBillingCsv(csv);
      expect(res.validRows).toBe(1);
      expect(res.errors).toHaveLength(2);
      expect(res.errors[0].rowNumber).toBe(2);
      expect(res.errors[1].rowNumber).toBe(3);
    });
  });

  describe('Zero Cost vs Missing Cost Discrepancy', () => {
    it('allows genuine zero-cost items (e.g. Free Tier) while rejecting blank cost rows', () => {
      const csv = `date,service,cost,currency
2026-10-01,CloudWatch,0.00,USD
2026-10-02,CloudWatch,,USD`;

      const res = parseBillingCsv(csv);
      expect(res.validRows).toBe(1);
      expect(res.records[0].cost).toBe(0);
      expect(res.errors).toHaveLength(1);
      expect(res.errors[0].rowNumber).toBe(3);
      expect(res.errors[0].message).toContain('Missing values cannot be treated as zero');
    });
  });

  describe('Currency Isolation & Aggregation Safety', () => {
    it('does not combine disparate currencies into a single sum', () => {
      const csv = `date,service,cost,currency
2026-10-01,EC2,100,USD
2026-10-01,EC2,100,EUR
2026-10-01,EC2,100,GBP`;

      const parsed = parseBillingCsv(csv);
      expect(parsed.hasMultiCurrency).toBe(true);
      expect(parsed.currencies).toHaveLength(3);

      const summaryUSD = aggregateBillingRecords(parsed.records, { currencyFilter: 'USD' });
      expect(summaryUSD.totalCost).toBe(100);
      expect(summaryUSD.currency).toBe('USD');

      const summaryEUR = aggregateBillingRecords(parsed.records, { currencyFilter: 'EUR' });
      expect(summaryEUR.totalCost).toBe(100);
      expect(summaryEUR.currency).toBe('EUR');
    });
  });

  describe('Analytical Boundary Conditions', () => {
    it('handles single-day dataset across all engines without divide-by-zero or crashes', () => {
      const dailySpend = [{ date: '2026-10-01', cost: 150, recordCount: 1, services: { EC2: 150 } }];
      const records = [{ id: '1', rowNumber: 2, date: '2026-10-01', service: 'EC2', cost: 150, currency: 'USD' }];

      const summary = aggregateBillingRecords(records);
      const anomalies = detectAnomalies(dailySpend, records);
      const forecast = calculateForecast(dailySpend);
      const budget = calculateBudgetUtilization(summary.totalCost, forecast.runRateForecast);
      const recs = generateRecommendations(summary, anomalies, budget);

      expect(summary.totalCost).toBe(150);
      expect(anomalies).toHaveLength(0); // Insufficient history (< 7 days)
      expect(forecast.runRateForecast).toBe(4500); // 150 * 30 days
      expect(recs.length).toBeGreaterThan(0);
    });

    it('handles completely empty dataset across all engines safely', () => {
      const summary = aggregateBillingRecords([]);
      const anomalies = detectAnomalies([], []);
      const forecast = calculateForecast([]);
      const budget = calculateBudgetUtilization(0, 0);
      const recs = generateRecommendations(summary, anomalies, budget);

      expect(summary.totalCost).toBe(0);
      expect(anomalies).toHaveLength(0);
      expect(forecast.runRateForecast).toBe(0);
      expect(budget.utilizationPercentage).toBe(0);
      expect(recs).toHaveLength(0);
    });

    it('handles zero or negative budget safely', () => {
      const zeroBudget = calculateBudgetUtilization(1000, 2000, {
        monthlyBudget: 0,
        currency: 'USD',
        alertThresholdPercentage: 80
      });
      expect(zeroBudget.isOverBudget).toBe(true);
      expect(zeroBudget.utilizationPercentage).toBe(0);

      const negativeBudget = calculateBudgetUtilization(1000, 2000, {
        monthlyBudget: -500,
        currency: 'USD',
        alertThresholdPercentage: 80
      });
      expect(negativeBudget.isOverBudget).toBe(true);
    });
  });
});
