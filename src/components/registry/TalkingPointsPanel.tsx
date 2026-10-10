import React from 'react';
import { MessageSquareCode, Check, Plus } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const TalkingPointsPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();

  const points = [
    'Acknowledge 34% token throughput growth and congratulate on batch run #491 benchmark.',
    'Present Tier-4 pricing amendment with 99.9% uptime SLA guarantee.',
    'Address 504 gateway timeout concerns by introducing dedicated gateway routing.',
    'Propose Q4 expansion for predictive analytics module.'
  ];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <MessageSquareCode className="h-5 w-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-white text-base">
            Strategic Talking Points
          </h3>
        </div>
        <span className="rounded-full bg-purple-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-purple-300">
          AI GENERATED
        </span>
      </div>

      <div className="mt-4 space-y-2.5">
        {points.map((pt, idx) => (
          <div
            key={idx}
            className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-xs text-slate-200 transition-all hover:bg-white/10"
          >
            <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-mono text-[10px] font-bold text-indigo-400">
              {idx + 1}
            </span>
            <p className="leading-relaxed">{pt}</p>
          </div>
        ))}
      </div>

      <button
        onClick={() => triggerAction('Add Talking Point', 'Added custom point to executive agenda')}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/5 py-2 text-xs font-semibold text-slate-300 hover:bg-white/10"
      >
        <Plus className="h-3.5 w-3.5" />
        <span>Add Custom Talking Point</span>
      </button>
    </div>
  );
};
