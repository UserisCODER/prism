import React from 'react';
import { CheckCircle2, Info, AlertTriangle, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useWorkspace();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed top-20 right-6 z-50 flex flex-col gap-2.5 max-w-sm w-full">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="flex items-start justify-between rounded-xl border border-indigo-500/30 bg-[#121623]/95 p-4 backdrop-blur-xl shadow-2xl shadow-indigo-950/40 animate-slide-in"
        >
          <div className="flex items-start gap-3">
            {t.type === 'success' ? (
              <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0 mt-0.5" />
            ) : t.type === 'warning' ? (
              <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
            ) : (
              <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
            )}
            <div>
              <h4 className="font-heading text-xs font-bold text-white">{t.title}</h4>
              <p className="mt-0.5 text-xs text-slate-300 leading-relaxed font-sans">{t.message}</p>
            </div>
          </div>

          <button
            onClick={() => removeToast(t.id)}
            className="text-slate-400 hover:text-white p-0.5"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ))}
    </div>
  );
};
