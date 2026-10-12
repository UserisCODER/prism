import React from 'react';
import { ShieldAlert, AlertOctagon } from 'lucide-react';

export const RiskMatrixPanel: React.FC = () => {
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="h-5 w-5 text-rose-400" />
          <h3 className="font-heading font-bold text-white text-base">
            Account & Delivery Risk Matrix
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">2x2 IMPACT VS LIKELIHOOD</span>
      </div>

      {/* 2x2 Visual Grid */}
      <div className="mt-4 grid grid-cols-2 gap-3 font-mono text-xs">
        
        {/* Quadrant 1: High Likelihood / High Impact (CRITICAL) */}
        <div className="rounded-xl border border-rose-500/40 bg-rose-950/40 p-3.5">
          <div className="flex items-center justify-between text-rose-400 font-bold">
            <span>HIGH IMPACT / HIGH LIKELIHOOD</span>
            <AlertOctagon className="h-4 w-4" />
          </div>
          <div className="mt-2 space-y-1.5 text-[11px] text-slate-200 font-sans">
            <div className="rounded bg-rose-500/20 p-1.5 border border-rose-500/30">
              • <strong>Project Apex</strong> — Telemetry latency spike blocker (4 days overdue)
            </div>
            <div className="rounded bg-rose-500/20 p-1.5 border border-rose-500/30">
              • <strong>Acme Renewal</strong> — Support SLA contract negotiation
            </div>
          </div>
        </div>

        {/* Quadrant 2: Low Likelihood / High Impact */}
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 p-3.5">
          <div className="text-amber-400 font-bold">HIGH IMPACT / LOW LIKELIHOOD</div>
          <div className="mt-2 text-[11px] text-slate-300 font-sans">
            <div className="rounded bg-amber-500/10 p-1.5 border border-amber-500/20">
              • Database migration timeout on batch run #491
            </div>
          </div>
        </div>

        {/* Quadrant 3: High Likelihood / Low Impact */}
        <div className="rounded-xl border border-indigo-500/30 bg-indigo-950/20 p-3.5">
          <div className="text-indigo-400 font-bold">LOW IMPACT / HIGH LIKELIHOOD</div>
          <div className="mt-2 text-[11px] text-slate-300 font-sans">
            <div className="rounded bg-indigo-500/10 p-1.5 border border-indigo-500/20">
              • Stale onboarding tickets for Vertex
            </div>
          </div>
        </div>

        {/* Quadrant 4: Low Likelihood / Low Impact */}
        <div className="rounded-xl border border-white/10 bg-white/5 p-3.5">
          <div className="text-slate-400 font-bold">LOW IMPACT / LOW LIKELIHOOD</div>
          <div className="mt-2 text-[11px] text-slate-400 font-sans">
            • Minor UI padding alignment feedback
          </div>
        </div>

      </div>
    </div>
  );
};
