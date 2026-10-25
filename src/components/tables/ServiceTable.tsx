import React, { useState } from 'react';
import { AggregatedService } from '../../engine/types';
import { Layers, ArrowUpDown } from 'lucide-react';

interface ServiceTableProps {
  services: AggregatedService[];
  currency: string;
  onSelectService?: (serviceName: string) => void;
}

type SortField = 'cost' | 'service' | 'percentage' | 'recordCount' | 'dailyAverage';

export const ServiceTable: React.FC<ServiceTableProps> = ({
  services,
  currency,
  onSelectService
}) => {
  const [sortField, setSortField] = useState<SortField>('cost');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false);
    }
  };

  const sorted = [...services].sort((a, b) => {
    let cmp = 0;
    if (sortField === 'service') {
      cmp = a.service.localeCompare(b.service);
    } else {
      cmp = a[sortField] - b[sortField];
    }
    return sortAsc ? cmp : -cmp;
  });

  return (
    <div className="p-6 rounded-2xl bg-[#111827] border border-gray-800 shadow-xl overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="w-4 h-4 text-blue-400" /> Service Expenditure Breakdown
          </h3>
          <p className="text-xs text-gray-400">Total expenditure and bill contribution ranked by cost</p>
        </div>
        <span className="text-xs text-gray-400">
          {services.length} cloud services observed
        </span>
      </div>

      <div className="overflow-x-auto -mx-6">
        <table className="w-full text-left text-xs text-gray-300">
          <thead className="text-[11px] uppercase bg-gray-900/80 text-gray-400 border-y border-gray-800 select-none">
            <tr>
              <th
                onClick={() => handleSort('service')}
                className="py-3 px-6 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  Service <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('cost')}
                className="py-3 px-6 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  Total Spend ({currency}) <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('percentage')}
                className="py-3 px-6 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  Share of Bill <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('dailyAverage')}
                className="py-3 px-6 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  Daily Run-Rate <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
              <th
                onClick={() => handleSort('recordCount')}
                className="py-3 px-6 cursor-pointer hover:text-white transition"
              >
                <div className="flex items-center gap-1.5">
                  Billing Line Items <ArrowUpDown className="w-3 h-3" />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800/80">
            {sorted.map((s) => (
              <tr
                key={s.service}
                onClick={() => onSelectService && onSelectService(s.service)}
                className="hover:bg-gray-800/40 transition cursor-pointer group"
              >
                <td className="py-3.5 px-6 font-semibold text-white group-hover:text-blue-400">
                  {s.service}
                </td>
                <td className="py-3.5 px-6 font-mono font-bold text-gray-100">
                  ${s.cost.toFixed(2)}
                </td>
                <td className="py-3.5 px-6">
                  <div className="flex items-center gap-2.5">
                    <div className="w-24 bg-gray-800 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full rounded-full"
                        style={{ width: `${Math.min(s.percentage, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-gray-300 font-medium">{s.percentage}%</span>
                  </div>
                </td>
                <td className="py-3.5 px-6 font-mono text-gray-400">
                  ${s.dailyAverage.toFixed(2)}/day
                </td>
                <td className="py-3.5 px-6 text-gray-400 font-mono">
                  {s.recordCount}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
