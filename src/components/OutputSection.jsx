import React, { useState } from 'react';
import { Copy, Check, Trash2, Volume2, AlertCircle } from 'lucide-react';

export default function OutputSection({ 
  value, 
  error, 
  isLoading, 
  onClear,
  sourceTextType // "improved" or "translation" to display in header
}) {
  const [copied, setCopied] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleCopy = async () => {
    if (!value) return;
    try {
      await navigator.clipboard.writeText(value);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  const handleSpeak = () => {
    if (!value || isPlaying) return;
    
    // Check if SpeechSynthesis is supported
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(value);
      
      utterance.onend = () => setIsPlaying(false);
      utterance.onerror = () => setIsPlaying(false);
      
      setIsPlaying(true);
      window.speechSynthesis.speak(utterance);
    } else {
      alert("Text-to-speech is not supported in your browser.");
    }
  };

  const handleStopSpeak = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      setIsPlaying(false);
    }
  };

  // Stats calculations
  const charCount = value ? value.length : 0;
  const wordCount = value && value.trim() !== '' ? value.trim().split(/\s+/).length : 0;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2">
          <span className="inline-flex h-2 w-2 rounded-full bg-emerald-500"></span>
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300">
            {sourceTextType === 'improve' ? 'Refined English Output' : 'Translated Output'}
          </h4>
        </div>
        
        {value && !isLoading && !error && (
          <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
            <span className="flex items-center gap-1">
              <strong>{wordCount}</strong> words
            </span>
            <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
            <span className="flex items-center gap-1">
              <strong>{charCount}</strong> characters
            </span>
          </div>
        )}
      </div>

      {/* Main Body Area */}
      <div className="relative min-h-[160px] p-5">
        
        {/* Loading State */}
        {isLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-white/80 dark:bg-slate-800/80 backdrop-blur-[2px] z-10 gap-3">
            <div className="relative flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-indigo-100 dark:border-indigo-950 rounded-full"></div>
              <div className="absolute w-10 h-10 border-4 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
            </div>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 animate-pulse">
              Processing request...
            </span>
          </div>
        )}

        {/* Error State */}
        {error && !isLoading && (
          <div className="flex flex-col items-center justify-center text-center p-6 bg-rose-50/50 dark:bg-rose-950/10 border border-rose-100/50 dark:border-rose-900/30 rounded-xl min-h-[120px]">
            <AlertCircle className="w-8 h-8 text-rose-500 mb-2" />
            <h5 className="text-sm font-semibold text-rose-800 dark:text-rose-400 mb-1">
              Processing Failed
            </h5>
            <p className="text-xs text-rose-600/80 dark:text-rose-400/80 max-w-sm leading-relaxed">
              {error}
            </p>
          </div>
        )}

        {/* Output Text display */}
        {!isLoading && !error && (
          <>
            {value ? (
              <div className="text-slate-800 dark:text-slate-100 text-base leading-relaxed whitespace-pre-wrap select-text pr-2 pb-12">
                {value}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-slate-400 dark:text-slate-500 py-8">
                <p className="text-sm font-medium">Your processed text will appear here</p>
                <p className="text-xs text-slate-400/80 dark:text-slate-500/80 mt-1 max-w-xs">
                  Enter some text above and select an option to see the results.
                </p>
              </div>
            )}
          </>
        )}

        {/* Toolbar / Actions (Only visible when value is populated and not loading) */}
        {value && !isLoading && !error && (
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between border-t border-slate-100 dark:border-slate-700/60 pt-3 bg-white dark:bg-slate-800">
            {/* Left Utility Actions */}
            <div className="flex gap-1.5">
              {isPlaying ? (
                <button
                  onClick={handleStopSpeak}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/30 border border-rose-100 dark:border-rose-900/30 rounded-lg transition-colors cursor-pointer"
                >
                  <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                  Stop Listening
                </button>
              ) : (
                <button
                  onClick={handleSpeak}
                  className="flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
                  title="Listen to output"
                >
                  <Volume2 className="w-3.5 h-3.5" />
                  Listen
                </button>
              )}
            </div>

            {/* Right Action buttons */}
            <div className="flex gap-1.5">
              <button
                onClick={onClear}
                className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 border border-slate-100 dark:border-slate-700 rounded-lg transition-all cursor-pointer"
                title="Clear Output"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              
              <button
                onClick={handleCopy}
                className={`flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium rounded-lg border transition-all cursor-pointer ${
                  copied
                    ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-900/50'
                    : 'bg-indigo-50 dark:bg-indigo-950/10 text-indigo-600 dark:text-indigo-400 border-indigo-100 dark:border-indigo-900/50 hover:bg-indigo-100/50 dark:hover:bg-indigo-950/30'
                }`}
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Text</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
