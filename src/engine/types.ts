export interface BillingRecord {
  id: string;
  rowNumber: number;
  date: string; // YYYY-MM-DD
  service: string;
  cost: number;
  currency: string;
  project?: string;
  resourceId?: string;
  region?: string;
}

export interface ValidationError {
  rowNumber: number;
  column: string;
  value: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ParseResult {
  records: BillingRecord[];
  errors: ValidationError[];
  warnings: ValidationError[];
  currencies: string[];
  totalRows: number;
  validRows: number;
  duplicateRowsCount: number;
  hasMultiCurrency: boolean;
  dateRange: { start: string; end: string } | null;
}

export interface AggregatedDaily {
  date: string;
  cost: number;
  recordCount: number;
  services: Record<string, number>;
}

export interface AggregatedService {
  service: string;
  cost: number;
  percentage: number;
  recordCount: number;
  dailyAverage: number;
}

export interface AggregatedProject {
  project: string;
  cost: number;
  percentage: number;
  recordCount: number;
}

export interface AggregationSummary {
  totalCost: number;
  currency: string;
  currenciesFound: string[];
  dateRange: { start: string; end: string } | null;
  totalDays: number;
  uniqueServicesCount: number;
  uniqueProjectsCount: number;
  dailySpend: AggregatedDaily[];
  serviceSpend: AggregatedService[];
  projectSpend: AggregatedProject[];
  previousPeriodChange?: {
    absolute: number;
    percentage: number;
  };
}

export interface AnomalyAlert {
  id: string;
  date: string;
  service?: string; // If service-specific or 'all'
  currentSpend: number;
  baselineMedian: number;
  mad: number;
  robustScore: number;
  threshold: number;
  deltaCost: number;
  historicalSampleSize: number;
  reason: string;
  severity: 'high' | 'medium' | 'low';
}

export interface ForecastResult {
  observedCost: number;
  elapsedDays: number;
  totalPeriodDays: number;
  remainingDays: number;
  runRateForecast: number;
  recentAverageDaily: number;
  recentTrendForecast: number;
  dailyAverageOverall: number;
  uncertaintyRange: {
    low: number;
    high: number;
  };
  method: 'run-rate' | 'recent-daily-average';
  assumptions: string[];
  dataCoveragePercentage: number;
}

export interface Recommendation {
  id: string;
  title: string;
  service: string;
  category: 'spike' | 'dominance' | 'budget_overrun' | 'growth' | 'investigation';
  priorityScore: number; // 0 to 100
  impact: number; // 0 to 100
  severity: number; // 0 to 100
  confidence: number; // 0 to 100
  estimatedPotentialSavings?: number;
  savingsRequiresInvestigation: boolean;
  evidence: string;
  calculationRationale: string;
  actionableSteps: string[];
}

export interface BudgetConfig {
  monthlyBudget: number;
  currency: string;
  alertThresholdPercentage: number; // default 80%
}

export interface BudgetUtilization {
  configuredBudget: number;
  observedCost: number;
  utilizationPercentage: number;
  forecastCost: number;
  forecastUtilizationPercentage: number;
  isOverBudget: boolean;
  isProjectedOverBudget: boolean;
  remainingBudget: number;
  currency: string;
}
