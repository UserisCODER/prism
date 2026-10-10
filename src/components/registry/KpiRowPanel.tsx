import React from 'react';
import { TrendingUp, Users, CheckSquare } from 'lucide-react';

export const KpiRowPanel: React.FC = () => {
  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
      
      {/* Metric 1: ARR REVENUE */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            ARR REVENUE
          </span>
          <TrendingUp className="h-4 w-4 text-emerald-400" />
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-extrabold text-white">$1.42M</span>
          <span className="text-xs font-semibold text-emerald-400">+12.4% vs last month</span>
        </div>

        {/* Mini SVG Sparkline */}
        <div className="mt-3 h-8 w-full">
          <svg className="h-full w-full overflow-visible" viewBox="0 0 100 25" preserveAspectRatio="none">
            <path
              d="M 0,20 Q 25,18 50,12 T 100,4"
              fill="none"
              stroke="#10B981"
              strokeWidth="2.5"
              strokeLinecap="round"
            />
          </svg>
        </div>
      </div>

      {/* Metric 2: ACTIVE ACCOUNTS */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            ACTIVE ACCOUNTS
          </span>
          <Users className="h-4 w-4 text-indigo-400" />
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-extrabold text-white">48</span>
          <span className="flex items-center gap-1 text-xs font-medium text-amber-400">
            <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
            3 high-touch intervention
          </span>
        </div>

        <div className="mt-4 flex items-center gap-1.5">
          <div className="h-4 w-6 rounded bg-indigo-500/20" />
          <div className="h-4 w-6 rounded bg-indigo-500/30" />
          <div className="h-4 w-6 rounded bg-indigo-500/40" />
          <div className="h-4 w-6 rounded bg-indigo-500/60" />
          <div className="h-4 w-8 rounded bg-indigo-500 font-mono text-[9px] text-white flex items-center justify-center">
            48
          </div>
        </div>
      </div>

      {/* Metric 3: ORCHESTRATED TASKS */}
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-5 backdrop-blur-xl shadow-xl">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            ORCHESTRATED TASKS
          </span>
          <CheckSquare className="h-4 w-4 text-purple-400" />
        </div>

        <div className="mt-2 flex items-baseline gap-2">
          <span className="font-heading text-3xl font-extrabold text-white">14</span>
          <span className="text-xs font-semibold text-rose-400">2 due today • Priority escalation</span>
        </div>

        <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
          <span>Auto-executing: 8</span>
          <span className="font-bold text-white">Signoff needed: 6</span>
        </div>
      </div>

    </div>
  );
};
