import React, { useState, useEffect } from 'react';
import { Mic, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';
import { useWorkspace } from '../../context/WorkspaceContext';

export const IntentBar: React.FC = () => {
  const { submitIntent, isAnalyzing } = useWorkspace();
  const [inputText, setInputText] = useState<string>('');
  const [isListening, setIsListening] = useState<boolean>(false);
  const [speechSupported, setSpeechSupported] = useState<boolean>(true);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setSpeechSupported(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputText.trim()) {
      submitIntent(inputText);
    }
  };

  const handleSuggestionClick = (suggestionText: string) => {
    setInputText(suggestionText);
    submitIntent(suggestionText);
  };

  const toggleVoiceInput = () => {
    if (!speechSupported) return;

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-US';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0].transcript)
          .join('');
        setInputText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl px-4">
      {/* Intent Bar Input Container */}
      <form
        onSubmit={handleSubmit}
        className="group relative flex items-center rounded-2xl border border-indigo-500/30 bg-[#121623]/90 p-2 backdrop-blur-2xl shadow-2xl transition-all duration-300 focus-within:border-indigo-400 focus-within:ring-4 focus-within:ring-indigo-500/20"
      >
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 group-focus-within:text-indigo-300">
          <Sparkles className={`h-5 w-5 ${isAnalyzing ? 'animate-spin' : ''}`} />
        </div>

        <input
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          placeholder="Tell PRISM what you want to get done..."
          className="w-full bg-transparent px-4 font-sans text-sm md:text-base text-slate-100 placeholder-slate-400 focus:outline-none"
        />

        <div className="flex items-center gap-2">
          {/* Voice Speech Recognition Button */}
          {speechSupported && (
            <button
              type="button"
              onClick={toggleVoiceInput}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl transition-all ${
                isListening
                  ? 'bg-rose-500/20 text-rose-400 ring-2 ring-rose-500/50 animate-pulse'
                  : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white'
              }`}
              title={isListening ? 'Listening... click to stop' : 'Start voice input (Web Speech API)'}
            >
              <Mic className={`h-5 w-5 ${isListening ? 'animate-bounce' : ''}`} />
            </button>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isAnalyzing || !inputText.trim()}
            className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 transition-all hover:bg-indigo-500 active:scale-95 disabled:opacity-40 disabled:hover:bg-indigo-600"
          >
            {isAnalyzing ? (
              <RefreshCw className="h-5 w-5 animate-spin" />
            ) : (
              <ArrowRight className="h-5 w-5" />
            )}
          </button>
        </div>
      </form>

      {/* Prompt Suggestions Pills */}
      <div className="mt-4 flex flex-wrap items-center justify-center gap-2 text-xs">
        <span className="font-mono uppercase text-[10px] text-slate-400 tracking-wider mr-1">
          PROMPT SUGGESTIONS:
        </span>

        {[
          'Prepare for my meeting with Acme Corp tomorrow',
          'Why did usage drop in Q3?',
          'Show me all overdue projects',
        ].map((suggestion) => (
          <button
            key={suggestion}
            disabled={isAnalyzing}
            onClick={() => handleSuggestionClick(suggestion)}
            className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-left text-slate-300 transition-all hover:border-amber-200/30 hover:bg-amber-100/[0.07] hover:text-white disabled:cursor-wait disabled:opacity-50"
          >
            {suggestion}
          </button>
        ))}
      </div>
    </div>
  );
};
