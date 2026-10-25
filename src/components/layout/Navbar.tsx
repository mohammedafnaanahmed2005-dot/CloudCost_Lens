import React from 'react';
import { Cloud, Upload, Sparkles, Sliders, Trash2, ShieldCheck, Database, RefreshCw } from 'lucide-react';

interface NavbarProps {
  onOpenUpload: () => void;
  onOpenBudget: () => void;
  onOpenAI: () => void;
  onLoadDemo: () => void;
  onLoadSecondary: () => void;
  onClear: () => void;
  recordCount: number;
  currency: string;
  isDemoData: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenUpload,
  onOpenBudget,
  onOpenAI,
  onLoadDemo,
  onLoadSecondary,
  onClear,
  recordCount,
  currency,
  isDemoData
}) => {
  return (
    <header className="border-b border-gray-800 bg-[#111827]/90 backdrop-blur-md sticky top-0 z-30 px-4 sm:px-6 py-3.5 transition-all">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand */}
        <div className="flex items-center space-x-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl shadow-lg shadow-blue-500/20 text-white">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-gradient-to-r from-blue-400 via-indigo-200 to-teal-300 bg-clip-text text-transparent">
                  CloudCost Lens
                </span>
                <span className="text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20">
                  FinOps AI
                </span>
              </div>
              <p className="text-xs text-gray-400 hidden sm:block">Automated Cloud Cost Intelligence & Optimization</p>
            </div>
          </div>

          {/* Mobile badges */}
          <div className="flex md:hidden items-center gap-1.5">
            <span className="text-xs px-2 py-1 rounded bg-gray-800 text-gray-300 font-mono">
              {currency}
            </span>
          </div>
        </div>

        {/* Status Indicators */}
        <div className="hidden lg:flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/60 text-gray-300">
            <Database className="w-3.5 h-3.5 text-blue-400" />
            <span>Records: <strong className="text-white font-mono">{recordCount}</strong></span>
          </div>

          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800/80 border border-gray-700/60 text-gray-300">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>Currency: <strong className="text-white font-mono">{currency}</strong></span>
          </div>

          {isDemoData ? (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" /> Synthetic Demo
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[11px] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> User Uploaded
            </span>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center flex-wrap gap-2 w-full md:w-auto justify-end">
          <button
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white shadow-md shadow-blue-600/30 transition active:scale-95"
            title="Upload CSV billing file"
          >
            <Upload className="w-3.5 h-3.5" />
            <span>Import CSV</span>
          </button>

          <button
            onClick={onLoadDemo}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition active:scale-95"
            title="Load 21-day demo dataset with EC2 anomaly"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">21-Day Spike Demo</span>
            <span className="sm:hidden">Demo</span>
          </button>

          <button
            onClick={onLoadSecondary}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition active:scale-95"
            title="Load secondary Google Cloud dataset"
          >
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">GCP Dataset</span>
            <span className="sm:hidden">GCP</span>
          </button>

          <button
            onClick={onOpenBudget}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 transition active:scale-95"
            title="Configure monthly budget"
          >
            <Sliders className="w-3.5 h-3.5 text-gray-400" />
            <span className="hidden sm:inline">Budget</span>
          </button>

          <button
            onClick={onOpenAI}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-purple-950/40 hover:bg-purple-900/40 text-purple-300 border border-purple-800/60 transition active:scale-95"
            title="Generate AI executive briefing"
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span className="hidden sm:inline">AI Briefing</span>
          </button>

          {recordCount > 0 && (
            <button
              onClick={onClear}
              className="p-2 text-xs font-medium rounded-lg bg-gray-800 hover:bg-red-500/20 text-gray-400 hover:text-red-400 border border-gray-700 transition active:scale-95"
              title="Clear imported dataset"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
