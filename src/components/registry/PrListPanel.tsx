import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { GitPullRequest, CheckCircle, Clock } from 'lucide-react';

export const PrListPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const prs = liveData?.github_prs ?? [
    { id: 1, title: 'feat: add intent routing', author: 'alice', status: 'open', reviews: 2 },
    { id: 2, title: 'fix: layout fallback bug', author: 'bob', status: 'review', reviews: 1 },
    { id: 3, title: 'chore: update deps', author: 'carol', status: 'open', reviews: 0 },
  ];

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <GitPullRequest className="h-5 w-5 text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Open Pull Requests</h2>
        <span className="ml-auto text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full">{prs.length} open</span>
      </div>
      <div className="space-y-3">
        {prs.map((pr: any, i: number) => (
          <div key={pr.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            <GitPullRequest className="h-4 w-4 text-[#238636] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e6edf3] truncate">{pr.title}</p>
              <p className="text-xs text-[#8b949e] mt-0.5">{pr.author} · {pr.reviews} review{pr.reviews !== 1 ? 's' : ''}</p>
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full shrink-0 ${pr.status === 'review' ? 'bg-[#f0883e]/20 text-[#f0883e]' : 'bg-[#238636]/20 text-[#238636]'}`}>
              {pr.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
