import React, { useState } from 'react';
import { AnomalyAlert } from '../../engine/types';
import { AlertTriangle, ChevronDown, ChevronUp, ShieldCheck, HelpCircle } from 'lucide-react';

interface AnomalyPanelProps {
  anomalies: AnomalyAlert[];
  currency: string;
}

export const AnomalyPanel: React.FC<AnomalyPanelProps> = ({
  anomalies,
  currency
}) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-800/80 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white">Statistical Anomaly Detection (Median + MAD)</h3>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            Flags potential spending outliers when robust score R = |x - m| / (1.4826 × MAD) exceeds 3.5
          </p>
        </div>
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${
          anomalies.length > 0
            ? 'bg-rose-500/10 text-rose-300 border-rose-500/20'
            : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/20'
        }`}>
          {anomalies.length > 0 ? `${anomalies.length} Potential Anomalies` : 'Zero Outliers Detected'}
        </span>
      </div>

      {anomalies.length === 0 ? (
        <div className="p-8 text-center text-gray-400 space-y-2">
          <ShieldCheck className="w-10 h-10 text-emerald-400 mx-auto opacity-75" />
          <p className="text-sm font-semibold text-gray-200">No Statistical Spending Outliers Flagged</p>
          <p className="text-xs text-gray-500 max-w-md mx-auto">
            All observed daily spend remained within normal variance bounds (R ≤ 3.5) across historical observations.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {anomalies.map((alert) => {
            const isExpanded = expandedId === alert.id;
            return (
              <div
                key={alert.id}
                className={`rounded-xl border transition-all ${
                  alert.severity === 'high'
                    ? 'bg-rose-950/20 border-rose-800/40 hover:border-rose-700/60'
                    : 'bg-amber-950/20 border-amber-800/40 hover:border-amber-700/60'
                }`}
              >
                <div
                  onClick={() => toggleExpand(alert.id)}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                >
                  <div className="flex items-start gap-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider shrink-0 mt-0.5 ${
                      alert.severity === 'high'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}>
                      {alert.severity} outlier
                    </span>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-white text-sm">{alert.service}</span>
                        <span className="text-xs text-gray-400 font-mono">({alert.date})</span>
                      </div>
                      <p className="text-xs text-gray-300 mt-1">{alert.reason}</p>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0 border-t sm:border-t-0 border-gray-800 pt-2 sm:pt-0">
                    <div className="text-right">
                      <p className="font-mono text-sm font-bold text-white">
                        ${alert.currentSpend.toFixed(2)}
                      </p>
                      <p className="text-[11px] font-mono text-rose-400">
                        +${alert.deltaCost.toFixed(2)} vs baseline
                      </p>
                    </div>
                    <button className="text-gray-400 hover:text-white p-1">
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Mathematical Proof Drawer */}
                {isExpanded && (
                  <div className="px-4 pb-4 pt-1 border-t border-gray-800/60 text-xs space-y-3 bg-gray-900/40 rounded-b-xl">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2">
                      <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800">
                        <span className="text-[10px] uppercase font-semibold text-gray-400">Baseline Median (m)</span>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          ${alert.baselineMedian.toFixed(2)} {currency}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800">
                        <span className="text-[10px] uppercase font-semibold text-gray-400">MAD Variance</span>
                        <p className="text-sm font-mono font-bold text-white mt-0.5">
                          ${alert.mad.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800">
                        <span className="text-[10px] uppercase font-semibold text-gray-400">Robust Score (R)</span>
                        <p className="text-sm font-mono font-bold text-rose-400 mt-0.5">
                          R = {alert.robustScore.toFixed(2)}
                        </p>
                      </div>

                      <div className="p-2.5 rounded-lg bg-gray-900/80 border border-gray-800">
                        <span className="text-[10px] uppercase font-semibold text-gray-400">History Sample Size</span>
                        <p className="text-sm font-mono font-bold text-gray-300 mt-0.5">
                          {alert.historicalSampleSize} days
                        </p>
                      </div>
                    </div>

                    <div className="p-3 rounded-lg bg-gray-900/80 border border-gray-800 flex items-start gap-2">
                      <HelpCircle className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
                      <div className="text-[11px] text-gray-300 leading-relaxed">
                        <strong className="text-white">Detection Evidence:</strong> Median Absolute Deviation (MAD) is resilient against outliers unlike standard deviation. Scale factor 1.4826 ensures normal distribution equivalence. R &gt; {alert.threshold} represents a statistically significant deviation (&gt;99.9% probability of structural shift rather than routine variance).
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
