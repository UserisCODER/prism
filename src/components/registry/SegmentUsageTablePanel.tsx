import { useWorkspace } from '../../context/WorkspaceContext';
import React from 'react';
import { Table, ArrowDown, ArrowUp } from 'lucide-react';
import { seededUsageTrend } from '../../data/seededDatabase';

export const SegmentUsageTablePanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const rawUsage = liveData?.usage;
  const tableData = rawUsage && rawUsage.length > 0
    ? rawUsage.map((r: any) => ({
        date: r.date,
        activeUsers: r.activeUsers ?? r.active_users ?? 0,
        events: r.events ?? 0,
        segment: r.segment ?? '',
      }))
    : seededUsageTrend;
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-heading font-bold text-white text-base">
          Segment Usage Breakdown Table
        </h3>
        <span className="text-xs font-mono text-slate-400">DAILY BREAKDOWN</span>
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left font-mono text-xs text-slate-300">
          <thead>
            <tr className="border-b border-white/10 text-[11px] text-slate-400">
              <th className="py-2.5 px-3">DAY</th>
              <th className="py-2.5 px-3">SEGMENT</th>
              <th className="py-2.5 px-3">ACTIVE USERS</th>
              <th className="py-2.5 px-3">EVENTS PROCESSED</th>
              <th className="py-2.5 px-3">DELTA</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {tableData.map((row, idx) => (
              <tr key={idx} className="hover:bg-white/5 transition-colors">
                <td className="py-3 px-3 font-bold text-white">{row.date}</td>
                <td className="py-3 px-3">
                  <span
                    className={`rounded px-2 py-0.5 text-[10px] font-semibold ${
                      row.segment === 'Enterprise'
                        ? 'bg-indigo-500/20 text-indigo-300'
                        : 'bg-rose-500/20 text-rose-300'
                    }`}
                  >
                    {row.segment}
                  </span>
                </td>
                <td className="py-3 px-3 font-semibold text-white">{row.activeUsers.toLocaleString()}</td>
                <td className="py-3 px-3 text-slate-300">{row.events.toLocaleString()}</td>
                <td className="py-3 px-3">
                  {row.segment === 'SMB Segment' ? (
                    <span className="flex items-center gap-1 text-rose-400 font-bold">
                      <ArrowDown className="h-3 w-3" /> -34%
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-400 font-bold">
                      <ArrowUp className="h-3 w-3" /> +12%
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
