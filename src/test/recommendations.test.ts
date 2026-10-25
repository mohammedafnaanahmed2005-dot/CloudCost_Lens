import { describe, it, expect } from 'vitest';
import { generateRecommendations, calculatePriorityScore } from '../engine/recommendations';
import { AggregationSummary, AnomalyAlert, BudgetUtilization } from '../engine/types';

describe('Recommendation Ranking Engine', () => {
  it('calculates priority score according to documented formula: 0.5*impact + 0.3*severity + 0.2*confidence', () => {
    // 0.5*80 + 0.3*90 + 0.2*70 = 40 + 27 + 14 = 81
    expect(calculatePriorityScore(80, 90, 70)).toBe(81);
  });

  it('ranks recommendations in descending priority score order', () => {
    const summary: AggregationSummary = {
      totalCost: 10000,
      currency: 'USD',
      currenciesFound: ['USD'],
      dateRange: { start: '2026-10-01', end: '2026-10-21' },
      totalDays: 21,
      uniqueServicesCount: 2,
      uniqueProjectsCount: 1,
      dailySpend: [],
      serviceSpend: [
        { service: 'Amazon EC2', cost: 7000, percentage: 70, recordCount: 100, dailyAverage: 333.33 },
        { service: 'Amazon S3', cost: 3000, percentage: 30, recordCount: 50, dailyAverage: 142.85 }
      ],
      projectSpend: []
    };

    const mockAnomalies: AnomalyAlert[] = [
      {
        id: '1',
        date: '2026-10-18',
        service: 'Amazon EC2',
        currentSpend: 380,
        baselineMedian: 50,
        mad: 2,
        robustScore: 8.5,
        threshold: 3.5,
        deltaCost: 330,
        historicalSampleSize: 14,
        reason: 'Spike detected',
        severity: 'high'
      }
    ];

    const budgetInfo: BudgetUtilization = {
      configuredBudget: 5000,
      observedCost: 10000,
      utilizationPercentage: 200,
      forecastCost: 14000,
      forecastUtilizationPercentage: 280,
      isOverBudget: true,
      isProjectedOverBudget: true,
      remainingBudget: -5000,
      currency: 'USD'
    };

    const recs = generateRecommendations(summary, mockAnomalies, budgetInfo);
    expect(recs.length).toBeGreaterThan(0);

    // Verify descending order
    for (let i = 0; i < recs.length - 1; i++) {
      expect(recs[i].priorityScore).toBeGreaterThanOrEqual(recs[i + 1].priorityScore);
    }

    // High severity budget overrun and spike should be near top
    expect(recs[0].priorityScore).toBeGreaterThan(60);
    expect(recs[0].evidence).toBeDefined();
    expect(recs[0].actionableSteps.length).toBeGreaterThan(0);
  });

  it('does not claim idle resources or invent guaranteed savings for dominant spend', () => {
    const summary: AggregationSummary = {
      totalCost: 5000,
      currency: 'USD',
      currenciesFound: ['USD'],
      dateRange: { start: '2026-10-01', end: '2026-10-10' },
      totalDays: 10,
      uniqueServicesCount: 1,
      uniqueProjectsCount: 1,
      dailySpend: [],
      serviceSpend: [
        { service: 'Google Compute Engine', cost: 3500, percentage: 70, recordCount: 10, dailyAverage: 350 }
      ],
      projectSpend: []
    };

    const recs = generateRecommendations(summary, []);
    const dominantRec = recs.find(r => r.category === 'dominance');
    expect(dominantRec).toBeDefined();
    expect(dominantRec?.savingsRequiresInvestigation).toBe(true);
    expect(dominantRec?.estimatedPotentialSavings).toBeUndefined();
    expect(dominantRec?.evidence).toContain('accounts for 70%');
  });
});
