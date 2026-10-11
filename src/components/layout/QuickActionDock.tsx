import React from 'react';
import { Zap, Plus, FileEdit, Search, SlidersHorizontal, RotateCcw, RotateCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const QuickActionDock: React.FC = () => {
  const { triggerAction, undoLayout, resetLayout, undoStack } = useWorkspace();

  return (
    <div className="fixed bottom-4 left-1/2 z-40 -translate-x-1/2 px-4">
      <div className="flex flex-wrap items-center gap-2 rounded-2xl border border-white/10 bg-black/95 p-2 backdrop-blur-2xl shadow-2xl shadow-black/50">
        
        {/* Label */}
        <div className="flex items-center gap-1.5 border-r border-white/10 px-3 py-1 text-xs font-mono font-bold text-white">
          <Zap className="h-4 w-4 text-amber-400" />
          <span className="hidden sm:inline">Quick Actions:</span>
        </div>

        {/* Action Pills */}
        <button
          onClick={() => triggerAction('Create Prep Task', 'Created task "Prepare Acme Q3 sync deck" in Jira')}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:border-white/30 hover:bg-white/5 active:scale-95"
        >
          <Plus className="h-3.5 w-3.5 text-indigo-400" />
          <span>Create prep task</span>
        </button>

        <button
          onClick={() => triggerAction('Draft Agenda', 'Generated 4-point agenda draft in Google Docs')}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:border-white/30 hover:bg-white/5 active:scale-95"
        >
          <FileEdit className="h-3.5 w-3.5 text-purple-400" />
          <span>Draft agenda</span>
        </button>

        <button
          onClick={() => triggerAction('Open CRM Record', 'Opened Acme Enterprise Salesforce profile')}
          className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-black px-3.5 py-1.5 text-xs font-medium text-white transition-all hover:border-white/30 hover:bg-white/5 active:scale-95"
        >
          <Search className="h-3.5 w-3.5 text-emerald-400" />
          <span>Open CRM record</span>
        </button>

        {/* Undo & Reset Controls */}
        <div className="flex items-center gap-1 border-l border-white/10 pl-2">
          <button
            onClick={undoLayout}
            disabled={undoStack.length === 0}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-black px-2.5 py-1.5 text-xs font-mono text-white hover:bg-white/5 disabled:opacity-30"
            title="Undo last layout change"
          >
            <RotateCcw className="h-3.5 w-3.5 text-indigo-400" />
            <span className="hidden md:inline">Undo</span>
          </button>

          <button
            onClick={resetLayout}
            className="flex items-center gap-1 rounded-xl border border-white/10 bg-black px-2.5 py-1.5 text-xs font-mono text-white hover:bg-white/5"
            title="Reset workspace to generic dashboard"
          >
            <RotateCw className="h-3.5 w-3.5 text-slate-400" />
            <span className="hidden md:inline">Reset</span>
          </button>
        </div>

      </div>
    </div>
  );
};
