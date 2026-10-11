import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CheckSquare, Square } from 'lucide-react';

export const NotionTasksPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const tasks = liveData?.notion_tasks ?? [
    { id: 1, title: 'Finalize PRISM demo flow', done: false, assignee: 'you', due: 'Today' },
    { id: 2, title: 'Write judging submission', done: false, assignee: 'you', due: 'Tomorrow' },
    { id: 3, title: 'Seed Salesforce workspace', done: true, assignee: 'you', due: 'Done' },
  ];

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="h-5 w-5 text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Notion Tasks</h2>
        <span className="ml-auto text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full">
          {tasks.filter((t: any) => !t.done).length} open
        </span>
      </div>
      <div className="space-y-3">
        {tasks.map((task: any, i: number) => (
          <div key={task.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            {task.done
              ? <CheckSquare className="h-4 w-4 text-[#238636] mt-0.5 shrink-0" />
              : <Square className="h-4 w-4 text-[#8b949e] mt-0.5 shrink-0" />}
            <div className="flex-1 min-w-0">
              <p className={`text-sm truncate ${task.done ? 'line-through text-[#8b949e]' : 'text-[#e6edf3]'}`}>{task.title}</p>
              <p className="text-xs text-[#8b949e] mt-0.5">{task.assignee} · due {task.due}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
