import { ValidationError } from './types';

export interface ColumnMapping {
  dateCol: string;
  serviceCol: string;
  costCol: string;
  currencyCol?: string;
  projectCol?: string;
  resourceIdCol?: string;
  regionCol?: string;
  formatName: string;
}

const KNOWN_DATE_HEADERS = [
  'date', 'usage_date', 'usage_start_date', 'usage_start_time',
  'lineitem/usagestartdate', 'start_date', 'timestamp', 'day'
];

const KNOWN_SERVICE_HEADERS = [
  'service', 'service_name', 'service.description', 'product',
  'product_code', 'lineitem/productcode', 'product_name', 'servicename'
];

const KNOWN_COST_HEADERS = [
  'cost', 'unblended_cost', 'lineitem/unblendedcost', 'amount',
  'total_cost', 'cost($)', 'spend', 'net_cost', 'blended_cost'
];

const KNOWN_CURRENCY_HEADERS = [
  'currency', 'currency_code', 'lineitem/currencycode', 'iso_currency'
];

const KNOWN_PROJECT_HEADERS = [
  'project', 'project_id', 'project.id', 'account_id',
  'lineitem/usageaccountid', 'subscription_id', 'account', 'workspace'
];

const KNOWN_RESOURCE_HEADERS = [
  'resource_id', 'resourceid', 'lineitem/resourceid', 'resource', 'instance_id'
];

const KNOWN_REGION_HEADERS = [
  'region', 'location', 'product/region', 'zone'
];

/**
 * Detects CSV column mappings dynamically from raw header list.
 */
export function detectColumnMapping(headers: string[]): ColumnMapping | null {
  const normalizedHeaders = headers.map(h => ({
    raw: h,
    clean: h.trim().toLowerCase().replace(/[\s_-]+/g, '_')
  }));

  const findMatch = (candidates: string[]): string | undefined => {
    const direct = normalizedHeaders.find(h => candidates.includes(h.clean));
    if (direct) return direct.raw;

    // Substring fallback
    const fuzzy = normalizedHeaders.find(h => candidates.some(c => h.clean.includes(c)));
    return fuzzy?.raw;
  };

  const dateCol = findMatch(KNOWN_DATE_HEADERS);
  const serviceCol = findMatch(KNOWN_SERVICE_HEADERS);
  const costCol = findMatch(KNOWN_COST_HEADERS);

  if (!dateCol || !serviceCol || !costCol) {
    return null;
  }

  // Provider format identification
  let formatName = 'Standard CloudCost Lens Format';
  if (headers.some(h => h.startsWith('lineItem/'))) {
    formatName = 'AWS Cost and Usage Report (CUR)';
  } else if (headers.some(h => h.includes('service.description') || h.includes('usage_start_time'))) {
    formatName = 'Google Cloud Billing Export';
  }

  return {
    dateCol,
    serviceCol,
    costCol,
    currencyCol: findMatch(KNOWN_CURRENCY_HEADERS),
    projectCol: findMatch(KNOWN_PROJECT_HEADERS),
    resourceIdCol: findMatch(KNOWN_RESOURCE_HEADERS),
    regionCol: findMatch(KNOWN_REGION_HEADERS),
    formatName
  };
}

/**
 * Parses dates into standard YYYY-MM-DD.
 * Rejects invalid dates with structured error.
 */
export function normalizeDate(raw: unknown, rowNumber: number): { date: string | null; error?: ValidationError } {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return {
      date: null,
      error: {
        rowNumber,
        column: 'date',
        value: String(raw ?? ''),
        message: 'Date is missing or blank.',
        severity: 'error'
      }
    };
  }

  const str = String(raw).trim();
  // Standard ISO match YYYY-MM-DD
  const isoMatch = str.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    const year = parseInt(y, 10);
    const month = parseInt(m, 10);
    const day = parseInt(d, 10);

    if (year >= 1990 && year <= 2100 && month >= 1 && month <= 12 && day >= 1 && day <= 31) {
      const utcCheck = new Date(Date.UTC(year, month - 1, day));
      if (
        utcCheck.getUTCFullYear() === year &&
        utcCheck.getUTCMonth() === month - 1 &&
        utcCheck.getUTCDate() === day
      ) {
        return { date: `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}` };
      }
    }
  }

  return {
    date: null,
    error: {
      rowNumber,
      column: 'date',
      value: str,
      message: `Invalid date format '${str}'. Expected YYYY-MM-DD or parseable ISO date.`,
      severity: 'error'
    }
  };
}

/**
 * Validates and converts cost into non-negative finite float.
 * Distinguishes zero from missing data.
 */
export function normalizeCost(raw: unknown, rowNumber: number): { cost: number | null; error?: ValidationError } {
  if (raw === undefined || raw === null || String(raw).trim() === '') {
    return {
      cost: null,
      error: {
        rowNumber,
        column: 'cost',
        value: String(raw ?? ''),
        message: 'Cost value is missing. Missing values cannot be treated as zero.',
        severity: 'error'
      }
    };
  }

  const cleanStr = String(raw).trim().replace(/[$,]/g, '');
  const num = Number(cleanStr);

  if (isNaN(num) || !isFinite(num)) {
    return {
      cost: null,
      error: {
        rowNumber,
        column: 'cost',
        value: String(raw),
        message: `Cost value '${raw}' is not a valid numeric amount.`,
        severity: 'error'
      }
    };
  }

  if (num < 0) {
    return {
      cost: null,
      error: {
        rowNumber,
        column: 'cost',
        value: String(raw),
        message: `Cost amount ${num} is negative. Credits/refunds should be tracked in adjustment records.`,
        severity: 'error'
      }
    };
  }

  return { cost: num };
}

/**
 * Normalizes currency to 3-letter uppercase ISO code (defaults to USD if missing).
 */
export function normalizeCurrency(raw: unknown): { currency: string; warning?: string } {
  if (!raw || String(raw).trim() === '') {
    return { currency: 'USD', warning: 'Currency missing; defaulted to USD.' };
  }
  const clean = String(raw).trim().toUpperCase();
  if (/^[A-Z]{3}$/.test(clean)) {
    return { currency: clean };
  }
  return { currency: clean.slice(0, 3) || 'USD' };
}
