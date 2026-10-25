import React, { useState } from 'react';
import { BudgetConfig } from '../../engine/types';
import { X, Sliders, DollarSign, Check } from 'lucide-react';

interface BudgetModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: BudgetConfig;
  onSave: (config: BudgetConfig) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave
}) => {
  const [budgetInput, setBudgetInput] = useState<string>(String(config.monthlyBudget));
  const [thresholdInput, setThresholdInput] = useState<number>(config.alertThresholdPercentage);
  const [currencyInput, setCurrencyInput] = useState<string>(config.currency);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const parsedBudget = parseFloat(budgetInput);
    if (!isNaN(parsedBudget) && parsedBudget >= 0) {
      onSave({
        monthlyBudget: parsedBudget,
        currency: currencyInput.toUpperCase(),
        alertThresholdPercentage: thresholdInput
      });
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
              <Sliders className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Budget Configuration</h3>
              <p className="text-xs text-gray-400">Set monthly limit and warning thresholds</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Monthly Budget Cap
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                <DollarSign className="w-4 h-4" />
              </div>
              <input
                type="number"
                min="0"
                step="50"
                value={budgetInput}
                onChange={(e) => setBudgetInput(e.target.value)}
                required
                className="w-full pl-9 pr-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm font-mono text-white focus:outline-none focus:border-blue-500 transition"
                placeholder="3500"
              />
            </div>
            <p className="text-[11px] text-gray-500 mt-1">Used for burn rate and projection calculations.</p>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Warning Alert Threshold ({thresholdInput}%)
            </label>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={thresholdInput}
              onChange={(e) => setThresholdInput(Number(e.target.value))}
              className="w-full accent-blue-500 bg-gray-700 h-2 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[11px] text-gray-400 mt-1">
              <span>50%</span>
              <span className="text-blue-400 font-semibold">{thresholdInput}% of budget</span>
              <span>100%</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-300 uppercase tracking-wider mb-1.5">
              Currency Code
            </label>
            <input
              type="text"
              maxLength={3}
              value={currencyInput}
              onChange={(e) => setCurrencyInput(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-xl text-sm font-mono text-white uppercase focus:outline-none focus:border-blue-500 transition"
            />
          </div>

          <div className="pt-3 border-t border-gray-800 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-gray-400 hover:text-white rounded-lg transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 text-xs font-semibold rounded-lg bg-blue-600 hover:bg-blue-500 text-white flex items-center gap-1.5 shadow-md shadow-blue-600/30 transition"
            >
              <Check className="w-4 h-4" /> Save Budget
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
