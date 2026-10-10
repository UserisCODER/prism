import React from 'react';
import { Sparkles, Bell, SlidersHorizontal, HelpCircle, ChevronDown, Cpu, Activity, Send } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const Navbar: React.FC = () => {
  const { layoutPlan, triggerAction } = useWorkspace();
  const totalWidgets = (layoutPlan.hero ? 1 : 0) + layoutPlan.primary.length + layoutPlan.secondary.length;

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0B0D13]/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-[1600px] items-center justify-between px-4 sm:px-6">
        
        {/* Left Section: Logo & Workspace Selector */}
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-3">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-500 font-bold text-white shadow-lg shadow-indigo-500/25">
              <span className="font-heading text-xl font-extrabold tracking-wider">P</span>
              <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-emerald-400 ring-2 ring-[#0B0D13]" />
            </div>
            <div>
              <span className="font-heading text-lg font-bold tracking-tight text-white">PRISM</span>
              <span className="ml-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-mono text-indigo-300">
                v4.2 / orchestration
              </span>
            </div>
          </div>

          <div className="hidden h-5 w-[1px] bg-white/10 md:block" />

          {/* Workspace Dropdown */}
          <button className="hidden items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-medium text-slate-200 transition-all hover:bg-white/10 md:flex">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Acme Enterprise Workspace</span>
            <ChevronDown className="h-3.5 w-3.5 text-slate-400" />
          </button>
        </div>

        {/* Center Section: Navigation Links */}
        <nav className="hidden items-center gap-1 lg:flex">
          {['Workspaces', 'Telemetry', 'Pipelines', 'Models', 'Insights'].map((item, idx) => (
            <button
              key={item}
              className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
                idx === 1
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 font-semibold'
                  : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
              }`}
            >
              {item}
            </button>
          ))}
        </nav>

        {/* Right Section: Telemetry & Actions */}
        <div className="flex items-center gap-3">
          
          {/* Node Status Badge */}
          <div className="hidden items-center gap-2 rounded-full border border-white/10 bg-[#121623]/80 px-3 py-1 text-[11px] font-mono text-slate-300 md:flex">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            <span className="text-slate-400">Orchestrator Ready</span>
            <span className="text-white/20">•</span>
            <span className="text-indigo-300">Latency: 114ms</span>
            <span className="text-white/20">•</span>
            <span className="text-emerald-400">{totalWidgets} widgets active</span>
            <span className="text-white/20">•</span>
            <span className="text-slate-400">NODE: US-EAST-CORE-09</span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => triggerAction('System Telemetry Check', 'Scanned 12 active orchestration nodes')}
              className="relative rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all"
              title="Notifications"
            >
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-indigo-500 ring-2 ring-[#0B0D13]" />
            </button>

            <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <SlidersHorizontal className="h-4 w-4" />
            </button>

            <button className="rounded-lg p-2 text-slate-400 hover:bg-white/5 hover:text-white transition-all">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>

          {/* User Profile & CTA Button */}
          <div className="flex items-center gap-3 border-l border-white/10 pl-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-tr from-purple-500 to-indigo-500 font-semibold text-xs text-white ring-2 ring-indigo-500/30">
              PS
            </div>

            <button
              onClick={() => triggerAction('Deploy Agent', 'Initiated new SLA Sentinel daemon')}
              className="flex items-center gap-2 rounded-full bg-gradient-to-r from-indigo-500 via-purple-600 to-pink-500 px-4 py-1.5 text-xs font-semibold text-white shadow-lg shadow-purple-500/25 transition-all hover:opacity-90 active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Deploy Agent</span>
            </button>
          </div>

        </div>

      </div>
    </header>
  );
};
