import React from 'react';
import { ArrowUpRight, CalendarPlus, FileText, ListChecks, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const actions = [
  {
    title: 'Create follow-up task',
    detail: 'Assign next steps to the account team',
    action: 'Create Follow-up Task',
    icon: ListChecks,
  },
  {
    title: 'Draft a meeting brief',
    detail: 'Prepare a shareable summary',
    action: 'Draft Meeting Brief',
    icon: FileText,
  },
  {
    title: 'Schedule next touchpoint',
    detail: 'Keep the conversation moving',
    action: 'Schedule Touchpoint',
    icon: CalendarPlus,
  },
];

export const SuggestedActionsPanel: React.FC = () => {
  const { triggerAction } = useWorkspace();

  return (
    <section className="rounded-2xl border border-emerald-300/20 bg-gradient-to-br from-[#14201b] to-[#121623] p-5 shadow-xl">
      <div className="flex items-center justify-between border-b border-white/10 pb-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-emerald-300" />
          <h3 className="font-heading text-sm font-semibold text-white">Suggested next steps</h3>
        </div>
        <span className="text-[10px] font-mono text-emerald-200/70">READY TO RUN</span>
      </div>

      <div className="mt-3 space-y-2">
        {actions.map(({ title, detail, action, icon: Icon }) => (
          <button
            key={action}
            onClick={() => void triggerAction(action, detail)}
            className="group flex w-full items-center gap-3 rounded-xl border border-emerald-200/10 bg-emerald-100/[0.035] p-3 text-left transition hover:border-emerald-200/30 hover:bg-emerald-100/[0.08]"
          >
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-300/10 text-emerald-200">
              <Icon className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-xs font-semibold text-slate-100">{title}</span>
              <span className="mt-0.5 block text-[11px] text-slate-400">{detail}</span>
            </span>
            <ArrowUpRight className="h-4 w-4 text-emerald-200/50 transition group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-emerald-200" />
          </button>
        ))}
      </div>
    </section>
  );
};
