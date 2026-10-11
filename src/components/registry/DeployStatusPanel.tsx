import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { Rocket, CheckCircle, XCircle, Clock } from 'lucide-react';

export const DeployStatusPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const runs = liveData?.github_ci_runs ?? [
    { id: 1, name: 'Production Deploy', status: 'success', branch: 'main', duration: '2m 14s' },
    { id: 2, name: 'Staging Deploy', status: 'running', branch: 'feat/intent', duration: '1m 02s' },
  ];

  const statusIcon = (status: string) => {
    if (status === 'success') return <CheckCircle className="h-4 w-4 text-[#238636]" />;
    if (status === 'failed' || status === 'failure') return <XCircle className="h-4 w-4 text-[#f85149]" />;
    return <Clock className="h-4 w-4 text-[#f0883e]" />;
  };

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <Rocket className="h-5 w-5 text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Deploy Status</h2>
      </div>
      <div className="space-y-3">
        {runs.map((run: any, i: number) => (
          <div key={run.id ?? i} className="flex items-center gap-3 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            {statusIcon(run.status)}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e6edf3] truncate">{run.name}</p>
              <p className="text-xs text-[#8b949e] mt-0.5">{run.branch}</p>
            </div>
            <span className="text-xs text-[#8b949e]">{run.duration ?? ''}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
