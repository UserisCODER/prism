import React from 'react';
import { Bot, Plus, RefreshCw, CheckCircle2, Clock } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ActiveAgents: React.FC = () => {
  const { triggerAction } = useWorkspace();

  const agents = [
    {
      name: 'SLA Sentinel',
      desc: 'Watching 12 customer pipelines',
      status: 'RUNNING',
      color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
    },
    {
      name: 'Briefing Synthesizer',
      desc: 'Compiling Q3 contract packets',
      status: 'SYNCING',
      color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
    },
    {
      name: 'Anomaly Audit Daemon',
      desc: 'Scheduled for 07:00 UTC',
      status: 'IDLE',
      color: 'bg-slate-500/20 text-slate-400 border-slate-500/30',
    },
  ];

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-5 backdrop-blur-xl shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Bot className="h-5 w-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-white text-base">Active Agents</h3>
        </div>
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
      </div>

      {/* Agents List */}
      <div className="mt-4 space-y-3">
        {agents.map((ag) => (
          <div
            key={ag.name}
            className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 p-3 transition-all hover:bg-white/10"
          >
            <div>
              <h4 className="font-heading text-xs font-bold text-white">{ag.name}</h4>
              <p className="text-[11px] text-slate-400">{ag.desc}</p>
            </div>
            <span className={`rounded-md border px-2 py-0.5 text-[10px] font-mono font-bold ${ag.color}`}>
              {ag.status}
            </span>
          </div>
        ))}
      </div>

      {/* Deploy Agent Button */}
      <button
        onClick={() => triggerAction('Deploy New Agent', 'Spawned agent worker instance')}
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-indigo-500/40 bg-indigo-500/10 py-2.5 text-xs font-semibold text-indigo-300 transition-all hover:bg-indigo-500/20 hover:text-white"
      >
        <Plus className="h-4 w-4" />
        <span>Deploy New Agent</span>
      </button>
    </div>
  );
};
