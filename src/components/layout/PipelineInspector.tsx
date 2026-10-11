import React from 'react';
import { Activity, ArrowRight, Braces, Database, Layers3, Sparkles } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

const PipelineStep: React.FC<{
  title: string;
  endpoint: string;
  response: unknown | null;
}> = ({ title, endpoint, response }) => (
  <details className="group rounded-xl border border-white/10 bg-black/20 p-4" open={response !== null}>
    <summary className="flex cursor-pointer list-none items-center justify-between gap-3">
      <span>
        <span className="block text-xs font-semibold text-slate-100">{title}</span>
        <code className="mt-1 block text-[10px] text-indigo-300">{endpoint}</code>
      </span>
      <Braces className="h-4 w-4 shrink-0 text-slate-500 transition group-open:text-indigo-300" />
    </summary>
    {response !== null ? (
      <pre className="mt-3 max-h-72 overflow-auto whitespace-pre-wrap break-words rounded-lg bg-[#080a10] p-3 text-[10px] leading-relaxed text-slate-300">
        {JSON.stringify(response, null, 2)}
      </pre>
    ) : (
      <p className="mt-3 text-xs text-slate-500">Run an intent to see this API response.</p>
    )}
  </details>
);

export const PipelineInspector: React.FC = () => {
  const { pipelineTrace } = useWorkspace();

  return (
    <section className="mb-8 grid gap-5 rounded-2xl border border-white/10 bg-[#10121a]/90 p-5 shadow-xl lg:grid-cols-[1.15fr_0.85fr] lg:p-6">
      <div>
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-indigo-300">Live API trace</p>
            <h3 className="mt-1 text-lg font-semibold text-white">Pipeline inspector</h3>
          </div>
          <a
            href="/api/debug/last-intent"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-2 text-[11px] text-slate-300 transition hover:border-indigo-400/40 hover:text-white"
          >
            <Activity className="h-3.5 w-3.5" />
            Backend debug snapshot
          </a>
        </div>

        <div className="space-y-3">
          <PipelineStep
            title="1. Parsed intent"
            endpoint="POST /api/intent"
            response={pipelineTrace?.intentResponse ?? null}
          />
          <PipelineStep
            title="2. Adaptive layout"
            endpoint="POST /api/layout"
            response={pipelineTrace?.layoutResponse ?? null}
          />
          <PipelineStep
            title="3. Layout delta"
            endpoint="POST /api/delta"
            response={pipelineTrace?.deltaResponse ?? null}
          />
        </div>
      </div>

      <div className="flex flex-col justify-center rounded-xl border border-white/[0.07] bg-white/[0.025] p-5">
        <div>
          <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-amber-100/60">How PRISM works</p>
          <h3 className="mt-1 text-lg font-semibold text-white">From request to workspace</h3>
        </div>
        <div className="mt-6 grid grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] items-center gap-2 text-center">
          <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-3">
            <Sparkles className="mx-auto h-4 w-4 text-amber-200" />
            <span className="mt-2 block text-[10px] font-medium text-slate-200">Utterance</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-3">
            <Braces className="mx-auto h-4 w-4 text-indigo-300" />
            <span className="mt-2 block text-[10px] font-medium text-slate-200">Intent</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-3">
            <Layers3 className="mx-auto h-4 w-4 text-purple-300" />
            <span className="mt-2 block text-[10px] font-medium text-slate-200">Layout</span>
          </div>
          <ArrowRight className="h-3.5 w-3.5 text-slate-600" />
          <div className="rounded-lg border border-white/10 bg-black/20 px-2 py-3">
            <Database className="mx-auto h-4 w-4 text-emerald-300" />
            <span className="mt-2 block text-[10px] font-medium text-slate-200">Panels</span>
          </div>
        </div>
        <p className="mt-4 text-xs leading-relaxed text-slate-400">
          Gemini parses the request and selects registered panels; the frontend renders them by zone, then requests a delta on follow-up queries.
        </p>
      </div>
    </section>
  );
};
