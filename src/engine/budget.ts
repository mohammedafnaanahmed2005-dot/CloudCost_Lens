import { BudgetConfig, BudgetUtilization } from './types';

export const DEFAULT_BUDGET_CONFIG: BudgetConfig = {
  monthlyBudget: 3500,
  currency: 'USD',
  alertThresholdPercentage: 80
};

/**
 * Calculates budget utilization and overrun status.
 * Safely handles zero, negative, or missing budgets without division-by-zero errors.
 */
export function calculateBudgetUtilization(
  observedCost: number,
  forecastCost: number,
  config: BudgetConfig = DEFAULT_BUDGET_CONFIG
): BudgetUtilization {
  const { monthlyBudget, currency } = config;

  if (monthlyBudget <= 0) {
    return {
      configuredBudget: monthlyBudget,
      observedCost: Number(observedCost.toFixed(2)),
      utilizationPercentage: 0,
      forecastCost: Number(forecastCost.toFixed(2)),
      forecastUtilizationPercentage: 0,
      isOverBudget: observedCost > 0,
      isProjectedOverBudget: forecastCost > 0,
      remainingBudget: 0,
      currency
    };
  }

  const utilizationPercentage = Number(((observedCost / monthlyBudget) * 100).toFixed(1));
  const forecastUtilizationPercentage = Number(((forecastCost / monthlyBudget) * 100).toFixed(1));
  const remainingBudget = Number((monthlyBudget - observedCost).toFixed(2));

  return {
    configuredBudget: monthlyBudget,
    observedCost: Number(observedCost.toFixed(2)),
    utilizationPercentage,
    forecastCost: Number(forecastCost.toFixed(2)),
    forecastUtilizationPercentage,
    isOverBudget: observedCost > monthlyBudget,
    isProjectedOverBudget: forecastCost > monthlyBudget,
    remainingBudget,
    currency
  };
}
