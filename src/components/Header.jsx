import React from 'react';
import { Sparkles, Settings } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Header({ onOpenSettings, apiKey, darkMode, setDarkMode }) {
  return (
    <header className="w-full flex items-center justify-between pb-6 border-b border-slate-100 dark:border-slate-800/80 mb-6">
      
      {/* Branding */}
      <div className="flex items-center gap-3">
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-600 shadow-md shadow-indigo-500/20 text-white">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-indigo-950 dark:from-white dark:to-slate-200">
            LingoCraft
          </h1>
          <p className="text-xs font-medium text-indigo-500 dark:text-indigo-400">
            AI Text Improver & Translator
          </p>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-2">
        <ThemeToggle darkMode={darkMode} setDarkMode={setDarkMode} />
        
        <button
          onClick={onOpenSettings}
          className="relative p-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 shadow-sm transition-all duration-300 cursor-pointer"
          title="Configure API Keys"
        >
          <Settings className="w-5 h-5" />
          {!apiKey && (
            <span className="absolute top-1 right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-rose-500"></span>
            </span>
          )}
        </button>
      </div>

    </header>
  );
}
