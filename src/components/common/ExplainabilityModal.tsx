import React from 'react';
import { HelpCircle, ShieldCheck, Database, Check, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ExplainabilityModal: React.FC = () => {
  const { explainModalPanel, closeExplainModal } = useWorkspace();

  if (!explainModalPanel) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/40 bg-[#121623] p-6 shadow-2xl">
        
        {/* Glow Top Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <HelpCircle className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">
                PANEL EXPLAINABILITY & PROVENANCE
              </span>
              <h3 className="font-heading text-lg font-bold text-white">
                Why am I seeing this panel?
              </h3>
            </div>
          </div>

          <button
            onClick={closeExplainModal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-4 rounded-xl border border-white/10 bg-white/5 p-4 text-xs font-sans text-slate-200 leading-relaxed">
          <strong className="text-white block mb-1">Reason for Composition:</strong>
          {explainModalPanel.reason}
        </div>

        <div className="mt-4 space-y-2.5 text-xs font-mono">
          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <span className="flex items-center gap-2 text-slate-400">
              <Database className="h-4 w-4 text-indigo-400" />
              <span>Data Source Grounding:</span>
            </span>
            <span className="font-bold text-indigo-300">Postgres DB / Telemetry API</span>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-white/5 bg-white/5 p-3">
            <span className="flex items-center gap-2 text-slate-400">
              <ShieldCheck className="h-4 w-4 text-emerald-400" />
              <span>Priority Score Weight:</span>
            </span>
            <span className="font-bold text-emerald-400">{explainModalPanel.priority} / 100</span>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={closeExplainModal}
            className="rounded-xl bg-indigo-600 px-5 py-2 text-xs font-bold text-white hover:bg-indigo-500"
          >
            Got it
          </button>
        </div>

      </div>
    </div>
  );
};
