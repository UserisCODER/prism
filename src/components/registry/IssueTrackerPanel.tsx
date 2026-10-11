import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { CircleDot } from 'lucide-react';

export const IssueTrackerPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const issues = liveData?.github_issues ?? [
    { id: 1, title: 'Intent API timeout on large payloads', label: 'bug', priority: 'high' },
    { id: 2, title: 'Add Salesforce workspace support', label: 'enhancement', priority: 'medium' },
    { id: 3, title: 'Improve panel animation on mobile', label: 'ux', priority: 'low' },
  ];

  const priorityColor = (p: string) =>
    p === 'high' ? 'text-[#f85149]' : p === 'medium' ? 'text-[#f0883e]' : 'text-[#8b949e]';

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <CircleDot className="h-5 w-5 text-[#238636]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Open Issues</h2>
        <span className="ml-auto text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full">{issues.length}</span>
      </div>
      <div className="space-y-3">
        {issues.map((issue: any, i: number) => (
          <div key={issue.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            <CircleDot className="h-4 w-4 text-[#238636] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e6edf3] truncate">{issue.title}</p>
              <p className={`text-xs mt-0.5 ${priorityColor(issue.priority)}`}>{issue.priority} priority · {issue.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
