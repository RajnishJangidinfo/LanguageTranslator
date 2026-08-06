import React from 'react';
import { ShieldAlert, Cpu } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full mt-10 pt-6 border-t border-slate-100 dark:border-slate-800/80 text-center flex flex-col items-center gap-2">
      <div className="flex items-center gap-1.5 text-[11px] text-slate-400 dark:text-slate-500 font-medium">
        <Cpu className="w-3.5 h-3.5" />
        <span>Powered by Gemini 1.5 Flash</span>
        <span className="w-1 h-1 rounded-full bg-slate-300 dark:bg-slate-700"></span>
        <span className="flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5 text-indigo-500/80" />
          No Server Database / No Accounts Required
        </span>
      </div>
      <p className="text-[10px] text-slate-400/80 dark:text-slate-500/80 leading-relaxed max-w-md">
        This is a fully browser-based Single Page Application. Your text input is processed directly using Google Cloud Gemini API and is never saved.
      </p>
    </footer>
  );
}
