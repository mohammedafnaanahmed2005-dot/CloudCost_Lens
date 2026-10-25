import React from 'react';
import { Search, Filter, Download, X } from 'lucide-react';

interface FilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  selectedService: string;
  onServiceChange: (service: string) => void;
  selectedProject: string;
  onProjectChange: (project: string) => void;
  services: string[];
  projects: string[];
  onExportCsv: () => void;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export const FilterBar: React.FC<FilterBarProps> = ({
  searchQuery,
  onSearchChange,
  selectedService,
  onServiceChange,
  selectedProject,
  onProjectChange,
  services,
  projects,
  onExportCsv,
  onResetFilters,
  hasActiveFilters
}) => {
  return (
    <div className="p-4 rounded-xl bg-[#111827] border border-gray-800 flex flex-wrap items-center justify-between gap-3 shadow-md">
      <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
        {/* Search */}
        <div className="relative min-w-[180px] max-w-xs flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
            <Search className="w-3.5 h-3.5" />
          </div>
          <input
            type="text"
            placeholder="Search service or project..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 bg-gray-900 border border-gray-700/80 rounded-lg text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
          />
        </div>

        {/* Service Filter */}
        <div className="flex items-center gap-1.5 text-xs text-gray-300">
          <Filter className="w-3.5 h-3.5 text-gray-400" />
          <select
            value={selectedService}
            onChange={(e) => onServiceChange(e.target.value)}
            className="bg-gray-900 border border-gray-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
          >
            <option value="all">All Services ({services.length})</option>
            {services.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Project Filter */}
        {projects.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs text-gray-300">
            <select
              value={selectedProject}
              onChange={(e) => onProjectChange(e.target.value)}
              className="bg-gray-900 border border-gray-700/80 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="all">All Projects ({projects.length})</option>
              {projects.map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>
        )}

        {hasActiveFilters && (
          <button
            onClick={onResetFilters}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white text-xs transition"
          >
            <X className="w-3 h-3" /> Clear Filters
          </button>
        )}
      </div>

      {/* Export Report */}
      <button
        onClick={onExportCsv}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700 text-xs font-medium transition active:scale-95 ml-auto"
        title="Export current analysis as CSV"
      >
        <Download className="w-3.5 h-3.5 text-blue-400" />
        <span>Export Report</span>
      </button>
    </div>
  );
};
