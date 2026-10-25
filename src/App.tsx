import { useState, useMemo, useCallback } from 'react';
import { SAMPLE_BILLING_CSV, SECOND_DEMO_CSV } from './data/sampleBilling';
import { parseBillingCsv } from './engine/parser';
import { aggregateBillingRecords } from './engine/aggregator';
import { calculateBudgetUtilization, DEFAULT_BUDGET_CONFIG } from './engine/budget';
import { detectAnomalies } from './engine/anomaly';
import { calculateForecast } from './engine/forecast';
import { generateRecommendations } from './engine/recommendations';
import { BudgetConfig, ParseResult } from './engine/types';
import { Navbar } from './components/layout/Navbar';
import { OverviewCards } from './components/overview/OverviewCards';
import { DailySpendChart } from './components/charts/DailySpendChart';
import { ServiceBreakdownChart } from './components/charts/ServiceBreakdownChart';
import { ServiceTable } from './components/tables/ServiceTable';
import { AnomalyPanel } from './components/anomalies/AnomalyPanel';
import { ForecastPanel } from './components/forecast/ForecastPanel';
import { RecommendationsList } from './components/recommendations/RecommendationsList';
import { FilterBar } from './components/filters/FilterBar';
import { UploadModal } from './components/upload/UploadModal';
import { BudgetModal } from './components/budget/BudgetModal';
import { AIExplainerModal } from './components/ai/AIExplainerModal';
import { AlertTriangle, TrendingUp, PieChart, ShieldAlert } from 'lucide-react';

