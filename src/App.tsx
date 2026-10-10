import React, { useState } from 'react';
import { WorkspaceProvider, useWorkspace } from './context/WorkspaceContext';
import { Navbar } from './components/layout/Navbar';
import { HeaderHero } from './components/layout/HeaderHero';
import { IntentCard } from './components/intent/IntentCard';
import { ExplainabilityLog } from './components/layout/ExplainabilityLog';
import { ActiveAgents } from './components/layout/ActiveAgents';
import { RegistryContainer } from './components/registry/RegistryContainer';
import { QuickActionDock } from './components/layout/QuickActionDock';
import { ClarifyingModal } from './components/intent/ClarifyingModal';
import { ExplainabilityModal } from './components/common/ExplainabilityModal';
import { ToastContainer } from './components/common/ToastContainer';
import { Play, Sparkles, Layers, ShieldCheck, Zap, ArrowRight } from 'lucide-react';

const MainWorkspaceCanvas: React.FC = () => {
  const { activeRegistry, layoutPlan, submitIntent } = useWorkspace();
  const [showExtensionCatalog, setShowExtensionCatalog] = useState(false);

  return (
    <main className="mx-auto max-w-[1600px] px-4 sm:px-6 pb-32">
      
      {/* Hackwave 3.0 Judge Presentation & Scenario Runner Bar (FR-7) */}
      <div className="mb-6 rounded-2xl border border-indigo-500/40 bg-gradient-to-r from-[#121623] via-[#161b2e] to-[#121623] p-4 backdrop-blur-xl shadow-2xl">
        <div className="flex flex-wrap items-center justify-between gap-4">
          
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/20 text-emerald-400 ring-1 ring-emerald-500/40">
              <Play className="h-4 w-4 fill-current" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading text-sm font-bold text-white">HACKWAVE 3.0 DEMO SCENARIOS</span>
                <span className="rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-indigo-300 border border-indigo-500/30">
                  PS-4 / HUMAN-CENTERED AI
                </span>
              </div>
              <p className="text-xs text-slate-400">Click any task to demonstrate live AI intent-to-interface adaptation:</p>
            </div>
          </div>

          {/* Scenario Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => submitIntent("I need to prepare tomorrow's client meeting")}
              className="flex items-center gap-1.5 rounded-xl border border-indigo-500/40 bg-indigo-500/10 px-3.5 py-2 text-xs font-medium text-indigo-200 hover:bg-indigo-500/20 hover:text-white transition-all shadow-md active:scale-95"
            >
              <span>Scenario A: Client Meeting Prep</span>
            </button>

            <button
              onClick={() => submitIntent("Investigate the drop in product usage")}
              className="flex items-center gap-1.5 rounded-xl border border-rose-500/40 bg-rose-500/10 px-3.5 py-2 text-xs font-medium text-rose-200 hover:bg-rose-500/20 hover:text-white transition-all shadow-md active:scale-95"
            >
              <span>Scenario B: Usage Drop Audit</span>
            </button>

            <button
              onClick={() => submitIntent("Review overdue project work")}
              className="flex items-center gap-1.5 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-medium text-amber-200 hover:bg-amber-500/20 hover:text-white transition-all shadow-md active:scale-95"
            >
              <span>Scenario C: Overdue Work Review</span>
            </button>

            <button
              onClick={() => submitIntent("Actually, focus on the client at risk of churn")}
              className="flex items-center gap-1.5 rounded-xl border border-purple-500/50 bg-gradient-to-r from-purple-600/30 to-pink-600/30 px-4 py-2 text-xs font-bold text-purple-100 hover:from-purple-600/40 hover:to-pink-600/40 hover:text-white transition-all shadow-lg active:scale-95"
            >
              <Sparkles className="h-3.5 w-3.5 text-pink-400" />
              <span>✨ Mid-Task Pivot (Win Move)</span>
            </button>

            <button
              onClick={() => setShowExtensionCatalog(!showExtensionCatalog)}
              className="flex items-center gap-1.5 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-mono text-slate-300 hover:bg-white/10 transition-all"
              title="Toggle 22-Component Extension Registry Architecture View"
            >
              <Layers className="h-3.5 w-3.5 text-indigo-400" />
              <span>{showExtensionCatalog ? 'Hide Extension Catalog' : 'View 22-Component Registry'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* Extension Registry Modal / View for Mentor Alignment */}
      {showExtensionCatalog && (
        <div className="mb-6 rounded-2xl border border-indigo-500/40 bg-[#121623] p-6 backdrop-blur-xl shadow-2xl animate-fade-in">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-indigo-400" />
              <h3 className="font-heading font-bold text-white text-base">
                PRISM Closed Extension Registry (22 Typed Components)
              </h3>
            </div>
            <span className="rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-mono font-bold text-emerald-400 border border-emerald-500/30">
              ZERO-HALLUCINATION GUARANTEE
            </span>
          </div>

          <p className="mt-2 text-xs text-slate-300 leading-relaxed">
            Every screen generated by PRISM is assembled from this closed set of 22 pre-tested extension modules. The LLM tool-caller parameterizes components rather than generating raw HTML, ensuring 100% design-system lock and instant streamed response times.
          </p>

          <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {Object.values(activeRegistry).map((comp) => (
              <div
                key={comp.id}
                className="rounded-xl border border-white/10 bg-white/5 p-3 text-xs transition-all hover:bg-white/10"
              >
                <div className="flex items-center justify-between font-mono font-bold text-indigo-300 text-[11px]">
                  <span>{comp.id}</span>
                  <span className="text-slate-400">{comp.category}</span>
                </div>
                <h4 className="mt-1 font-heading font-semibold text-white text-xs">{comp.name}</h4>
                <p className="mt-1 text-[11px] text-slate-400 line-clamp-2">{comp.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      <IntentCard />

      {/* 12-Column Responsive Grid Canvas matching UI Reference */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        
        {/* Left Column (8 cols): Hero + Primary + Secondary Panels */}
        <div className="space-y-6 lg:col-span-8">
          
          {/* Hero Zone */}
          {layoutPlan.hero && (
            <div className="w-full">
              <RegistryContainer panel={layoutPlan.hero} />
            </div>
          )}

          {/* Primary Zone Panels */}
          {layoutPlan.primary.length > 0 && (
            <div className="space-y-6">
              {layoutPlan.primary.map((panel) => (
                <RegistryContainer key={panel.instanceId} panel={panel} />
              ))}
            </div>
          )}

          {/* Secondary Zone Panels */}
          {layoutPlan.secondary.length > 0 && (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
              {layoutPlan.secondary.map((panel) => (
                <RegistryContainer key={panel.instanceId} panel={panel} />
              ))}
            </div>
          )}

        </div>

        {/* Right Rail (4 cols): Explainability Log & Active Agents */}
        <div className="space-y-6 lg:col-span-4">
          <ExplainabilityLog />
          <ActiveAgents />
        </div>

      </div>

    </main>
  );
};

export function App() {
  return (
    <WorkspaceProvider>
      <div className="min-h-screen bg-[#0B0D13] text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
        <Navbar />
        <HeaderHero />
        <MainWorkspaceCanvas />
        <QuickActionDock />
        <ClarifyingModal />
        <ExplainabilityModal />
        <ToastContainer />
      </div>
    </WorkspaceProvider>
  );
}

export default App;
