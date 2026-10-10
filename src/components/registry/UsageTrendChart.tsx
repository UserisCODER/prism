import React from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ExternalLink, Activity } from 'lucide-react';
import { seededUsageTrend } from '../../data/seededDatabase';

export const UsageTrendChart: React.FC = () => {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="font-heading font-bold text-white text-lg">
              Telemetry Stream & Operations Pulse
            </h3>
            <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-400 border border-emerald-500/30">
              LIVE
            </span>
          </div>
          <p className="mt-0.5 text-xs text-slate-400">
            Inference throughput and client API consumption across models
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="rounded-full bg-emerald-500/10 px-3 py-1 text-xs font-mono text-emerald-300 border border-emerald-500/30">
            Peak: 4.8k ops on Friday
          </span>
          <button className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-xs font-medium text-slate-300 hover:bg-white/10">
            Weekly Pulse ▾
          </button>
        </div>
      </div>

      {/* Floating Tooltip Box */}
      <div className="my-4 flex justify-center">
        <div className="inline-flex items-center gap-3 rounded-xl border border-indigo-500/40 bg-indigo-950/80 px-4 py-2 text-xs font-mono backdrop-blur-md shadow-lg">
          <span className="text-slate-300">Meridian Batch Run #491</span>
          <span className="text-white font-bold">4,812 ops/sec</span>
          <span className="text-emerald-400 font-semibold">• 99.4% Valid</span>
        </div>
      </div>

      {/* Recharts Spline Wave Graph */}
      <div className="h-48 w-full mt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={seededUsageTrend} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="telemetryGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366F1" stopOpacity={0.6} />
                <stop offset="95%" stopColor="#6366F1" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" stroke="#64748B" fontSize={11} tickLine={false} />
            <YAxis stroke="#64748B" fontSize={11} tickLine={false} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#121623',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                borderRadius: '12px',
                color: '#fff',
                fontSize: '12px',
              }}
            />
            <Area
              type="monotone"
              dataKey="activeUsers"
              stroke="#818CF8"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#telemetryGradient)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Footer Stats */}
      <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3 text-xs font-mono text-slate-400">
        <div className="flex gap-4">
          <span>Avg Session: <strong className="text-white">38.4m</strong></span>
          <span>Total Tokens: <strong className="text-white">1.24B</strong></span>
        </div>
        <button className="flex items-center gap-1 text-indigo-400 hover:text-indigo-300 font-medium">
          <span>View full telemetry breakdown</span>
          <ExternalLink className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
