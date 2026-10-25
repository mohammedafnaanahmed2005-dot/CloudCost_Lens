import { describe, it, expect } from 'vitest';
import { calculateBudgetUtilization } from '../engine/budget';

describe('Budget Utilization Engine', () => {
  it('calculates observed and forecast utilization correctly', () => {
    const res = calculateBudgetUtilization(1500, 3000, {
      monthlyBudget: 3000,
      currency: 'USD',
      alertThresholdPercentage: 80
    });

    expect(res.utilizationPercentage).toBe(50);
    expect(res.forecastUtilizationPercentage).toBe(100);
    expect(res.isOverBudget).toBe(false);
    expect(res.isProjectedOverBudget).toBe(false);
    expect(res.remainingBudget).toBe(1500);
  });

  it('detects over-budget and projected-over-budget states', () => {
    const res = calculateBudgetUtilization(3200, 4500, {
      monthlyBudget: 3000,
      currency: 'USD',
      alertThresholdPercentage: 80
    });

    expect(res.isOverBudget).toBe(true);
    expect(res.isProjectedOverBudget).toBe(true);
    expect(res.remainingBudget).toBe(-200);
  });

  it('handles zero or negative budget safely without throwing', () => {
    const zeroRes = calculateBudgetUtilization(500, 800, {
      monthlyBudget: 0,
      currency: 'USD',
      alertThresholdPercentage: 80
    });

    expect(zeroRes.utilizationPercentage).toBe(0);
    expect(zeroRes.isOverBudget).toBe(true);
  });
});
