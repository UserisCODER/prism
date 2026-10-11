import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { XCircle, AlertTriangle } from 'lucide-react';

export const FailingTestsPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const runs = liveData?.github_ci_runs ?? [
    { id: 1, name: 'unit/auth.test.ts', status: 'failed', branch: 'main' },
    { id: 2, name: 'integration/api.test.ts', status: 'failed', branch: 'feat/intent' },
  ];
  const failing = runs.filter((r: any) => r.status === 'failed' || r.status === 'failure');

  return (
    <div className="rounded-2xl border border-[#f85149]/30 bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <XCircle className="h-5 w-5 text-[#f85149]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">CI Failures</h2>
        <span className="ml-auto text-xs text-[#f85149] bg-[#f85149]/10 px-2 py-0.5 rounded-full">{failing.length} failing</span>
      </div>
      {failing.length === 0 ? (
        <p className="text-sm text-[#238636]">All checks passing ✓</p>
      ) : (
        <div className="space-y-3">
          {failing.map((run: any, i: number) => (
            <div key={run.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-[#21262d] border border-[#f85149]/20">
              <AlertTriangle className="h-4 w-4 text-[#f85149] mt-0.5 shrink-0" />
              <div>
                <p className="text-sm text-[#e6edf3]">{run.name}</p>
                <p className="text-xs text-[#8b949e] mt-0.5">branch: {run.branch}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
