import React from 'react';
import { Mail, MessageSquare, Phone, Clock } from 'lucide-react';
import { seededCommunications } from '../../data/seededDatabase';

export const RecentCommunicationsPanel: React.FC = () => {
  const iconMap = {
    email: Mail,
    slack: MessageSquare,
    call: Phone,
  };

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-heading font-bold text-white text-base">
          Recent Communications
        </h3>
        <span className="text-xs font-mono text-slate-400">LAST 24 HOURS</span>
      </div>

      <div className="mt-4 space-y-3">
        {seededCommunications.map((comm) => {
          const Icon = iconMap[comm.channel];
          return (
            <div
              key={comm.id}
              className="rounded-xl border border-white/5 bg-white/5 p-3.5 transition-all hover:bg-white/10"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-500/20 text-indigo-400">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="font-heading text-xs font-bold text-white">{comm.sender}</span>
                </div>
                <span className="text-[11px] font-mono text-slate-400">{comm.timestamp}</span>
              </div>

              <p className="mt-2 text-xs text-slate-300 leading-relaxed font-sans">
                "{comm.snippet}"
              </p>

              {comm.urgencyTag && (
                <span className="mt-2 inline-block rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-mono font-semibold text-rose-300">
                  {comm.urgencyTag}
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};
