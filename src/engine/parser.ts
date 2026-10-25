import Papa from 'papaparse';
import { BillingRecord, ParseResult, ValidationError } from './types';
import { detectColumnMapping, normalizeCost, normalizeCurrency, normalizeDate } from './schema';

export interface ParseOptions {
  deduplicate?: boolean;
  defaultCurrency?: string;
}

/**
 * Parses raw CSV content into typed, validated BillingRecords.
 * Preserves source row numbers and reports all errors and warnings without silent discards.
 */
export function parseBillingCsv(
  csvContent: string,
  options: ParseOptions = { deduplicate: true, defaultCurrency: 'USD' }
): ParseResult {
  const errors: ValidationError[] = [];
  const warnings: ValidationError[] = [];
  const validRecords: BillingRecord[] = [];
  const seenHashes = new Set<string>();
  let duplicateCount = 0;

  if (!csvContent || csvContent.trim() === '') {
    return {
      records: [],
      errors: [{
        rowNumber: 1,
        column: 'file',
        value: '',
        message: 'The uploaded CSV file is empty.',
        severity: 'error'
      }],
      warnings: [],
      currencies: [],
      totalRows: 0,
      validRows: 0,
      duplicateRowsCount: 0,
      hasMultiCurrency: false,
      dateRange: null
    };
  }

  const parsed = Papa.parse<Record<string, unknown>>(csvContent, {
    header: true,
    skipEmptyLines: 'greedy',
    transformHeader: (header) => header.trim()
  });

  if (parsed.errors && parsed.errors.length > 0) {
    for (const pe of parsed.errors) {
      errors.push({
        rowNumber: (pe.row !== undefined ? pe.row + 2 : 1), // 1-based, +1 for header
        column: 'syntax',
        value: pe.code,
        message: `CSV Syntax Error: ${pe.message}`,
        severity: 'error'
      });
    }
  }

  const headers = parsed.meta.fields || [];
  if (headers.length === 0) {
    return {
      records: [],
      errors: [{
        rowNumber: 1,
        column: 'headers',
        value: '',
        message: 'Could not detect column headers in CSV file.',
        severity: 'error'
      }],
      warnings: [],
      currencies: [],
      totalRows: 0,
      validRows: 0,
      duplicateRowsCount: 0,
      hasMultiCurrency: false,
      dateRange: null
    };
  }

  const mapping = detectColumnMapping(headers);
  if (!mapping) {
    return {
      records: [],
      errors: [{
        rowNumber: 1,
        column: 'headers',
        value: headers.join(', '),
        message: `Missing required billing columns. CSV must contain identifiable columns for date, service, and cost. Found: [${headers.join(', ')}]`,
        severity: 'error'
      }],
      warnings: [],
      currencies: [],
      totalRows: parsed.data.length,
      validRows: 0,
      duplicateRowsCount: 0,
      hasMultiCurrency: false,
      dateRange: null
    };
  }

  const currenciesFound = new Set<string>();
  let minDate: string | null = null;
  let maxDate: string | null = null;

  // Process rows
  parsed.data.forEach((row, index) => {
    const rowNumber = index + 2; // Line 1 is header
    const rawDate = row[mapping.dateCol];
    const rawService = row[mapping.serviceCol];
    const rawCost = row[mapping.costCol];
    const rawCurrency = mapping.currencyCol ? row[mapping.currencyCol] : options.defaultCurrency;
    const rawProject = mapping.projectCol ? row[mapping.projectCol] : undefined;
    const rawResource = mapping.resourceIdCol ? row[mapping.resourceIdCol] : undefined;
    const rawRegion = mapping.regionCol ? row[mapping.regionCol] : undefined;

    // Check service
    const serviceName = rawService ? String(rawService).trim() : '';
    if (!serviceName) {
      errors.push({
        rowNumber,
        column: mapping.serviceCol,
        value: String(rawService ?? ''),
        message: 'Service name is missing or blank.',
        severity: 'error'
      });
      return;
    }

    // Validate Date
    const { date, error: dateError } = normalizeDate(rawDate, rowNumber);
    if (dateError) {
      errors.push(dateError);
      return;
    }

    // Validate Cost
    const { cost, error: costError } = normalizeCost(rawCost, rowNumber);
    if (costError) {
      errors.push(costError);
      return;
    }

    if (date === null || cost === null) {
      return;
    }

    // Currency
    const { currency, warning: currWarn } = normalizeCurrency(rawCurrency);
    if (currWarn) {
      warnings.push({
        rowNumber,
        column: mapping.currencyCol || 'currency',
        value: String(rawCurrency ?? ''),
        message: currWarn,
        severity: 'warning'
      });
    }
    currenciesFound.add(currency);

    const projectStr = rawProject ? String(rawProject).trim() : undefined;
    const resourceStr = rawResource ? String(rawResource).trim() : undefined;
    const regionStr = rawRegion ? String(rawRegion).trim() : undefined;

    // Duplicate detection
    const dedupeKey = `${date}|${serviceName}|${cost.toFixed(4)}|${currency}|${projectStr || ''}|${resourceStr || ''}`;
    if (seenHashes.has(dedupeKey)) {
      duplicateCount++;
      warnings.push({
        rowNumber,
        column: 'duplicate',
        value: dedupeKey,
        message: `Duplicate record detected on ${date} for ${serviceName} ($${cost}).`,
        severity: 'warning'
      });
      if (options.deduplicate) {
        return; // Skip duplicate insertion
      }
    } else {
      seenHashes.add(dedupeKey);
    }

    // Min / Max Date
    if (!minDate || date < minDate) minDate = date;
    if (!maxDate || date > maxDate) maxDate = date;

    validRecords.push({
      id: `rec-${rowNumber}-${dedupeKey.replace(/[^a-zA-Z0-9]/g, '_')}`,
      rowNumber,
      date,
      service: serviceName,
      cost,
      currency,
      project: projectStr,
      resourceId: resourceStr,
      region: regionStr
    });
  });

  const uniqueCurrencies = Array.from(currenciesFound);
  const hasMultiCurrency = uniqueCurrencies.length > 1;

  if (hasMultiCurrency) {
    warnings.push({
      rowNumber: 1,
      column: 'currency',
      value: uniqueCurrencies.join(', '),
      message: `Multiple currencies detected: [${uniqueCurrencies.join(', ')}]. Cross-currency amounts cannot be combined without exchange rate normalization.`,
      severity: 'warning'
    });
  }

  return {
    records: validRecords,
    errors,
    warnings,
    currencies: uniqueCurrencies,
    totalRows: parsed.data.length,
    validRows: validRecords.length,
    duplicateRowsCount: duplicateCount,
    hasMultiCurrency,
    dateRange: minDate && maxDate ? { start: minDate, end: maxDate } : null
  };
}
