import React from 'react';
import { HelpCircle, CheckCircle, GitBranch, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ClientOverviewPanel: React.FC<{ clientId?: string }> = () => {
  const { openExplainModal, currentIntent } = useWorkspace();
  const clientName =
    currentIntent.entities.find((entity) => entity.type === 'client')?.value ??
    (currentIntent.rawText.toLowerCase().includes('acme') ? 'Acme Corp' : 'Meridian Labs');

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      {/* Top Header */}
      <div className="flex items-center justify-between">
        <div>
          <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
            AI CONTEXT DISPATCH • Generated 2 mins ago
          </span>
          <h2 className="mt-1 font-heading text-xl font-bold text-white md:text-2xl">
            Good morning, Sarah. Here is your synthesized agenda.
          </h2>
        </div>

        <button
          onClick={() =>
            openExplainModal({
              instanceId: 'p-client-hero',
              component_id: 'client_overview',
              zone: 'hero',
              colSpan: 8,
              reason:
                'Surfaced as Hero because meeting is scheduled today at 11:30 AM and token throughput increased +34%.',
              priority: 98,
              params: {},
            })
          }
          className="flex items-center gap-1.5 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 transition-all hover:bg-white/10 hover:text-white"
        >
          <HelpCircle className="h-3.5 w-3.5 text-indigo-400" />
          <span>Why am I seeing this?</span>
        </button>
      </div>

      <p className="mt-3 text-xs md:text-sm text-slate-300 leading-relaxed max-w-3xl">
        Prioritized based on your 11:30 AM sync with <span className="font-semibold text-white">{clientName}</span>. Their token throughput increased <span className="font-bold text-emerald-400">+34% this week</span>, triggering contract renegotiation thresholds. 4 recommended actions were staged below for your authorization.
      </p>

      {/* Linked Metrics Pills */}
      <div className="mt-6 flex flex-wrap gap-4">
        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 min-w-[200px]">
          <GitBranch className="h-5 w-5 text-indigo-400" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">LINKED PIPELINES</div>
            <div className="font-heading text-sm font-bold text-white">12 Active Nodes</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 min-w-[200px]">
          <CheckCircle className="h-5 w-5 text-emerald-400" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">AUTO-HEALTH</div>
            <div className="font-heading text-sm font-bold text-white">99.8% Synchronized</div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 min-w-[200px]">
          <ShieldAlert className="h-5 w-5 text-amber-400" />
          <div>
            <div className="text-[10px] font-mono text-slate-400 uppercase">PENDING SIGNOFFS</div>
            <div className="font-heading text-sm font-bold text-white">4 Auto-queued</div>
          </div>
        </div>
      </div>
    </div>
  );
};
