import React from 'react';
import { AlertOctagon, TrendingDown, ArrowRight, Zap } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const AnomalyCalloutPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-rose-500/40 bg-gradient-to-r from-rose-950/60 via-[#121623] to-[#121623] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/40 animate-pulse">
            <AlertOctagon className="h-7 w-7" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-rose-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-rose-300 border border-rose-500/40 uppercase">
                CRITICAL ANOMALY DETECTED
              </span>
              <span className="text-xs font-mono text-slate-400">P99 Confidence</span>
            </div>

            <h2 className="mt-1 font-heading text-2xl font-extrabold text-white">
              -34% Active User Drop in SMB Segment
            </h2>

            <p className="mt-2 text-xs md:text-sm text-slate-300 max-w-2xl leading-relaxed">
              Automated telemetry detected a sudden usage drop isolated to sub-accounts in the <span className="font-bold text-white">SMB Segment</span> between Thursday and Saturday. Root cause analysis indicates missing automated retry webhooks during batch runs.
            </p>
          </div>
        </div>

        <button
          onClick={() => triggerAction('Create Save Campaign', 'Triggered automated recovery workflow for 18 SMB accounts')}
          className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-rose-500 to-pink-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-rose-500/30 transition-all hover:opacity-90 active:scale-95"
        >
          <Zap className="h-4 w-4" />
          <span>Launch Save Campaign</span>
        </button>
      </div>

      <div className="mt-6 flex flex-wrap items-center gap-6 border-t border-white/10 pt-4 text-xs font-mono text-slate-300">
        <div>
          <span className="text-slate-400">Affected Sub-Accounts: </span>
          <span className="font-bold text-rose-400">18 Accounts</span>
        </div>
        <div>
          <span className="text-slate-400">Estimated ARR at Risk: </span>
          <span className="font-bold text-rose-400">$340K</span>
        </div>
        <div>
          <span className="text-slate-400">Primary Contact: </span>
          <span className="font-bold text-white">Sarah Jenkins (VP Ops)</span>
        </div>
      </div>
    </div>
  );
};
