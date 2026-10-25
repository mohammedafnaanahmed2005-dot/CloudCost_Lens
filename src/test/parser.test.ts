import { describe, it, expect } from 'vitest';
import { parseBillingCsv } from '../engine/parser';
import { SAMPLE_BILLING_CSV } from '../data/sampleBilling';

describe('CSV Billing Parser & Validator', () => {
  it('parses valid standard billing records correctly', () => {
    const csv = `date,service,cost,currency,project
2026-10-01,Amazon EC2,100.50,USD,proj-1
2026-10-02,Amazon S3,25.00,USD,proj-2`;

    const result = parseBillingCsv(csv);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toBe(2);
    expect(result.records[0]).toMatchObject({
      rowNumber: 2,
      date: '2026-10-01',
      service: 'Amazon EC2',
      cost: 100.50,
      currency: 'USD',
      project: 'proj-1'
    });
  });

  it('correctly parses AWS CUR column headers', () => {
    const awsCsv = `lineItem/UsageStartDate,lineItem/ProductCode,lineItem/UnblendedCost,lineItem/CurrencyCode,lineItem/UsageAccountId
2026-10-01T00:00:00Z,AmazonEC2,45.20,USD,123456789012`;

    const result = parseBillingCsv(awsCsv);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toBe(1);
    expect(result.records[0].service).toBe('AmazonEC2');
    expect(result.records[0].cost).toBe(45.20);
    expect(result.records[0].date).toBe('2026-10-01');
  });

  it('reports source row number when date is malformed', () => {
    const csv = `date,service,cost,currency
2026-10-01,EC2,10.00,USD
invalid-date,S3,15.00,USD
2026-10-03,RDS,20.00,USD`;

    const result = parseBillingCsv(csv);
    expect(result.validRows).toBe(2);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].rowNumber).toBe(3); // Line 3 in source file
    expect(result.errors[0].column).toBe('date');
  });

  it('distinguishes missing cost from genuine zero cost', () => {
    const csv = `date,service,cost,currency
2026-10-01,EC2,0,USD
2026-10-02,S3,,USD`;

    const result = parseBillingCsv(csv);
    expect(result.validRows).toBe(1);
    expect(result.records[0].cost).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].rowNumber).toBe(3);
    expect(result.errors[0].message).toContain('Missing values cannot be treated as zero');
  });

  it('rejects negative cost amounts with clear error', () => {
    const csv = `date,service,cost,currency
2026-10-01,EC2,-45.50,USD`;

    const result = parseBillingCsv(csv);
    expect(result.validRows).toBe(0);
    expect(result.errors).toHaveLength(1);
    expect(result.errors[0].message).toContain('negative');
  });

  it('detects and flags duplicate records without silent duplication', () => {
    const csv = `date,service,cost,currency,project
2026-10-01,EC2,50.00,USD,core
2026-10-01,EC2,50.00,USD,core`;

    const result = parseBillingCsv(csv, { deduplicate: true });
    expect(result.validRows).toBe(1);
    expect(result.duplicateRowsCount).toBe(1);
    expect(result.warnings.some(w => w.column === 'duplicate')).toBe(true);
  });

  it('detects multi-currency datasets and issues warning', () => {
    const csv = `date,service,cost,currency
2026-10-01,EC2,50.00,USD
2026-10-01,S3,40.00,EUR`;

    const result = parseBillingCsv(csv);
    expect(result.hasMultiCurrency).toBe(true);
    expect(result.currencies).toEqual(['USD', 'EUR']);
    expect(result.warnings.some(w => w.column === 'currency')).toBe(true);
  });

  it('gracefully handles empty CSV and missing headers', () => {
    const emptyResult = parseBillingCsv('');
    expect(emptyResult.errors[0].message).toContain('empty');

    const noHeadersResult = parseBillingCsv('random,junk,columns\n1,2,3');
    expect(noHeadersResult.errors[0].message).toContain('Missing required billing columns');
  });

  it('parses the full multi-week sample dataset cleanly', () => {
    const result = parseBillingCsv(SAMPLE_BILLING_CSV);
    expect(result.errors).toHaveLength(0);
    expect(result.validRows).toBeGreaterThan(100);
    expect(result.currencies).toEqual(['USD']);
  });
});
