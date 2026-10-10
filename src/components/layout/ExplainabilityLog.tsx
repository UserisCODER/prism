import React from 'react';
import { ShieldCheck, Pin, ThumbsUp, ThumbsDown, Info, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ExplainabilityLog: React.FC = () => {
  const { layoutPlan, triggerAction } = useWorkspace();

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-5 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-white text-base">Explainability Log</h3>
        </div>
        <span className="rounded-full bg-indigo-500/20 px-2.5 py-0.5 text-[11px] font-mono font-bold text-indigo-300 border border-indigo-500/30">
          94% RELEVANCE
        </span>
      </div>

      {/* Provenance & Grounding */}
      <div className="mt-4">
        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
          PROVENANCE & GROUNDING
        </span>
        <h4 className="mt-1 font-heading text-sm font-semibold text-slate-200">
          Why you're seeing this workspace configuration:
        </h4>

        <div className="mt-3 space-y-2 text-xs text-slate-300">
          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              ✓
            </span>
            <p>{layoutPlan.summaryReason || 'Synthesized from Salesforce CRM client tier records and Datadog telemetry spikes.'}</p>
          </div>

          <div className="flex items-start gap-2">
            <span className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
              ✓
            </span>
            <p>Correlated with active scenario context: "{layoutPlan.scenarioName}".</p>
          </div>
        </div>
      </div>

      {/* Scores & Progress Bars */}
      <div className="mt-5 space-y-3 border-t border-white/10 pt-4 text-xs font-mono">
        <div>
          <div className="flex justify-between text-slate-300">
            <span>Intent Alignment Score</span>
            <span className="font-bold text-indigo-400">{layoutPlan.alignmentScore}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-indigo-500" style={{ width: `${layoutPlan.alignmentScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300">
            <span>Data Freshness (Last sync: 4m ago)</span>
            <span className="font-bold text-emerald-400">{layoutPlan.freshnessScore}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${layoutPlan.freshnessScore}%` }} />
          </div>
        </div>

        <div>
          <div className="flex justify-between text-slate-300">
            <span>Hallucination Risk Threshold</span>
            <span className="font-bold text-emerald-400">&lt; {layoutPlan.hallucinationRisk}%</span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full rounded-full bg-emerald-400" style={{ width: '4%' }} />
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="mt-5 flex items-center justify-between border-t border-white/10 pt-4">
        <button
          onClick={() => triggerAction('Pin Entire Workspace', 'Workspace state saved to pinned layouts')}
          className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-white/10"
        >
          <Pin className="h-3.5 w-3.5 text-indigo-400" />
          <span>Pin this workspace</span>
        </button>

        <div className="flex items-center gap-2 text-xs text-slate-400">
          <span>Was this helpful?</span>
          <button
            onClick={() => triggerAction('Feedback', 'Positive feedback recorded')}
            className="rounded-md p-1 hover:bg-white/10 hover:text-emerald-400"
          >
            <ThumbsUp className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => triggerAction('Feedback', 'Negative feedback recorded')}
            className="rounded-md p-1 hover:bg-white/10 hover:text-rose-400"
          >
            <ThumbsDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
