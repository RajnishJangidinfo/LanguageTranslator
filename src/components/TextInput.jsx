import React from 'react';
import { AlignLeft, FileText } from 'lucide-react';

export default function TextInput({ value, onChange, placeholder = "Enter or paste your text here..." }) {
  
  // Stats calculations
  const charCount = value.length;
  const wordCount = value.trim() === '' ? 0 : value.trim().split(/\s+/).length;

  return (
    <div className="w-full bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all duration-300 focus-within:shadow-md focus-within:border-indigo-500/30">
      
      {/* Header Panel */}
      <div className="flex items-center justify-between px-5 py-3.5 bg-slate-50/50 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700">
        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300 font-medium text-sm">
          <AlignLeft className="w-4 h-4 text-indigo-500" />
          <span>Source Text</span>
        </div>
        <div className="flex items-center gap-4 text-xs text-slate-400 dark:text-slate-500">
          <span className="flex items-center gap-1">
            <strong>{wordCount}</strong> words
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-slate-200 dark:bg-slate-700"></span>
          <span className="flex items-center gap-1">
            <strong>{charCount}</strong> characters
          </span>
        </div>
      </div>

      {/* Text Area */}
      <div className="relative">
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={7}
          className="w-full px-5 py-4 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base leading-relaxed border-none focus:outline-none resize-y min-h-[160px]"
        />
        
        {value && (
          <button 
            onClick={() => onChange('')}
            className="absolute right-4 bottom-4 px-3 py-1.5 text-xs font-medium text-slate-400 dark:text-slate-500 hover:text-rose-500 dark:hover:text-rose-400 bg-slate-50 hover:bg-rose-50 dark:bg-slate-900 dark:hover:bg-rose-950/20 border border-slate-100 dark:border-slate-700 rounded-lg transition-all"
          >
            Clear Input
          </button>
        )}
      </div>

    </div>
  );
}
