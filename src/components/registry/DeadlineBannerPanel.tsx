import React from 'react';
import { Clock, AlertTriangle, UserCheck, ShieldAlert } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const DeadlineBannerPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();

  return (
    <div className="relative overflow-hidden rounded-2xl border border-amber-500/40 bg-gradient-to-r from-amber-950/60 via-[#121623] to-[#121623] p-6 backdrop-blur-xl shadow-2xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-amber-500/20 text-amber-400 ring-2 ring-amber-500/40 animate-pulse">
            <Clock className="h-7 w-7" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-amber-500/20 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-300 border border-amber-500/40 uppercase">
                OVERDUE WORK & DELIVERY BLOCKERS
              </span>
              <span className="text-xs font-mono text-slate-400">3 Projects Slipping</span>
            </div>

            <h2 className="mt-1 font-heading text-2xl font-extrabold text-white">
              5 Overdue Deliverables & Critical Blockers
            </h2>

            <p className="mt-1 text-xs md:text-sm text-slate-300">
              Immediate attention required for <span className="font-bold text-amber-400">Project Meridian</span> and <span className="font-bold text-rose-400">Project Apex</span> before Q3 milestone reviews.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerAction('Escalate Overdue Tasks', 'Sent priority notification to project leads')}
            className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 px-5 py-2.5 text-xs font-bold text-white shadow-lg shadow-amber-500/30 transition-all hover:opacity-90 active:scale-95"
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Escalate All Blockers</span>
          </button>
        </div>
      </div>
    </div>
  );
};
