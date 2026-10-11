import React from 'react';
import { Cpu, Activity, Zap, ArrowDown } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const HeaderHero: React.FC = () => {
  const { layoutPlan } = useWorkspace();
  const activeWidgetCount = (layoutPlan.hero ? 1 : 0) + layoutPlan.primary.length + layoutPlan.secondary.length;

  return (
    <section className="prism-hero relative overflow-hidden pt-12 pb-7 text-center">
      <div className="prism-hero-art pointer-events-none absolute inset-0" />

      <div className="prism-hero-content relative mx-auto max-w-5xl px-4">
        <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
          <div className="prism-hero-badge inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>AI-orchestrated</span>
          </div>
          <div className="prism-hero-badge inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Real-time synthesis</span>
          </div>
        </div>

        <p className="prism-eyebrow">Your intelligence, in focus</p>
        <h1 className="prism-hero-title mx-auto max-w-4xl font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          See the signal.<br className="hidden sm:block" /> Shape what’s next.
        </h1>
        <p className="prism-hero-description mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-slate-300 md:text-base">
          One clear view of your workspace, live operations, and the decisions that move you forward.
        </p>
        <a className="prism-scroll-cue mt-7 inline-flex items-center gap-2 text-xs font-medium text-slate-300" href="#workspace">
          Explore your workspace <ArrowDown className="h-3.5 w-3.5" />
        </a>
      </div>

      <div className="prism-status-wrap relative mx-auto mt-9 max-w-[1600px] px-4 sm:px-6">
        <div className="prism-statusbar flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121623]/80 px-4 py-2.5 text-xs font-mono text-slate-300 backdrop-blur-md">
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-emerald-400">Workspace active</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Active Layout:</span>
            <span className="font-semibold text-indigo-300">
              {layoutPlan.scenarioName} ({activeWidgetCount} widgets deployed)
            </span>
          </div>

          <div className="hidden items-center gap-4 md:flex">
            <div>
              <span className="text-slate-400">MODEL: </span>
              <span className="text-purple-300">GEMINI-2.0-FLASH</span>
            </div>
            <div>
              <span className="text-slate-400">LATENCY: </span>
              <span className="text-emerald-400">140ms</span>
            </div>
            <div>
              <span className="text-slate-400">CACHE HIT: </span>
              <span className="text-indigo-300">98.4%</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-full bg-purple-500/20 px-2.5 py-0.5 text-[11px] font-bold text-purple-300 border border-purple-500/30">
            <Zap className="h-3 w-3 text-purple-400" />
            <span>AUTONOMOUS</span>
          </div>
        </div>
      </div>
    </section>
  );
};
