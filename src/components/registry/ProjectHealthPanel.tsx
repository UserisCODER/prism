import { useWorkspace } from '../../context/WorkspaceContext';
import React from 'react';
import { FolderGit2, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { seededProjects } from '../../data/seededDatabase';

export const ProjectHealthPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const rawProjects = liveData?.projects;
  const projects = rawProjects && rawProjects.length > 0
    ? rawProjects.map((p: any) => ({
        id: p.id,
        name: p.name ?? 'Project',
        health: p.health ?? 'on_track',
        completionPct: p.completionPct ?? p.completion_pct ?? 50,
        overdueCount: p.overdueCount ?? p.overdue_count ?? 0,
      }))
    : seededProjects;
  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <h3 className="font-heading font-bold text-white text-base">
          Project Health & Overdue Trackers
        </h3>
        <span className="text-xs font-mono text-slate-400">{projects.length} ACTIVE PROJECTS</span>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-3">
        {projects.map((p) => (
          <div
            key={p.id}
            className="rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
          >
            <div className="flex items-center justify-between">
              <span className="font-heading text-xs font-bold text-white">{p.name}</span>
              <span
                className={`rounded-full px-2 py-0.5 text-[10px] font-mono font-bold uppercase ${
                  p.health === 'critical'
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                    : p.health === 'at_risk'
                    ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                }`}
              >
                {p.health}
              </span>
            </div>

            <div className="mt-3">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Completion</span>
                <span className="text-white font-bold">{p.completionPct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-indigo-500"
                  style={{ width: `${p.completionPct}%` }}
                />
              </div>
            </div>

            <div className="mt-3 text-[11px] font-mono text-slate-400">
              Overdue Tasks: <strong className="text-rose-400">{p.overdueCount}</strong>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
