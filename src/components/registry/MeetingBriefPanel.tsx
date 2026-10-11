import React from 'react';
import { CalendarClock, Check, CircleDot, UsersRound } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const agenda = [
  'Review Q3 outcomes and current account health',
  'Align on renewal priorities and next-quarter goals',
  'Confirm owners and follow-up milestones',
];

export const MeetingBriefPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const meeting = liveData?.meetings?.[0];
  const meetingTitle = meeting?.name || meeting?.title || 'Acme Corp • Quarterly strategy';
  const meetingDate = meeting?.scheduled_at || meeting?.held_at || 'Tomorrow, 10:30 AM';

  return (
    <section className="overflow-hidden rounded-2xl border border-amber-200/20 bg-gradient-to-br from-[#262019] via-[#171617] to-[#121623] p-6 shadow-xl">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="inline-flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-[0.18em] text-amber-200/80">
            <CalendarClock className="h-3.5 w-3.5" />
            Executive briefing
          </span>
          <h2 className="mt-2 font-heading text-xl font-semibold text-white md:text-2xl">
            {meetingTitle}
          </h2>
          <p className="mt-1 text-sm text-slate-300">
            {meetingDate} <span className="px-1.5 text-amber-100/60">•</span> 45 minutes
          </p>
        </div>
        <span className="rounded-full border border-amber-200/20 bg-amber-100/10 px-3 py-1 text-[11px] font-medium text-amber-100">
          PREPARED FOR YOU
        </span>
      </div>

      <div className="mt-5 grid gap-5 border-t border-white/10 pt-5 md:grid-cols-[0.8fr_1.2fr]">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Attendees</p>
          <div className="mt-3 flex items-center gap-3">
            <div className="flex -space-x-2">
              {['JD', 'ML', 'AK'].map((initials) => (
                <span
                  key={initials}
                  className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#201d1a] bg-gradient-to-br from-amber-100/80 to-rose-200/60 text-[10px] font-bold text-[#29211f]"
                >
                  {initials}
                </span>
              ))}
            </div>
            <div className="text-xs text-slate-300">
              <p>Jordan Davis + 2</p>
              <p className="mt-0.5 text-slate-500">Acme Corp leadership</p>
            </div>
            <UsersRound className="ml-auto h-4 w-4 text-amber-100/70" />
          </div>
        </div>

        <div>
          <p className="text-[10px] font-mono uppercase tracking-wider text-slate-400">Agenda</p>
          <ul className="mt-3 space-y-2.5">
            {agenda.map((item, index) => (
              <li key={item} className="flex items-start gap-2.5 text-xs leading-relaxed text-slate-200">
                {index === 0 ? (
                  <CircleDot className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-200" />
                ) : (
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-emerald-300" />
                )}
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};
