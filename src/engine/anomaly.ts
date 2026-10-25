import { AggregatedDaily, AnomalyAlert, BillingRecord } from './types';

export interface AnomalyDetectionOptions {
  windowSize?: number; // default: 14 days
  robustThreshold?: number; // default: 3.5
  minDeltaCost?: number; // default: 15.00 (dollars)
  minHistoricalSamples?: number; // default: 7
}

/**
 * Calculates mathematical median of a number array.
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Calculates Median Absolute Deviation (MAD):
 * MAD = median(|x_i - median(x)|)
 */
export function calculateMAD(values: number[], median: number): number {
  if (values.length === 0) return 0;
  const deviations = values.map(v => Math.abs(v - median));
  return calculateMedian(deviations);
}

/**
 * Detects cost anomalies using Rolling Median and MAD.
 * Evaluates both total daily spend and service-specific spending trends.
 */
export function detectAnomalies(
  dailySpend: AggregatedDaily[],
  records: BillingRecord[] = [],
  options: AnomalyDetectionOptions = {}
): AnomalyAlert[] {
  const windowSize = options.windowSize ?? 14;
  const threshold = options.robustThreshold ?? 3.5;
  const minDelta = options.minDeltaCost ?? 15.0;
  const minSamples = options.minHistoricalSamples ?? 7;

  const alerts: AnomalyAlert[] = [];

  // 1. Overall Daily Spend Analysis
  for (let i = minSamples; i < dailySpend.length; i++) {
    const current = dailySpend[i];
    const startIndex = Math.max(0, i - windowSize);
    const windowHistory = dailySpend.slice(startIndex, i).map(d => d.cost);

    if (windowHistory.length < minSamples) continue;

    const m = calculateMedian(windowHistory);
    const mad = calculateMAD(windowHistory, m);
    const delta = current.cost - m;

    // Only flag spending spikes (increases), not drops
    if (delta >= minDelta) {
      if (mad > 0) {
        // Normal scale factor for standard normal distribution consistency: 1.4826
        const robustScore = Math.abs(current.cost - m) / (1.4826 * mad);
        if (robustScore > threshold) {
          alerts.push({
            id: `anomaly-total-${current.date}`,
            date: current.date,
            service: 'Total Cloud Spend',
            currentSpend: Number(current.cost.toFixed(2)),
            baselineMedian: Number(m.toFixed(2)),
            mad: Number(mad.toFixed(2)),
            robustScore: Number(robustScore.toFixed(2)),
            threshold,
            deltaCost: Number(delta.toFixed(2)),
            historicalSampleSize: windowHistory.length,
            reason: `Total daily spend of $${current.cost.toFixed(2)} exceeded baseline median ($${m.toFixed(2)}) with robust z-score R=${robustScore.toFixed(2)} (threshold: ${threshold}).`,
            severity: robustScore > 6 ? 'high' : 'medium'
          });
        }
      } else {
        // MAD == 0 fallback: historical spend was uniform
        if (m > 0 && current.cost >= 1.5 * m) {
          alerts.push({
            id: `anomaly-total-${current.date}-zeromad`,
            date: current.date,
            service: 'Total Cloud Spend',
            currentSpend: Number(current.cost.toFixed(2)),
            baselineMedian: Number(m.toFixed(2)),
            mad: 0,
            robustScore: 99.0, // Indeterminate / infinite robust score
            threshold,
            deltaCost: Number(delta.toFixed(2)),
            historicalSampleSize: windowHistory.length,
            reason: `Zero historical variance detected (MAD=0). Spend increased by ${((delta / m) * 100).toFixed(0)}% from flat baseline $${m.toFixed(2)}.`,
            severity: 'high'
          });
        }
      }
    }
  }

  // 2. Service-Specific Spend Analysis (Pinpoint the exact service causing the spike)
  if (records.length > 0) {
    // Group records by service then by date
    const serviceDateMap = new Map<string, Map<string, number>>();
    for (const r of records) {
      let sMap = serviceDateMap.get(r.service);
      if (!sMap) {
        sMap = new Map<string, number>();
        serviceDateMap.set(r.service, sMap);
      }
      sMap.set(r.date, (sMap.get(r.date) || 0) + r.cost);
    }

    const uniqueDates = dailySpend.map(d => d.date);

    serviceDateMap.forEach((dateCosts, service) => {
      // Build contiguous daily series for this service
      const series = uniqueDates.map(date => dateCosts.get(date) || 0);

      for (let i = minSamples; i < series.length; i++) {
        const currentDate = uniqueDates[i];
        const currentVal = series[i];
        const startIndex = Math.max(0, i - windowSize);
        const windowVals = series.slice(startIndex, i);

        if (windowVals.length < minSamples) continue;

        const m = calculateMedian(windowVals);
        const mad = calculateMAD(windowVals, m);
        const delta = currentVal - m;

        if (delta >= minDelta) {
          if (mad > 0) {
            const robustScore = Math.abs(currentVal - m) / (1.4826 * mad);
            if (robustScore > threshold) {
              alerts.push({
                id: `anomaly-svc-${service.replace(/[^a-zA-Z0-9]/g, '_')}-${currentDate}`,
                date: currentDate,
                service,
                currentSpend: Number(currentVal.toFixed(2)),
                baselineMedian: Number(m.toFixed(2)),
                mad: Number(mad.toFixed(2)),
                robustScore: Number(robustScore.toFixed(2)),
                threshold,
                deltaCost: Number(delta.toFixed(2)),
                historicalSampleSize: windowVals.length,
                reason: `${service} cost spiked to $${currentVal.toFixed(2)} (baseline median: $${m.toFixed(2)}, delta: +$${delta.toFixed(2)}, R=${robustScore.toFixed(2)}).`,
                severity: robustScore > 6 ? 'high' : 'medium'
              });
            }
          } else if (m > 0 && currentVal >= 1.5 * m) {
            alerts.push({
              id: `anomaly-svc-${service.replace(/[^a-zA-Z0-9]/g, '_')}-${currentDate}-zeromad`,
              date: currentDate,
              service,
              currentSpend: Number(currentVal.toFixed(2)),
              baselineMedian: Number(m.toFixed(2)),
              mad: 0,
              robustScore: 99.0,
              threshold,
              deltaCost: Number(delta.toFixed(2)),
              historicalSampleSize: windowVals.length,
              reason: `${service} experienced a surge with flat historical spend (MAD=0). Cost rose to $${currentVal.toFixed(2)} from $${m.toFixed(2)}.`,
              severity: 'high'
            });
          }
        }
      }
    });
  }

  // Sort alerts descending by date, then by severity/robust score
  return alerts.sort((a, b) => {
    if (b.date !== a.date) return b.date.localeCompare(a.date);
    return b.robustScore - a.robustScore;
  });
}