export default function App() {
  const [csvText, setCsvText] = useState<string>(SAMPLE_BILLING_CSV);
  const [isDemoData, setIsDemoData] = useState<boolean>(true);
  const [budgetConfig, setBudgetConfig] = useState<BudgetConfig>(DEFAULT_BUDGET_CONFIG);

  // Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedService, setSelectedService] = useState<string>('all');
  const [selectedProject, setSelectedProject] = useState<string>('all');

  // Modals state
  const [isUploadOpen, setIsUploadOpen] = useState<boolean>(false);
  const [isBudgetOpen, setIsBudgetOpen] = useState<boolean>(false);
  const [isAIOpen, setIsAIOpen] = useState<boolean>(false);

  // 1. Parse CSV & Validate Schema
  const parseResult = useMemo(() => {
    return parseBillingCsv(csvText);
  }, [csvText]);

  // Extract unique filters
  const allServices = useMemo(() => {
    const set = new Set<string>();
    parseResult.records.forEach(r => set.add(r.service));
    return Array.from(set).sort();
  }, [parseResult.records]);

  const allProjects = useMemo(() => {
    const set = new Set<string>();
    parseResult.records.forEach(r => {
      if (r.project) set.add(r.project);
    });
    return Array.from(set).sort();
  }, [parseResult.records]);

  // 2. Filter records
  const filteredRecords = useMemo(() => {
    return parseResult.records.filter(r => {
      if (selectedService !== 'all' && r.service !== selectedService) return false;
      if (selectedProject !== 'all' && r.project !== selectedProject) return false;
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesService = r.service.toLowerCase().includes(q);
        const matchesProject = r.project ? r.project.toLowerCase().includes(q) : false;
        const matchesResource = r.resourceId ? r.resourceId.toLowerCase().includes(q) : false;
        if (!matchesService && !matchesProject && !matchesResource) return false;
      }
      return true;
    });
  }, [parseResult.records, selectedService, selectedProject, searchQuery]);

  // 3. Aggregate billing records in O(n)
  const summary = useMemo(() => {
    return aggregateBillingRecords(filteredRecords);
  }, [filteredRecords]);

  // 4. Statistical anomaly detection (Median + MAD)
  const anomalies = useMemo(() => {
    return detectAnomalies(summary.dailySpend, filteredRecords);
  }, [summary.dailySpend, filteredRecords]);

  // 5. Transparent end-of-month forecast
  const forecast = useMemo(() => {
    return calculateForecast(summary.dailySpend);
  }, [summary.dailySpend]);

  // 6. Budget calculations
  const budgetInfo = useMemo(() => {
    return calculateBudgetUtilization(summary.totalCost, forecast.runRateForecast, budgetConfig);
  }, [summary.totalCost, forecast.runRateForecast, budgetConfig]);

  // 7. Evidence-based recommendations
  const recommendations = useMemo(() => {
    return generateRecommendations(summary, anomalies, budgetInfo);
  }, [summary, anomalies, budgetInfo]);

  // Handlers
  const handleLoadDemo = useCallback(() => {
    setCsvText(SAMPLE_BILLING_CSV);
    setIsDemoData(true);
    setSelectedService('all');
    setSelectedProject('all');
    setSearchQuery('');
  }, []);

  const handleLoadSecondary = useCallback(() => {
    setCsvText(SECOND_DEMO_CSV);
    setIsDemoData(true);
    setSelectedService('all');
    setSelectedProject('all');
    setSearchQuery('');
  }, []);

  const handleClear = useCallback(() => {
    setCsvText('');
    setIsDemoData(false);
  }, []);

  const handleImport = useCallback((_parsed: ParseResult, rawContent: string) => {
    setCsvText(rawContent);
    setIsDemoData(false);
    setSelectedService('all');
    setSelectedProject('all');
    setSearchQuery('');
  }, []);

  const handleExportCsv = useCallback(() => {
    if (summary.dailySpend.length === 0) return;
    const header = 'Date,Total Cost,Record Count\n';
    const rows = summary.dailySpend.map(d => `${d.date},${d.cost},${d.recordCount}`).join('\n');
    const blob = new Blob([header + rows], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `cloudcost_summary_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [summary.dailySpend]);

  const hasActiveFilters = selectedService !== 'all' || selectedProject !== 'all' || searchQuery !== '';

  const handleResetFilters = useCallback(() => {
    setSelectedService('all');
    setSelectedProject('all');
    setSearchQuery('');
  }, []);

  return (
    <div className="min-h-screen bg-[#0B0F19] text-slate-100 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      {/* Top Navbar */}
      <Navbar
        onOpenUpload={() => setIsUploadOpen(true)}
        onOpenBudget={() => setIsBudgetOpen(true)}
        onOpenAI={() => setIsAIOpen(true)}
        onLoadDemo={handleLoadDemo}
        onLoadSecondary={handleLoadSecondary}
        onClear={handleClear}
        recordCount={parseResult.validRows}
        currency={summary.currency}
        isDemoData={isDemoData}
      />

      {/* Main Dashboard Layout */}
      <main className="flex-1 max-w-7xl mx-auto w-full p-4 sm:p-6 space-y-6">
        {/* Multi-Currency or Syntax Warning Banner */}
        {parseResult.hasMultiCurrency && (
          <div className="p-4 rounded-xl bg-amber-950/40 border border-amber-800/60 flex items-start gap-3 shadow-lg">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs">
              <p className="font-bold text-amber-200">Multi-Currency Dataset Detected</p>
              <p className="text-amber-300/90 mt-0.5">
                Records contain multiple currencies ({parseResult.currencies.join(', ')}). 
                Displaying totals normalized to primary currency ({summary.currency}) to avoid invalid arithmetic.
              </p>
            </div>
          </div>
        )}

        {parseResult.errors.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-950/40 border border-rose-800/60 flex items-start justify-between gap-3 shadow-lg">
            <div className="flex items-start gap-3 text-xs">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-rose-200">
                  {parseResult.errors.length} Invalid Billing Rows Detected
                </p>
                <p className="text-rose-300/90 mt-0.5">
                  Malformed lines were excluded from analytics while preserving source row numbers.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsUploadOpen(true)}
              className="text-xs underline text-rose-300 hover:text-white shrink-0"
            >
              Inspect Errors
            </button>
          </div>
        )}

        {/* Empty State */}
        {parseResult.validRows === 0 ? (
          <div className="p-12 rounded-2xl bg-[#111827] border border-gray-800 text-center space-y-4 shadow-xl">
            <div className="p-4 rounded-full bg-blue-600/10 text-blue-400 w-16 h-16 mx-auto flex items-center justify-center">
              <TrendingUp className="w-8 h-8" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">No Cloud Billing Data Loaded</h2>
              <p className="text-xs text-gray-400 max-w-md mx-auto mt-1">
                Upload a CSV billing export from AWS, GCP, or standard format, or instantly load our 21-day demonstration dataset.
              </p>
            </div>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleLoadDemo}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-lg transition"
              >
                Load 21-Day Demo Dataset
              </button>
              <button
                onClick={() => setIsUploadOpen(true)}
                className="px-4 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition"
              >
                Upload CSV File
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* KPI Cards */}
            <OverviewCards
              summary={summary}
              budgetInfo={budgetInfo}
              anomalyCount={anomalies.length}
            />

            {/* Filter and Search Bar */}
            <FilterBar
              searchQuery={searchQuery}
              onSearchChange={setSearchQuery}
              selectedService={selectedService}
              onServiceChange={setSelectedService}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
              services={allServices}
              projects={allProjects}
              onExportCsv={handleExportCsv}
              onResetFilters={handleResetFilters}
              hasActiveFilters={hasActiveFilters}
            />

            {/* Visual Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Daily Spend Timeline (2 cols) */}
              <div className="lg:col-span-2 p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-400" /> Daily Expenditure Trend
                    </h3>
                    <p className="text-xs text-gray-400">Time-series cost trajectory with red anomaly indicators</p>
                  </div>
                  <span className="text-xs text-gray-400 font-mono">
                    {summary.dailySpend.length} days
                  </span>
                </div>
                <DailySpendChart
                  dailySpend={summary.dailySpend}
                  anomalies={anomalies}
                  currency={summary.currency}
                />
              </div>

              {/* Service Cost Breakdown (1 col) */}
              <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <PieChart className="w-4 h-4 text-purple-400" /> Service Breakdown
                    </h3>
                    <p className="text-xs text-gray-400">Share of total bill by cloud service</p>
                  </div>
                </div>
                <ServiceBreakdownChart
                  serviceSpend={summary.serviceSpend}
                  currency={summary.currency}
                />
              </div>
            </div>

            {/* Analytics Grid: Anomalies & Forecasts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <AnomalyPanel
                anomalies={anomalies}
                currency={summary.currency}
              />
              <ForecastPanel
                forecast={forecast}
                currency={summary.currency}
              />
            </div>

            {/* Prioritized Recommendations */}
            <RecommendationsList
              recommendations={recommendations}
              currency={summary.currency}
            />

            {/* Ranked Service Table */}
            <ServiceTable
              services={summary.serviceSpend}
              currency={summary.currency}
              onSelectService={(svc) => setSelectedService(svc)}
            />
          </>
        )}
      </main>

      {/* Upload Modal */}
      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onImport={handleImport}
      />

      {/* Budget Modal */}
      <BudgetModal
        isOpen={isBudgetOpen}
        onClose={() => setIsBudgetOpen(false)}
        config={budgetConfig}
        onSave={setBudgetConfig}
      />

      {/* AI Explainer Modal */}
      <AIExplainerModal
        isOpen={isAIOpen}
        onClose={() => setIsAIOpen(false)}
        summary={summary}
        anomalies={anomalies}
        forecast={forecast}
        recommendations={recommendations}
      />
    </div>
  );
}
