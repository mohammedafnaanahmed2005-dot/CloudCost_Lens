import { AggregationSummary, AnomalyAlert, BudgetUtilization, Recommendation } from './types';

export interface RecommendationWeights {
  impactWeight: number; // default: 0.5
  severityWeight: number; // default: 0.3
  confidenceWeight: number; // default: 0.2
}

const DEFAULT_WEIGHTS: RecommendationWeights = {
  impactWeight: 0.5,
  severityWeight: 0.3,
  confidenceWeight: 0.2
};

/**
 * Calculates priority score: 0.5 * impact + 0.3 * severity + 0.2 * confidence.
 * Clamped strictly between 0 and 100.
 */
export function calculatePriorityScore(
  impact: number,
  severity: number,
  confidence: number,
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): number {
  const raw =
    weights.impactWeight * impact +
    weights.severityWeight * severity +
    weights.confidenceWeight * confidence;
  return Number(Math.max(0, Math.min(100, raw)).toFixed(1));
}

/**
 * Generates ranked, evidence-based recommendations strictly from imported billing records.
 * Does NOT assume unverified resource idle states.
 */
export function generateRecommendations(
  summary: AggregationSummary,
  anomalies: AnomalyAlert[] = [],
  budgetInfo?: BudgetUtilization,
  weights: RecommendationWeights = DEFAULT_WEIGHTS
): Recommendation[] {
  const recommendations: Recommendation[] = [];
  const { totalCost, serviceSpend, totalDays } = summary;

  if (totalCost === 0 || serviceSpend.length === 0) {
    return [];
  }

  // 1. Spiking / Anomalous Service Investigation
  const serviceAnomalies = anomalies.filter(a => a.service && a.service !== 'Total Cloud Spend');
  const distinctAnomalousServices = Array.from(new Set(serviceAnomalies.map(a => a.service!)));

  for (const svcName of distinctAnomalousServices) {
    const alertsForSvc = serviceAnomalies.filter(a => a.service === svcName);
    const maxRobust = Math.max(...alertsForSvc.map(a => a.robustScore));
    const totalSpikeCost = alertsForSvc.reduce((sum, a) => sum + a.deltaCost, 0);

    // Impact: ratio of delta cost to total bill (0 - 100)
    const impact = Math.min(100, Math.round((totalSpikeCost / totalCost) * 100 * 2));
    // Severity: proportional to robust z-score
    const severity = Math.min(100, Math.round(maxRobust * 12));
    // Confidence: high because it has mathematical outlier proof
    const confidence = 95;

    const priorityScore = calculatePriorityScore(impact, severity, confidence, weights);

    recommendations.push({
      id: `rec-spike-${svcName.replace(/[^a-zA-Z0-9]/g, '_')}`,
      title: `Investigate Sudden Cost Surge in ${svcName}`,
      service: svcName,
      category: 'spike',
      priorityScore,
      impact,
      severity,
      confidence,
      estimatedPotentialSavings: Number(totalSpikeCost.toFixed(2)),
      savingsRequiresInvestigation: false,
      evidence: `Detected ${alertsForSvc.length} statistical anomaly alerts with maximum robust z-score R=${maxRobust.toFixed(2)} and excess delta spend of $${totalSpikeCost.toFixed(2)}.`,
      calculationRationale: `Potential savings represents reverting excess daily surge back to the historical median ($${alertsForSvc[0]?.baselineMedian.toFixed(2)}/day).`,
      actionableSteps: [
        `Inspect active instances or workloads provisioned on ${alertsForSvc[0]?.date}.`,
        'Check autoscaling group minimum/maximum capacity and termination policies.',
        'Verify if experimental training or batch pipelines failed to shut down automatically.',
        'Tag specific resource IDs to isolate billing ownership.'
      ]
    });
  }

  // 2. Dominant Spend Consolidation (Services consuming > 35% of total bill)
  for (const s of serviceSpend) {
    if (s.percentage >= 35) {
      const impact = Math.min(100, Math.round(s.percentage));
      const severity = s.percentage >= 50 ? 85 : 65;
      const confidence = 90;

      const priorityScore = calculatePriorityScore(impact, severity, confidence, weights);

      recommendations.push({
        id: `rec-dominance-${s.service.replace(/[^a-zA-Z0-9]/g, '_')}`,
        title: `Architectural Review for High-Cost Driver: ${s.service}`,
        service: s.service,
        category: 'dominance',
        priorityScore,
        impact,
        severity,
        confidence,
        estimatedPotentialSavings: undefined, // Cost alone does not guarantee savings
        savingsRequiresInvestigation: true,
        evidence: `${s.service} accounts for ${s.percentage}% ($${s.cost.toFixed(2)}) of total cloud expenditure across ${s.recordCount} billing items.`,
        calculationRationale: 'Targeting high-expenditure services yields the highest leverage for architectural savings (e.g. savings plans, reserved instances, tiering).',
        actionableSteps: [
          `Review commitment discount eligibility (AWS Compute Savings Plans / GCP CUDs) for baseline ${s.service} spend.`,
          'Evaluate instance modernization (e.g. upgrading to latest generation Graviton / AMD instances).',
          'Audit provisioned IOPS vs actual throughput utilization metrics.'
        ]
      });
    }
  }

  // 3. Budget Overrun Mitigation
  if (budgetInfo && (budgetInfo.isOverBudget || budgetInfo.isProjectedOverBudget)) {
    const isAlreadyOver = budgetInfo.isOverBudget;
    const impact = Math.min(100, Math.round(Math.abs(budgetInfo.utilizationPercentage)));
    const severity = isAlreadyOver ? 95 : 80;
    const confidence = 90;

    const priorityScore = calculatePriorityScore(impact, severity, confidence, weights);

    recommendations.push({
      id: 'rec-budget-overrun',
      title: isAlreadyOver ? 'Active Monthly Budget Overrun' : 'Projected End-of-Month Budget Overrun',
      service: 'Organization Infrastructure',
      category: 'budget_overrun',
      priorityScore,
      impact,
      severity,
      confidence,
      estimatedPotentialSavings: Math.max(0, budgetInfo.forecastCost - budgetInfo.configuredBudget),
      savingsRequiresInvestigation: false,
      evidence: isAlreadyOver
        ? `Observed spend ($${budgetInfo.observedCost.toFixed(2)}) has exceeded the configured budget ($${budgetInfo.configuredBudget.toFixed(2)}) by $${Math.abs(budgetInfo.remainingBudget).toFixed(2)} (${budgetInfo.utilizationPercentage}%).`
        : `Forecasted spend ($${budgetInfo.forecastCost.toFixed(2)}) is on track to exceed budget ($${budgetInfo.configuredBudget.toFixed(2)}) by $${(budgetInfo.forecastCost - budgetInfo.configuredBudget).toFixed(2)} (${budgetInfo.forecastUtilizationPercentage}%).`,
      calculationRationale: 'Calculated from observed burn rate against configured budget threshold.',
      actionableSteps: [
        'Enforce budget alerts at 75%, 90%, and 100% via Slack/email webhooks.',
        'Implement automated non-production resource schedule shutdown outside business hours.',
        'Request temporary budget expansion or freeze non-essential staging deployments.'
      ]
    });
  }

  // 4. Growing Storage Expenditure Check
  const storageServices = serviceSpend.filter(s =>
    s.service.toLowerCase().includes('s3') ||
    s.service.toLowerCase().includes('storage') ||
    s.service.toLowerCase().includes('gcs')
  );

  for (const st of storageServices) {
    if (st.cost > 10 && totalDays >= 7) {
      recommendations.push({
        id: `rec-storage-${st.service.replace(/[^a-zA-Z0-9]/g, '_')}`,
        title: `Configure Lifecycle Management for ${st.service}`,
        service: st.service,
        category: 'growth',
        priorityScore: calculatePriorityScore(40, 45, 80, weights),
        impact: 40,
        severity: 45,
        confidence: 80,
        estimatedPotentialSavings: undefined,
        savingsRequiresInvestigation: true,
        evidence: `${st.service} accumulated $${st.cost.toFixed(2)} across ${totalDays} observed days without evidence of automatic object tiering.`,
        calculationRationale: 'Infrequently accessed data in standard storage tiers incurs premium pricing. Exact savings requires object age inspection.',
        actionableSteps: [
          'Enable S3 Intelligent-Tiering or GCS Autoclass on large object buckets.',
          'Define lifecycle expiration rules for temporary data lake artifacts and raw logs older than 30 days.',
          'Abort incomplete multipart uploads.'
        ]
      });
    }
  }

  // Sort descending by priority score
  return recommendations.sort((a, b) => b.priorityScore - a.priorityScore);
}
