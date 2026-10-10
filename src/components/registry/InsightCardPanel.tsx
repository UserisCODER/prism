import React from 'react';
import { Sparkles, ArrowRight, ShieldCheck } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const InsightCardPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();

  return (
    <div className="rounded-2xl border border-purple-500/40 bg-gradient-to-br from-[#121623] via-[#161a2b] to-[#121623] p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-purple-400" />
          <h3 className="font-heading font-bold text-white text-base">
            AI Root Cause Analysis & Grounded Insight
          </h3>
        </div>
        <span className="rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-purple-300 border border-purple-500/30">
          96% CONFIDENCE
        </span>
      </div>

      <p className="mt-4 text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
        The <span className="font-bold text-rose-400">-34% SMB usage drop</span> correlates directly with a failed webhook batch deployment on Thursday at 14:00 UTC. 18 sub-accounts stopped transmitting telemetry events due to missing retry policies.
      </p>

      <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-3 text-xs font-mono text-slate-300">
        <span className="text-slate-400">DATA CITATIONS: </span>
        <span className="text-indigo-400 font-medium">Postgres daily_usage (ID #8821), Datadog Event Log (ID #5512)</span>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <span className="text-xs font-mono text-slate-400">Suggested Resolution: Automate webhook retry patch</span>
        <button
          onClick={() => triggerAction('Apply Webhook Patch', 'Deployed automated retry fix to 18 sub-accounts')}
          className="flex items-center gap-2 rounded-xl bg-purple-600 px-4 py-2 text-xs font-bold text-white hover:bg-purple-500 transition-all"
        >
          <span>Apply Patch</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
