import React from 'react';
import { Recommendation } from '../../engine/types';
import { Zap, CheckCircle2, AlertCircle, ArrowRight, ShieldAlert, Database, Layers } from 'lucide-react';

interface RecommendationsListProps {
  recommendations: Recommendation[];
  currency: string;
}

export const RecommendationsList: React.FC<RecommendationsListProps> = ({
  recommendations,
  currency
}) => {
  const getCategoryIcon = (category: Recommendation['category']) => {
    switch (category) {
      case 'spike':
        return <Zap className="w-4 h-4 text-amber-400" />;
      case 'budget_overrun':
        return <ShieldAlert className="w-4 h-4 text-rose-400" />;
      case 'growth':
        return <Database className="w-4 h-4 text-cyan-400" />;
      case 'dominance':
      default:
        return <Layers className="w-4 h-4 text-purple-400" />;
    }
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Prioritized Optimization Opportunities</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Ranked by priority score = 0.5 × Impact + 0.3 × Severity + 0.2 × Evidence Confidence (0–100 scale)
          </p>
        </div>
        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-500/10 text-blue-300 border border-blue-500/20">
          {recommendations.length} Actionable Recommendations
        </span>
      </div>

      {recommendations.length === 0 ? (
        <div className="p-8 text-center text-gray-500 space-y-2">
          <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto opacity-75" />
          <p className="text-sm font-semibold text-gray-200">No Immediate Critical Optimizations Identified</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            Resource spending patterns appear balanced across observed billing periods.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {recommendations.map((rec) => (
            <div
              key={rec.id}
              className="p-5 rounded-xl bg-gray-900/50 border border-gray-800 hover:border-gray-700 transition space-y-3"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-gray-800/80 border border-gray-700 shrink-0 mt-0.5">
                    {getCategoryIcon(rec.category)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h4 className="text-sm font-bold text-white">{rec.title}</h4>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-gray-800 text-gray-300 border border-gray-700">
                        {rec.service}
                      </span>
                    </div>
                    <p className="text-xs text-gray-400 mt-1">{rec.evidence}</p>
                  </div>
                </div>

                {/* Priority Score Badge */}
                <div className="flex sm:flex-col items-center sm:items-end justify-between shrink-0 border-t sm:border-t-0 border-gray-800/80 pt-2 sm:pt-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] uppercase font-bold text-gray-400">Priority Score:</span>
                    <span className={`text-sm font-mono font-extrabold px-2 py-0.5 rounded-lg border ${
                      rec.priorityScore >= 75
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                        : rec.priorityScore >= 50
                        ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                        : 'bg-blue-500/20 text-blue-300 border-blue-500/30'
                    }`}>
                      {rec.priorityScore}/100
                    </span>
                  </div>

                  {rec.estimatedPotentialSavings !== undefined ? (
                    <span className="text-xs font-mono font-semibold text-emerald-400 mt-1">
                      Est. Savings: ~${rec.estimatedPotentialSavings.toFixed(2)} {currency}
                    </span>
                  ) : (
                    <span className="text-[11px] text-gray-500 italic mt-1">
                      Requires workload utilization audit
                    </span>
                  )}
                </div>
              </div>

              {/* Formula Metric Breakdown */}
              <div className="flex items-center gap-3 text-[11px] text-gray-400 bg-gray-900/80 px-3 py-1.5 rounded-lg border border-gray-800/60 font-mono">
                <span>Impact: <strong className="text-white">{rec.impact}</strong>/100</span>
                <span>•</span>
                <span>Severity: <strong className="text-white">{rec.severity}</strong>/100</span>
                <span>•</span>
                <span>Evidence Confidence: <strong className="text-white">{rec.confidence}</strong>/100</span>
              </div>

              {/* Actionable Next Steps */}
              <div className="pt-2 border-t border-gray-800/60 space-y-1.5">
                <span className="text-[11px] uppercase font-bold text-gray-400 tracking-wider flex items-center gap-1">
                  <ArrowRight className="w-3 h-3 text-blue-400" /> Recommended Action Items:
                </span>
                <ul className="space-y-1 text-xs text-gray-300 pl-4">
                  {rec.actionableSteps.map((step, idx) => (
                    <li key={idx} className="list-disc list-outside">
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Rationale Disclosure */}
              <div className="text-[11px] text-gray-500 italic flex items-center gap-1.5">
                <AlertCircle className="w-3 h-3 shrink-0 text-gray-400" />
                <span>Rationale: {rec.calculationRationale}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
