import React from 'react';
import { Cpu, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

export const AutonomousLogPanel: React.FC = () => {
  const logs = [
    {
      id: 1,
      icon: Cpu,
      title: 'Sync with Meridian Labs logged',
      subtitle: 'Synthesized meeting notes, 3 actions pushed to CRM',
      badge: '98% CONFIDENCE',
      badgeColor: 'text-emerald-400',
      time: '12m ago',
    },
    {
      id: 2,
      icon: FileText,
      title: 'Enterprise contract draft prepared for Acme Corp',
      subtitle: 'Tier-4 pricing matrix applied with custom SLA stipulations',
      badge: 'STAGE: PENDING SIGNATURE',
      badgeColor: 'text-amber-400',
      time: '1h ago',
    },
    {
      id: 3,
      icon: CheckCircle2,
      title: 'Q3 usage anomaly parsed across SMB cluster',
      subtitle: '14.2k tokens scanned, anomaly flagged to reliability engineering',
      badge: 'RESOLVED AUTOMATICALLY',
      badgeColor: 'text-indigo-400',
      time: '3h ago',
    },
  ];

  return (
    <div className="rounded-2xl border border-white/10 bg-black p-6 shadow-xl">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Cpu className="h-5 w-5 text-indigo-400" />
          <h3 className="font-heading font-bold text-white text-lg">
            Autonomous Orchestration Log
          </h3>
        </div>
        <span className="text-xs font-mono text-slate-400">42 TOUCHPOINTS TODAY</span>
      </div>

      {/* Log Entries */}
      <div className="mt-4 space-y-3">
        {logs.map((item) => {
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
                  <Icon className="h-5 w-5" />
                </div>
                <div>
                  <h4 className="font-heading text-sm font-semibold text-white">{item.title}</h4>
                  <p className="text-xs text-slate-400">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono">
                <span className={`font-bold ${item.badgeColor}`}>{item.badge}</span>
                <span className="text-slate-400">{item.time}</span>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 text-center">
        <button className="inline-flex items-center gap-1 text-xs font-mono text-indigo-400 hover:text-indigo-300">
          <span>View all 28 logged touchpoints</span>
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
};
