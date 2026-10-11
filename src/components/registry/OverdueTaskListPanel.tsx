import React from 'react';
import { AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { seededTasks } from '../../data/seededDatabase';
import { useWorkspace } from '../../context/WorkspaceContext';

export const OverdueTaskListPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();
  const { liveData } = useWorkspace();
  const rawTasks = liveData?.tasks;
  const tasks = rawTasks && rawTasks.length > 0
    ? rawTasks.map((t: any) => ({
        id: t.id,
        title: t.title ?? 'Untitled Task',
        project: t.project ?? 'Project',
        assignee: t.assignee ?? 'Unassigned',
        dueDate: t.dueDate ?? t.due_date ?? 'TBD',
        status: t.status ?? 'overdue',
      }))
    : seededTasks;

  return (
    <div className="rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-6 backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h3 className="font-heading font-bold text-white text-lg">
            Overdue & Urgent Tasks List
          </h3>
          <p className="text-xs text-slate-400">Ranked by deadline severity and project owner</p>
        </div>
        <span className="rounded-full bg-rose-500/20 px-3 py-1 text-xs font-mono font-bold text-rose-400 border border-rose-500/30">
          {tasks.length} ACTION ITEMS
        </span>
      </div>

      <div className="mt-4 space-y-3">
        {tasks.map((t) => (
          <div
            key={t.id}
            className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-4 transition-all hover:bg-white/10"
          >
            <div className="flex items-start gap-3">
              <span
                className={`mt-1 flex h-2.5 w-2.5 shrink-0 rounded-full ${
                  t.status === 'overdue'
                    ? 'bg-rose-500 animate-pulse'
                    : t.status === 'blocked'
                    ? 'bg-amber-500'
                    : 'bg-indigo-500'
                }`}
              />
              <div>
                <h4 className="font-heading text-sm font-semibold text-white">{t.title}</h4>
                <div className="mt-1 flex flex-wrap items-center gap-2 text-xs font-mono text-slate-400">
                  <span className="text-indigo-400">{t.project}</span>
                  <span>•</span>
                  <span>Assignee: <strong className="text-slate-200">{t.assignee}</strong></span>
                  <span>•</span>
                  <span className="text-rose-400">Due: {t.dueDate}</span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => triggerAction('Reassign Task', `Reassigned task ${t.id}`)}
                className="rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-300 hover:bg-white/10"
              >
                Reassign
              </button>
              <button
                onClick={() => triggerAction('Resolve Task', `Marked ${t.id} as resolved`)}
                className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
