import React from 'react';
import { Target, Clock, AlertTriangle, ShieldCheck, Edit3, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const IntentCard: React.FC = () => {
  const { currentIntent, submitIntent } = useWorkspace();

  if (!currentIntent) return null;

  const urgencyColors = {
    low: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
    medium: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30',
    high: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
    critical: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  };

  return (
    <div className="mx-auto mb-6 max-w-[1600px] px-4 sm:px-6">
      <div className="relative overflow-hidden rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-4 backdrop-blur-xl shadow-xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          {/* Left: Goal & Entities */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <Target className="h-5 w-5" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono uppercase text-slate-400">PARSED INTENT:</span>
                <span className="font-heading font-bold text-white text-base">
                  {currentIntent.goal}
                </span>
              </div>

              {/* Entity Pills */}
              <div className="mt-1 flex flex-wrap items-center gap-2">
                {currentIntent.entities.map((ent, idx) => (
                  <span
                    key={idx}
                    className="inline-flex items-center gap-1 rounded-md border border-white/10 bg-white/5 px-2 py-0.5 text-[11px] font-mono text-slate-300"
                  >
                    <span className="text-indigo-400">{ent.type}:</span>
                    <span className="text-white font-medium">{ent.value}</span>
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Confidence, Urgency & Correction Chips */}
          <div className="flex flex-wrap items-center gap-3">
            
            {/* Urgency Badge */}
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold uppercase ${
                urgencyColors[currentIntent.urgency]
              }`}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              <span>{currentIntent.urgency} URGENCY</span>
            </span>

            {/* Confidence Gauge */}
            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs font-mono">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
              <span className="text-slate-400">CONFIDENCE:</span>
              <span className="font-bold text-emerald-400">
                {Math.round(currentIntent.confidence * 100)}%
              </span>
            </div>

            {/* "Not quite?" Correction Chips */}
            <div className="flex items-center gap-1.5 border-l border-white/10 pl-3">
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Edit3 className="h-3.5 w-3.5 text-indigo-400" />
                <span>Not quite?</span>
              </span>

              <button
                onClick={() => submitIntent("Prepare client meeting with Vertex Systems")}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition-all"
              >
                Switch to Vertex
              </button>

              <button
                onClick={() => submitIntent("Investigate product usage drop")}
                className="rounded-lg border border-white/10 bg-white/5 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition-all"
              >
                Focus on Usage
              </button>
            </div>

          </div>

        </div>
      </div>
    </div>
  );
};
