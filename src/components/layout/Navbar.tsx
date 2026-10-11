import React, { useState } from 'react';
import { Bell, ChevronDown, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';
import { WORKSPACES } from '../../data/workspaces';

export const Navbar: React.FC = () => {
  const { activeWorkspace, isLoadingWorkspace, selectWorkspace } = useWorkspace();
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  return (
    <header className="prism-navbar sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0D13]/85 backdrop-blur-xl">
      <div className="prism-navbar-inner mx-auto flex h-16 max-w-[1600px] items-center justify-between gap-3 px-4 sm:px-6">
        
        {/* Left Section: Logo */}
        <div className="flex items-center">
          <div className="flex items-center gap-3">
            <div className="prism-brand-mark relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/25">
              <span className="font-heading text-xl font-extrabold tracking-wider">P</span>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0B0D13]" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">PRISM</span>
            </div>
          </div>

        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden items-center gap-1 sm:flex">
          <a className="prism-nav-link" href="#demo">Workspace</a>
          <a className="prism-nav-link" href="#features">How it works</a>
        </nav>

        {/* Right Section: Workspace & Notifications */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <button
              type="button"
              aria-expanded={isWorkspaceMenuOpen}
              aria-haspopup="menu"
              disabled={isLoadingWorkspace}
              onClick={() => setIsWorkspaceMenuOpen((open) => !open)}
              className="prism-workspace-select flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 disabled:cursor-wait"
            >
              <Sparkles className="h-3.5 w-3.5 text-amber-700" />
              <span className="max-w-28 truncate sm:max-w-none">
                {isLoadingWorkspace ? 'Loading...' : activeWorkspace.name}
              </span>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
            </button>
            {isWorkspaceMenuOpen && !isLoadingWorkspace && (
              <div role="menu" className="prism-workspace-menu absolute right-0 top-full z-50 mt-2 min-w-52 rounded-xl border border-white/10 bg-[#121623] p-1.5 shadow-2xl">
                {WORKSPACES.map((workspace) => (
                  <button
                    key={workspace.domain}
                    type="button"
                    role="menuitem"
                    disabled={workspace.domain === activeWorkspace.domain}
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      void selectWorkspace(workspace);
                    }}
                    className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-xs text-slate-200 transition-colors hover:bg-white/10 disabled:text-indigo-300"
                  >
                    <span>{workspace.icon}</span>
                    <span>{workspace.name}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
          <button
            className="prism-icon-button relative rounded-lg p-2 text-slate-500 transition-all hover:bg-black/5 hover:text-slate-900"
            title="Notifications"
            aria-label="Notifications"
          >
            <Bell className="h-4 w-4" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-amber-600 ring-2 ring-[#f8f7f3]" />
          </button>
        </div>

      </div>
    </header>
  );
};
