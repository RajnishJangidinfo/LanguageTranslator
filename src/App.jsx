import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import TextInput from './components/TextInput';
import Actions from './components/Actions';
import OutputSection from './components/OutputSection';
import SettingsModal from './components/SettingsModal';
import Footer from './components/Footer';
import { improveEnglish, translateText } from './services/aiService';

export default function App() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Settings & Theme states
  const [selectedLanguage, setSelectedLanguage] = useState('Spanish');
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [sourceTextType, setSourceTextType] = useState('improve'); // 'improve' | 'translate'

  // Retrieve API key from environment variable or localStorage
  const [apiKey, setApiKey] = useState(() => {
    const envKey = import.meta.env.VITE_GEMINI_API_KEY;
    if (envKey) return envKey;
    return localStorage.getItem('gemini_api_key') || '';
  });

  // Dark Mode state
  const [darkMode, setDarkMode] = useState(() => {
    const savedTheme = localStorage.getItem('dark_mode');
    if (savedTheme !== null) {
      return savedTheme === 'true';
    }
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  // Effect to apply dark mode class to <html>
  useEffect(() => {
    const root = window.document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('dark_mode', darkMode.toString());
  }, [darkMode]);

  // Handle saving API key in settings
  const handleSaveApiKey = (key) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  // Option 1: Improve English Handler
  const handleImproveEnglish = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to improve.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSourceTextType('improve');

    try {
      const result = await improveEnglish(inputText, apiKey);
      setOutputText(result);
    } catch (err) {
      setError(err.message || 'An error occurred while improving English.');
    } finally {
      setIsLoading(false);
    }
  };

  // Option 2: Translate Handler
  const handleTranslate = async () => {
    if (!inputText.trim()) {
      setError('Please enter some text to translate.');
      return;
    }

    setIsLoading(true);
    setError('');
    setSourceTextType('translate');

    try {
      const result = await translateText(inputText, selectedLanguage, apiKey);
      setOutputText(result);
    } catch (err) {
      setError(err.message || 'An error occurred during translation.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearOutput = () => {
    setOutputText('');
    setError('');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
      
      {/* Background blobs for premium depth */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[400px] overflow-hidden pointer-events-none opacity-40 dark:opacity-20 z-0">
        <div className="absolute top-[-10%] left-[10%] w-[350px] h-[350px] rounded-full bg-indigo-300 dark:bg-indigo-900/60 blur-[80px]"></div>
        <div className="absolute top-[-5%] right-[10%] w-[300px] h-[300px] rounded-full bg-violet-300 dark:bg-violet-900/60 blur-[80px]"></div>
      </div>

      <div className="relative max-w-4xl mx-auto px-4 py-8 md:py-12 min-h-screen flex flex-col justify-between z-10">
        
        <div>
          {/* Header */}
          <Header 
            onOpenSettings={() => setIsSettingsOpen(true)} 
            apiKey={apiKey}
            darkMode={darkMode}
            setDarkMode={setDarkMode}
          />

          <main className="space-y-6">
            
            {/* Alert for missing API Key - updated to show it is optional and falling back */}
            {!apiKey && (
              <div className="flex items-center justify-between p-4 bg-indigo-50/50 dark:bg-indigo-950/20 border border-indigo-100/50 dark:border-indigo-900/30 rounded-2xl">
                <div className="flex items-center gap-2">
                  <span className="flex h-2 w-2 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
                  </span>
                  <p className="text-xs text-indigo-800 dark:text-indigo-300 font-medium">
                    Running in <strong>Keyless Mode</strong>. Processing via free public APIs and Chrome Local AI. Add a Gemini API Key for premium cloud AI quality.
                  </p>
                </div>
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="text-xs font-semibold text-indigo-900 dark:text-indigo-400 hover:underline px-2.5 py-1 rounded-lg hover:bg-indigo-100/50 dark:hover:bg-indigo-950/40 transition-colors"
                >
                  Configure Key
                </button>
              </div>
            )}

            {/* Input Card */}
            <TextInput 
              value={inputText} 
              onChange={(val) => {
                setInputText(val);
                // Clear errors on typing
                if (error) setError('');
              }} 
            />

            {/* Action Cards */}
            <Actions 
              onImprove={handleImproveEnglish} 
              onTranslate={handleTranslate} 
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              isLoading={isLoading}
              hasInput={inputText.trim().length > 0}
            />

            {/* Output Card / Spinner / Error (rendered if output, loading, or error is present) */}
            {(outputText || isLoading || error) && (
              <OutputSection 
                value={outputText} 
                error={error} 
                isLoading={isLoading} 
                onClear={handleClearOutput}
                sourceTextType={sourceTextType}
              />
            )}

          </main>
        </div>

        {/* Footer */}
        <Footer />

        {/* Settings Modal */}
        <SettingsModal 
          isOpen={isSettingsOpen} 
          onClose={() => setIsSettingsOpen(false)} 
          apiKey={apiKey}
          onSaveApiKey={handleSaveApiKey}
        />

      </div>
    </div>
  );
}
