import React from 'react';
import { HelpCircle, CheckCircle2, X } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const ClarifyingModal: React.FC = () => {
  const { currentIntent, showClarifyingModal, dismissClarifyingModal, submitIntent } = useWorkspace();

  if (!showClarifyingModal || !currentIntent.clarifying_question) return null;

  const handleOptionSelect = (optionText: string) => {
    dismissClarifyingModal();
    submitIntent(`Prepare client meeting for ${optionText}`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-indigo-500/40 bg-[#121623] p-6 shadow-2xl">
        
        {/* Glow Header */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/20 text-indigo-400">
              <HelpCircle className="h-6 w-6 animate-pulse" />
            </div>
            <div>
              <span className="text-xs font-mono uppercase text-indigo-400 tracking-wider">
                INTENT DISAMBIGUATION NEEDED
              </span>
              <h3 className="font-heading text-lg font-bold text-white">
                {currentIntent.clarifying_question}
              </h3>
            </div>
          </div>

          <button
            onClick={dismissClarifyingModal}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <p className="mt-3 text-xs text-slate-400 leading-relaxed">
          PRISM detected multiple candidate contexts for your utterance. Select one of the options below to compose your workspace:
        </p>

        {/* Option Chips */}
        <div className="mt-5 space-y-2.5">
          {currentIntent.clarifying_options?.map((option, idx) => (
            <button
              key={idx}
              onClick={() => handleOptionSelect(option)}
              className="group flex w-full items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3.5 text-left text-sm font-medium text-slate-200 transition-all hover:border-indigo-500/50 hover:bg-indigo-600/15 hover:text-white hover:shadow-lg hover:shadow-indigo-500/10"
            >
              <span className="flex items-center gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 font-mono text-xs text-indigo-300 group-hover:bg-indigo-500 group-hover:text-white">
                  {idx + 1}
                </span>
                <span>{option}</span>
              </span>
              <CheckCircle2 className="h-4 w-4 text-slate-500 opacity-0 transition-opacity group-hover:opacity-100 group-hover:text-indigo-400" />
            </button>
          ))}
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={dismissClarifyingModal}
            className="rounded-lg px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
          >
            Cancel & Use Generic Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
