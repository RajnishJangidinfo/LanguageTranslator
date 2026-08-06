import React from 'react';
import { Sparkles, Globe, ArrowRight } from 'lucide-react';

const LANGUAGES = [
  { code: 'English', label: 'English' },
  { code: 'Hindi', label: 'Hindi (हिन्दी)' },
  { code: 'Gujarati', label: 'Gujarati (ગુજરાતી)' },
  { code: 'Marathi', label: 'Marathi (मराठी)' },
  { code: 'Tamil', label: 'Tamil (தமிழ்)' },
  { code: 'Telugu', label: 'Telugu (తెలుగు)' },
  { code: 'Bengali', label: 'Bengali (বাংলা)' },
  { code: 'Punjabi', label: 'Punjabi (ਪੰਜਾਬੀ)' },
  { code: 'Urdu', label: 'Urdu (اردو)' },
  { code: 'French', label: 'French (Français)' },
  { code: 'German', label: 'German (Deutsch)' },
  { code: 'Spanish', label: 'Spanish (Español)' },
  { code: 'Italian', label: 'Italian (Italiano)' },
  { code: 'Portuguese', label: 'Portuguese (Português)' },
  { code: 'Japanese', label: 'Japanese (日本語)' },
  { code: 'Korean', label: 'Korean (한국어)' },
  { code: 'Chinese (Simplified)', label: 'Chinese (简体中文)' },
  { code: 'Arabic', label: 'Arabic (العربية)' },
  { code: 'Russian', label: 'Russian (Русский)' },
];

export default function Actions({ 
  onImprove, 
  onTranslate, 
  selectedLanguage, 
  setSelectedLanguage, 
  isLoading, 
  hasInput 
}) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full">
      
      {/* Action 1: Improve English */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-indigo-500 animate-pulse" />
            Option 1: Refine & Edit
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Enhance vocabulary, correct spelling/grammar, adjust flow, and polish overall readability while keeping the original intent.
          </p>
        </div>
        <button
          onClick={onImprove}
          disabled={isLoading || !hasInput}
          className={`w-full py-3 px-4 rounded-xl font-medium text-sm flex items-center justify-center gap-2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 ${
            isLoading || !hasInput
              ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-slate-700 cursor-not-allowed'
              : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm hover:shadow-indigo-500/10 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
          }`}
        >
          <Sparkles className="w-4 h-4" />
          <span>Improve English</span>
        </button>
      </div>

      {/* Action 2: Translate */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-5 shadow-sm hover:shadow-md transition-all duration-300 flex flex-col justify-between gap-4">
        <div>
          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-1 flex items-center gap-1.5">
            <Globe className="w-4 h-4 text-violet-500" />
            Option 2: Translate
          </h4>
          <p className="text-xs text-slate-400 dark:text-slate-500 leading-relaxed">
            Instantly translate your input text into any of the 19 supported global and regional languages below.
          </p>
        </div>
        
        <div className="flex gap-2 w-full">
          <div className="relative flex-1">
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
              disabled={isLoading}
              className="w-full pl-3.5 pr-8 py-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all appearance-none cursor-pointer disabled:cursor-not-allowed"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.label}
                </option>
              ))}
            </select>
            {/* Custom dropdown arrow */}
            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400 dark:text-slate-500">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </div>
          </div>
          
          <button
            onClick={onTranslate}
            disabled={isLoading || !hasInput}
            className={`py-3 px-5 rounded-xl font-medium text-sm flex items-center justify-center gap-1.5 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${
              isLoading || !hasInput
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-600 border border-slate-200/50 dark:border-slate-700 cursor-not-allowed'
                : 'bg-violet-600 hover:bg-violet-700 text-white shadow-sm hover:shadow-violet-500/10 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0'
            }`}
          >
            <span>Translate</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
}
