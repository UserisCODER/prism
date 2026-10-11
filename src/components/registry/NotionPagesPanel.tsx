import React from 'react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { FileText, Clock } from 'lucide-react';

export const NotionPagesPanel: React.FC = () => {
  const { liveData } = useWorkspace();
  const pages = liveData?.notion_pages ?? [
    { id: 1, title: 'Q4 Product Roadmap', last_edited: '2h ago', status: 'In Progress' },
    { id: 2, title: 'Engineering Onboarding Guide', last_edited: '1d ago', status: 'Published' },
    { id: 3, title: 'PRISM Demo Script', last_edited: '3h ago', status: 'Draft' },
  ];

  return (
    <div className="rounded-2xl border border-[#30363d] bg-[#161b22] p-5 h-full">
      <div className="flex items-center gap-2 mb-4">
        <FileText className="h-5 w-5 text-[#58a6ff]" />
        <h2 className="text-sm font-semibold text-[#e6edf3]">Notion Pages</h2>
        <span className="ml-auto text-xs text-[#8b949e] bg-[#21262d] px-2 py-0.5 rounded-full">{pages.length} pages</span>
      </div>
      <div className="space-y-3">
        {pages.map((page: any, i: number) => (
          <div key={page.id ?? i} className="flex items-start gap-3 p-3 rounded-lg bg-[#21262d] border border-[#30363d]">
            <FileText className="h-4 w-4 text-[#58a6ff] mt-0.5 shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#e6edf3] truncate">{page.title}</p>
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="h-3 w-3 text-[#8b949e]" />
                <p className="text-xs text-[#8b949e]">{page.last_edited}</p>
              </div>
            </div>
            <span className="text-xs text-[#8b949e] bg-[#30363d] px-2 py-0.5 rounded-full shrink-0">{page.status}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
