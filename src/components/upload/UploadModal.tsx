import React, { useState, useRef } from 'react';
import { ParseResult } from '../../engine/types';
import { parseBillingCsv } from '../../engine/parser';
import { SAMPLE_BILLING_CSV, SECOND_DEMO_CSV } from '../../data/sampleBilling';
import { X, Upload, FileText, AlertCircle, AlertTriangle, CheckCircle2, Sparkles, RefreshCw } from 'lucide-react';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImport: (parsed: ParseResult, rawText: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  isOpen,
  onClose,
  onImport
}) => {
  const [activeTab, setActiveTab] = useState<'file' | 'paste'>('file');
  const [pastedText, setPastedText] = useState<string>('');
  const [previewResult, setPreviewResult] = useState<ParseResult | null>(null);
  const [rawContent, setRawContent] = useState<string>('');
  const [fileName, setFileName] = useState<string>('');
  const [isDragging, setIsDragging] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (file: File) => {
    setFileName(file.name);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      setRawContent(content);
      const res = parseBillingCsv(content);
      setPreviewResult(res);
    };
    reader.readAsText(file);
  };

  const handlePasteChange = (text: string) => {
    setPastedText(text);
    setRawContent(text);
    if (text.trim()) {
      const res = parseBillingCsv(text);
      setPreviewResult(res);
    } else {
      setPreviewResult(null);
    }
  };

  const handleLoadSample = (sampleType: 'primary' | 'secondary') => {
    const content = sampleType === 'primary' ? SAMPLE_BILLING_CSV : SECOND_DEMO_CSV;
    setFileName(sampleType === 'primary' ? 'demo_aws_billing_anomaly.csv' : 'gcp_secondary_billing.csv');
    setRawContent(content);
    setPastedText(content);
    const res = parseBillingCsv(content);
    setPreviewResult(res);
  };

  const handleConfirmImport = () => {
    if (previewResult && previewResult.validRows > 0) {
      onImport(previewResult, rawContent);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#111827] border border-gray-800 rounded-2xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg border border-blue-500/20">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Import Cloud Billing CSV</h3>
              <p className="text-xs text-gray-400">Validate schema, detect provider format, and inspect row data</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {/* Quick presets */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-800">
            <div className="text-xs">
              <span className="font-semibold text-gray-300">Fast Demo Loading:</span>
              <span className="text-gray-400 ml-1.5">Load ready-made realistic billing samples</span>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLoadSample('primary')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-blue-600/20 hover:bg-blue-600/30 text-blue-300 border border-blue-500/30 flex items-center gap-1 transition"
              >
                <Sparkles className="w-3 h-3 text-amber-400" /> 21-Day EC2 Anomaly
              </button>
              <button
                type="button"
                onClick={() => handleLoadSample('secondary')}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 flex items-center gap-1 transition"
              >
                <RefreshCw className="w-3 h-3 text-indigo-400" /> GCP Secondary
              </button>
            </div>
          </div>

          {/* Mode Tabs */}
          <div className="flex border-b border-gray-800">
            <button
              onClick={() => setActiveTab('file')}
              className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'file'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" /> Upload File (.csv)
            </button>
            <button
              onClick={() => setActiveTab('paste')}
              className={`pb-2.5 px-4 text-xs font-semibold flex items-center gap-2 border-b-2 transition ${
                activeTab === 'paste'
                  ? 'border-blue-500 text-blue-400'
                  : 'border-transparent text-gray-400 hover:text-gray-300'
              }`}
            >
              <FileText className="w-4 h-4" /> Paste Raw CSV Text
            </button>
          </div>

          {activeTab === 'file' ? (
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                  handleFileChange(e.dataTransfer.files[0]);
                }
              }}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition ${
                isDragging
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-gray-700 hover:border-gray-600 bg-gray-900/40'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,text/csv"
                className="hidden"
                onChange={(e) => {
                  if (e.target.files && e.target.files[0]) {
                    handleFileChange(e.target.files[0]);
                  }
                }}
              />
              <div className="p-3 bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center mx-auto text-blue-400 mb-3 shadow">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-semibold text-white">
                {fileName ? fileName : 'Drop your CSV billing export here, or click to browse'}
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Supports Standard CloudCost Lens CSV, AWS CUR, and GCP Billing Export formats
              </p>
            </div>
          ) : (
            <div>
              <textarea
                value={pastedText}
                onChange={(e) => handlePasteChange(e.target.value)}
                placeholder="date,service,cost,currency,project&#10;2026-10-01,Amazon EC2,48.50,USD,core-infra&#10;..."
                className="w-full h-40 bg-gray-900/60 border border-gray-700 rounded-xl p-3 text-xs font-mono text-gray-200 placeholder-gray-600 focus:outline-none focus:border-blue-500"
              />
            </div>
          )}

          {/* Validation Feedback */}
          {previewResult && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="p-3 rounded-lg bg-gray-800/60 border border-gray-700/80">
                  <span className="text-gray-400">Total Rows</span>
                  <p className="text-lg font-bold font-mono text-white mt-0.5">{previewResult.totalRows}</p>
                </div>

                <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-800/40">
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Valid Records
                  </span>
                  <p className="text-lg font-bold font-mono text-emerald-300 mt-0.5">{previewResult.validRows}</p>
                </div>

                <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-800/40">
                  <span className="text-rose-400 flex items-center gap-1">
                    <AlertCircle className="w-3.5 h-3.5" /> Syntax Errors
                  </span>
                  <p className="text-lg font-bold font-mono text-rose-300 mt-0.5">{previewResult.errors.length}</p>
                </div>

                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-800/40">
                  <span className="text-amber-400 flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> Warnings / Deduped
                  </span>
                  <p className="text-lg font-bold font-mono text-amber-300 mt-0.5">
                    {previewResult.warnings.length} ({previewResult.duplicateRowsCount} dup)
                  </p>
                </div>
              </div>

              {/* Error Detail Table */}
              {previewResult.errors.length > 0 && (
                <div className="p-3.5 rounded-xl bg-rose-950/30 border border-rose-800/50 space-y-2">
                  <h4 className="text-xs font-bold text-rose-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                    Validation Errors ({previewResult.errors.length}) — These rows cannot be loaded:
                  </h4>
                  <div className="max-h-36 overflow-y-auto space-y-1 text-xs">
                    {previewResult.errors.map((err, idx) => (
                      <div key={idx} className="bg-gray-900/60 p-2 rounded border border-rose-900/50 flex items-start gap-2">
                        <span className="px-1.5 py-0.5 rounded bg-rose-900/50 text-rose-200 font-mono text-[11px] shrink-0">
                          Row {err.rowNumber}
                        </span>
                        <div>
                          <strong className="text-white font-mono">{err.column}:</strong>{' '}
                          <span className="text-rose-300">{err.message}</span>
                          {err.value && <span className="text-gray-400 text-[11px] block mt-0.5">Value: "{err.value}"</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Warnings Detail */}
              {previewResult.warnings.length > 0 && (
                <div className="p-3 rounded-xl bg-amber-950/20 border border-amber-800/40 text-xs space-y-1">
                  <h4 className="font-semibold text-amber-300 flex items-center gap-1.5">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-400" /> Warnings & Deduplications
                  </h4>
                  <p className="text-gray-400 text-[11px]">
                    {previewResult.warnings[0].message}
                    {previewResult.warnings.length > 1 && ` (+${previewResult.warnings.length - 1} more)`}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-800 bg-[#0B0F19]">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg text-gray-400 hover:text-white hover:bg-gray-800 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleConfirmImport}
            disabled={!previewResult || previewResult.validRows === 0}
            className={`px-5 py-2 text-xs font-semibold rounded-lg flex items-center gap-1.5 shadow-lg transition ${
              previewResult && previewResult.validRows > 0
                ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-600/30'
                : 'bg-gray-800 text-gray-500 cursor-not-allowed'
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Load {previewResult ? `${previewResult.validRows} Records` : 'Dataset'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
