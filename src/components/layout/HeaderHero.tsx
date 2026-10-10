import React from 'react';
import { Target, Cpu, Activity, Zap } from 'lucide-react';
import { IntentBar } from './IntentBar';
import { useWorkspace } from '../../context/WorkspaceContext';

export const HeaderHero: React.FC = () => {
  const { layoutPlan } = useWorkspace();
  const activeWidgetCount = (layoutPlan.hero ? 1 : 0) + layoutPlan.primary.length + layoutPlan.secondary.length;

  return (
    <div className="relative overflow-hidden pt-12 pb-8 text-center">
      {/* Ambient Radial Background Glows */}
      <div className="pointer-events-none absolute left-1/2 top-0 -z-10 h-[450px] w-[800px] -translate-x-1/2 rounded-full bg-gradient-to-tr from-indigo-600/20 via-purple-600/15 to-pink-500/10 blur-[120px]" />
      
      <div className="mx-auto max-w-5xl px-4">
        
        {/* Floating Feature Badges */}
        <div className="mb-6 flex flex-wrap items-center justify-center gap-3">
          <div className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300 backdrop-blur-md">
            <Target className="h-3.5 w-3.5 text-indigo-400" />
            <span>Adaptive Intent</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-purple-500/30 bg-purple-500/10 px-3 py-1 text-xs font-medium text-purple-300 backdrop-blur-md">
            <Cpu className="h-3.5 w-3.5 text-purple-400" />
            <span>AI-orchestrated</span>
          </div>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-xs font-medium text-emerald-300 backdrop-blur-md">
            <Activity className="h-3.5 w-3.5 text-emerald-400" />
            <span>Real-time Synthesis</span>
          </div>
        </div>

        {/* Main Hero Title */}
        <h1 className="font-heading text-4xl font-extrabold tracking-tight text-white md:text-5xl lg:text-6xl">
          Platform For Next Level AI Orchestration
        </h1>

        <p className="mx-auto mt-4 max-w-2xl text-sm md:text-base text-slate-400 leading-relaxed">
          Type any objective or speak a goal. PRISM dynamically arranges task-specific telemetry, predictive intelligence, and operational pipelines in real-time.
        </p>

        {/* Central Intent Bar */}
        <div className="mt-8">
          <IntentBar />
        </div>

      </div>

      {/* Telemetry Status Bar below Hero */}
      <div className="mx-auto mt-8 max-w-[1600px] px-4 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#121623]/80 px-4 py-2.5 backdrop-blur-md text-xs font-mono text-slate-300">
          
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Intent Engine:</span>
            <span className="text-emerald-400">Active Synthesis</span>
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

    </div>
  );
};
