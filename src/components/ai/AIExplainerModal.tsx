import React, { useState } from 'react';
import { AggregationSummary, AnomalyAlert, ForecastResult, Recommendation } from '../../engine/types';
import { X, Bot, Sparkles, Shield, AlertCircle, Copy, Check } from 'lucide-react';

interface AIExplainerModalProps {
  isOpen: boolean;
  onClose: () => void;
  summary: AggregationSummary;
  anomalies: AnomalyAlert[];
  forecast: ForecastResult;
  recommendations: Recommendation[];
}

const DEFAULT_API_KEY = (import.meta.env.VITE_GEMINI_API_KEY as string) || '';

export const AIExplainerModal: React.FC<AIExplainerModalProps> = ({
  isOpen,
  onClose,
  summary,
  anomalies,
  forecast,
  recommendations
}) => {
  const [hasConsent, setHasConsent] = useState<boolean>(false);
  const [apiKey, setApiKey] = useState<string>(DEFAULT_API_KEY);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleGenerateBriefing = async () => {
    if (!hasConsent) return;
    setIsLoading(true);
    setErrorMsg(null);

    // Build strictly aggregated, anonymized prompt (zero raw line items)
    const topServices = summary.serviceSpend.slice(0, 3).map(s => `${s.service}: $${s.cost.toFixed(2)} (${s.percentage}%)`).join(', ');
    const anomalySummary = anomalies.length > 0
      ? `${anomalies.length} potential anomalies detected, leading spike on ${anomalies[0].service} on ${anomalies[0].date} (+$${anomalies[0].deltaCost} vs baseline).`
      : 'Zero anomalies detected.';
    const topRec = recommendations[0] ? `${recommendations[0].title} (Priority Score: ${recommendations[0].priorityScore}/100)` : 'None';

    const promptText = `You are a senior Cloud FinOps Architect. Analyze these aggregated cloud billing metrics and provide a concise, high-impact Executive FinOps Briefing in GitHub Markdown format:
- Observed Period Spend: $${summary.totalCost.toFixed(2)} ${summary.currency} across ${summary.totalDays} days.
- Top Services: ${topServices}
- Anomaly Findings: ${anomalySummary}
- End-of-Month Run-Rate Forecast: $${forecast.runRateForecast.toFixed(2)} (Recent trend projection: $${forecast.recentTrendForecast.toFixed(2)})
- Top Priority Recommendation: ${topRec}

Include:
1. Executive Summary (2 sentences)
2. Cost Anomaly & Risk Analysis
3. High-Leverage Remediation Plan for DevOps/FinOps
Keep it professional, grounded in the provided numbers, and avoid generic fluff.`;

    try {
      // Call Google Generative Language API
      // Try gemma-4-26b-a4b-it or gemini-2.5-flash endpoint
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey.trim()}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }]
          })
        }
      );

      if (!response.ok) {
        // Fallback to gemma model or local deterministic briefing
        const errJson = await response.json().catch(() => null);
        throw new Error(errJson?.error?.message || `API HTTP ${response.status}`);
      }

      const data = await response.json();
      const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;
      if (generatedText) {
        setAiResponse(generatedText);
      } else {
        throw new Error('No candidate response text returned from AI endpoint.');
      }
    } catch (err: any) {
      // Graceful local deterministic fallback briefing if external API rejects or quota is reached
      setErrorMsg(`Cloud AI call returned: ${err.message}. Displaying local algorithmic FinOps synthesis:`);
      setAiResponse(`### Executive FinOps Synthesis (Deterministic Fallback)

**1. Executive Summary**
During the ${summary.totalDays}-day observed billing window, infrastructure expenditures totaled **$${summary.totalCost.toFixed(2)} ${summary.currency}** with an average burn rate of **$${(summary.totalCost / (summary.totalDays || 1)).toFixed(2)}/day**. Projections estimate end-of-month spend at **$${forecast.runRateForecast.toFixed(2)}**.

**2. Cost Anomaly & Risk Analysis**
${anomalies.length > 0 
  ? `* **Outlier Alert**: Detected ${anomalies.length} statistical anomaly occurrences. Primary driver: **${anomalies[0].service}** spiked by +$${anomalies[0].deltaCost.toFixed(2)} on ${anomalies[0].date} with a robust score R=${anomalies[0].robustScore} (threshold: 3.5).\n* **Dominant Risk**: ${summary.serviceSpend[0]?.service} accounts for ${summary.serviceSpend[0]?.percentage}% of total costs.`
  : `* **Operational Stability**: Spending variation remained within acceptable variance bounds (R ≤ 3.5).`}

**3. Actionable Remediation Plan**
* **Investigate High-Leverage Services**: ${recommendations[0]?.actionableSteps?.[0] || 'Audit compute instances and autoscaling configurations.'}
* **Tagging & Resource Accountability**: Ensure all workloads have valid project tags to prevent untracked orphaned resources.`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (aiResponse) {
      navigator.clipboard.writeText(aiResponse);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-gradient-to-tr from-purple-600 to-indigo-600 text-white rounded-lg shadow-md shadow-purple-600/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Gemma / Gemini FinOps AI Briefing</h3>
              <p className="text-xs text-gray-400">Synthesize cost anomalies and forecasts into an executive briefing</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Privacy & Consent Banner */}
          <div className="p-4 rounded-xl bg-gray-900/80 border border-gray-800 space-y-3">
            <div className="flex items-start gap-2.5">
              <Shield className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <div className="text-xs text-gray-300">
                <strong className="text-white">Strict FinOps Data Privacy Protocol:</strong> No raw billing rows or internal resource IDs are ever transmitted. Only aggregated statistical summaries (total cost, service percentage, robust score) are formatted.
              </div>
            </div>

            <label className="flex items-center gap-2 text-xs text-gray-200 cursor-pointer pt-2 border-t border-gray-800">
              <input
                type="checkbox"
                checked={hasConsent}
                onChange={(e) => setHasConsent(e.target.checked)}
                className="w-4 h-4 rounded bg-gray-800 border-gray-700 text-blue-600 accent-blue-500 cursor-pointer"
              />
              <span>I give explicit consent to send high-level aggregated metrics for AI analysis.</span>
            </label>
          </div>

          {/* Model & Key Configuration */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-gray-400 uppercase tracking-wider block">
              Google GenAI / Gemma API Key
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder="API Key..."
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-xs font-mono text-white focus:outline-none focus:border-purple-500"
            />
            <p className="text-[11px] text-gray-500">Configured with your supplied Google GenAI hackathon key.</p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3 rounded-lg bg-amber-950/30 border border-amber-800/40 text-xs text-amber-300 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Result Output */}
          {aiResponse && (
            <div className="p-4 rounded-xl bg-gray-900/90 border border-purple-800/40 space-y-2 relative">
              <div className="flex items-center justify-between border-b border-gray-800 pb-2">
                <span className="text-xs font-bold text-purple-400 flex items-center gap-1.5">
                  <Bot className="w-4 h-4" /> AI Executive Briefing
                </span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1 text-[11px] text-gray-400 hover:text-white transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied' : 'Copy Briefing'}</span>
                </button>
              </div>
              <div className="text-xs text-gray-200 whitespace-pre-wrap font-sans leading-relaxed pt-1">
                {aiResponse}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#0B0F19]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white rounded-lg transition"
          >
            Close
          </button>

          <button
            onClick={handleGenerateBriefing}
            disabled={!hasConsent || isLoading}
            className={`px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg transition ${
              hasConsent && !isLoading
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white shadow-purple-600/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <Sparkles className="w-4 h-4" />
            <span>{isLoading ? 'Synthesizing Briefing...' : 'Generate AI Briefing'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
