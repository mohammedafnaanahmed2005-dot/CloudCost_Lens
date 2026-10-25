import { AggregatedDaily, AggregatedProject, AggregatedService, AggregationSummary, BillingRecord } from './types';

export interface AggregationOptions {
  currencyFilter?: string; // If multi-currency, filter to primary
}

/**
 * Aggregates normalized billing records in O(n) time using HashMaps.
 */
export function aggregateBillingRecords(
  records: BillingRecord[],
  options: AggregationOptions = {}
): AggregationSummary {
  if (records.length === 0) {
    return {
      totalCost: 0,
      currency: options.currencyFilter || 'USD',
      currenciesFound: [],
      dateRange: null,
      totalDays: 0,
      uniqueServicesCount: 0,
      uniqueProjectsCount: 0,
      dailySpend: [],
      serviceSpend: [],
      projectSpend: []
    };
  }

  // Detect currencies
  const currencySet = new Set<string>();
  for (let i = 0; i < records.length; i++) {
    currencySet.add(records[i].currency);
  }
  const currenciesFound = Array.from(currencySet);
  const activeCurrency = options.currencyFilter || currenciesFound[0] || 'USD';

  // Filter records to active currency to prevent combining different currencies
  const filteredRecords = records.filter(r => r.currency === activeCurrency);

  let totalCost = 0;
  const dailyMap = new Map<string, { cost: number; recordCount: number; services: Map<string, number> }>();
  const serviceMap = new Map<string, { cost: number; recordCount: number }>();
  const projectMap = new Map<string, { cost: number; recordCount: number }>();

  let minDate = filteredRecords[0]?.date || '';
  let maxDate = filteredRecords[0]?.date || '';

  // Single O(n) pass
  for (let i = 0; i < filteredRecords.length; i++) {
    const rec = filteredRecords[i];
    const { date, service, cost, project } = rec;

    totalCost += cost;

    // Date range
    if (date < minDate) minDate = date;
    if (date > maxDate) maxDate = date;

    // Daily grouping
    let dayEntry = dailyMap.get(date);
    if (!dayEntry) {
      dayEntry = { cost: 0, recordCount: 0, services: new Map<string, number>() };
      dailyMap.set(date, dayEntry);
    }
    dayEntry.cost += cost;
    dayEntry.recordCount += 1;
    dayEntry.services.set(service, (dayEntry.services.get(service) || 0) + cost);

    // Service grouping
    let sEntry = serviceMap.get(service);
    if (!sEntry) {
      sEntry = { cost: 0, recordCount: 0 };
      serviceMap.set(service, sEntry);
    }
    sEntry.cost += cost;
    sEntry.recordCount += 1;

    // Project grouping
    const projName = project || 'Unassigned / Default';
    let pEntry = projectMap.get(projName);
    if (!pEntry) {
      pEntry = { cost: 0, recordCount: 0 };
      projectMap.set(projName, pEntry);
    }
    pEntry.cost += cost;
    pEntry.recordCount += 1;
  }

  // Build sorted daily spend
  const sortedDates = Array.from(dailyMap.keys()).sort();
  const dailySpend: AggregatedDaily[] = sortedDates.map(date => {
    const entry = dailyMap.get(date)!;
    const servicesObj: Record<string, number> = {};
    entry.services.forEach((c, s) => {
      servicesObj[s] = Number(c.toFixed(2));
    });
    return {
      date,
      cost: Number(entry.cost.toFixed(2)),
      recordCount: entry.recordCount,
      services: servicesObj
    };
  });

  const totalDays = dailySpend.length;

  // Build sorted service breakdown
  const serviceSpend: AggregatedService[] = Array.from(serviceMap.entries())
    .map(([service, entry]) => ({
      service,
      cost: Number(entry.cost.toFixed(2)),
      percentage: totalCost > 0 ? Number(((entry.cost / totalCost) * 100).toFixed(1)) : 0,
      recordCount: entry.recordCount,
      dailyAverage: totalDays > 0 ? Number((entry.cost / totalDays).toFixed(2)) : entry.cost
    }))
    .sort((a, b) => b.cost - a.cost);

  // Build sorted project breakdown
  const projectSpend: AggregatedProject[] = Array.from(projectMap.entries())
    .map(([project, entry]) => ({
      project,
      cost: Number(entry.cost.toFixed(2)),
      percentage: totalCost > 0 ? Number(((entry.cost / totalCost) * 100).toFixed(1)) : 0,
      recordCount: entry.recordCount
    }))
    .sort((a, b) => b.cost - a.cost);

  // Spending change indicator (e.g. second half of days vs first half)
  let previousPeriodChange: { absolute: number; percentage: number } | undefined = undefined;
  if (dailySpend.length >= 4) {
    const half = Math.floor(dailySpend.length / 2);
    const firstHalfCost = dailySpend.slice(0, half).reduce((sum, d) => sum + d.cost, 0);
    const secondHalfCost = dailySpend.slice(half).reduce((sum, d) => sum + d.cost, 0);
    const diff = secondHalfCost - firstHalfCost;
    const pct = firstHalfCost > 0 ? (diff / firstHalfCost) * 100 : (secondHalfCost > 0 ? 100 : 0);
    previousPeriodChange = {
      absolute: Number(diff.toFixed(2)),
      percentage: Number(pct.toFixed(1))
    };
  }

  return {
    totalCost: Number(totalCost.toFixed(2)),
    currency: activeCurrency,
    currenciesFound,
    dateRange: minDate && maxDate ? { start: minDate, end: maxDate } : null,
    totalDays,
    uniqueServicesCount: serviceSpend.length,
    uniqueProjectsCount: projectSpend.length,
    dailySpend,
    serviceSpend,
    projectSpend,
    previousPeriodChange
  };
}
