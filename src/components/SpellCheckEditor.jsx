import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { checkWord, getSuggestions, addWordToCustomDictionary } from '../services/spellchecker';
import { Plus, EyeOff, Sparkles } from 'lucide-react';

export default function SpellCheckEditor({
  value,
  onChange,
  placeholder = "Enter or paste your text here...",
  rows = 7,
  className = ""
}) {
  const [dropdown, setDropdown] = useState(null);
  const [ignoredWords, setIgnoredWords] = useState(new Set());
  const [_dictVersion, setDictVersion] = useState(0);
  
  const textareaRef = useRef(null);
  const backgroundRef = useRef(null);
  
  // Sync scroll positions
  const handleScroll = (e) => {
    if (backgroundRef.current) {
      backgroundRef.current.scrollTop = e.target.scrollTop;
    }
  };

  // Close dropdown on click outside or scroll
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (dropdown && !e.target.closest('.suggestions-dropdown')) {
        setDropdown(null);
      }
    };
    
    const handleWindowScroll = () => {
      if (dropdown) setDropdown(null);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    window.addEventListener('scroll', handleWindowScroll, true);
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      window.removeEventListener('scroll', handleWindowScroll, true);
    };
  }, [dropdown]);

  // Sync scroll position initially or on value change
  useEffect(() => {
    if (backgroundRef.current && textareaRef.current) {
      backgroundRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  }, [value]);

  // Click on textarea to detect clicked word
  const handleClick = (e) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const selectionStart = textarea.selectionStart;
    const selectionEnd = textarea.selectionEnd;
    
    // Only trigger suggestions if it's a simple caret position (no selected range)
    if (selectionStart !== selectionEnd) {
      setDropdown(null);
      return;
    }
    
    const wordInfo = getWordAtPosition(value, selectionStart);
    if (!wordInfo || !wordInfo.word) {
      setDropdown(null);
      return;
    }
    
    const { word, start, end } = wordInfo;
    
    // Check if the word is ignored in session
    const isIgnored = ignoredWords.has(word.toLowerCase());
    
    // Check spelling
    const isCorrect = isIgnored || checkWord(word);
    
    if (!isCorrect) {
      const suggestions = getSuggestions(word);
      
      // Get click position relative to viewport for fixed portal placement
      const x = e.clientX;
      const y = e.clientY;
      
      setDropdown({
        word,
        start,
        end,
        suggestions,
        x,
        y
      });
    } else {
      setDropdown(null);
    }
  };

  // Replace misspelled word with suggestion
  const handleSelectSuggestion = (start, end, suggestion) => {
    const before = value.slice(0, start);
    const after = value.slice(end);
    const newValue = before + suggestion + after;
    
    onChange(newValue);
    setDropdown(null);
    
    // Refocus and place caret at the end of the replaced word
    setTimeout(() => {
      const textarea = textareaRef.current;
      if (textarea) {
        textarea.focus();
        const newCursorPos = start + suggestion.length;
        textarea.setSelectionRange(newCursorPos, newCursorPos);
      }
    }, 10);
  };

  // Ignore word for this session
  const handleIgnoreWord = (word) => {
    const newIgnored = new Set(ignoredWords);
    newIgnored.add(word.toLowerCase());
    setIgnoredWords(newIgnored);
    setDropdown(null);
  };

  // Add word to user dictionary
  const handleAddToDictionary = (word) => {
    addWordToCustomDictionary(word);
    setDictVersion(prev => prev + 1);
    setDropdown(null);
  };

  // Helper to find word boundaries at cursor
  const getWordAtPosition = (text, pos) => {
    if (!text) return null;
    
    let start = pos;
    while (start > 0 && /[a-zA-Z'-]/.test(text[start - 1])) {
      start--;
    }
    
    let end = pos;
    while (end < text.length && /[a-zA-Z'-]/.test(text[end])) {
      end++;
    }
    
    const word = text.slice(start, end);
    return { word, start, end };
  };

  const tokenize = (text) => {
    if (!text) return [];
    const regex = /([a-zA-Z'-]+|[^a-zA-Z'-]+)/g;
    return text.match(regex) || [];
  };

  // Render text with wavy highlights for misspelled words
  const renderHighlightedHTML = () => {
    if (!value) return <span className="text-slate-400 dark:text-slate-500">{placeholder}</span>;
    
    const tokens = tokenize(value);
    
    return tokens.map((token, idx) => {
      // Is it a word token?
      const isWord = /^[a-zA-Z'-]+$/.test(token);
      
      if (isWord) {
        const isIgnored = ignoredWords.has(token.toLowerCase());
        const isCorrect = isIgnored || checkWord(token);
        
        if (!isCorrect) {
          return (
            <span
              key={idx}
              className="underline decoration-wavy decoration-rose-500 decoration-2 bg-rose-500/5 dark:bg-rose-500/10 cursor-pointer rounded-sm"
              title="Spelling mistake. Click for suggestions."
            >
              {token}
            </span>
          );
        }
      }
      return <span key={idx}>{token}</span>;
    });
  };

  return (
    <div className={`relative w-full ${className}`}>
      <style>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
      
      {/* Background Layer: Highlights */}
      <div
        ref={backgroundRef}
        className="absolute inset-0 px-5 py-4 overflow-y-scroll break-words whitespace-pre-wrap select-none text-base leading-relaxed text-slate-800 dark:text-slate-100 no-scrollbar pointer-events-none"
        style={{
          fontFamily: 'inherit',
          fontSize: 'inherit',
          lineHeight: 'inherit',
          borderColor: 'transparent',
          borderWidth: '1px',
          borderStyle: 'solid',
          color: 'transparent', // Make the text itself transparent, but children spans will override it!
        }}
      >
        {/* We override text color for children, keeping correct text transparent */}
        <span className="text-slate-800 dark:text-slate-100">
          {renderHighlightedHTML()}
        </span>
      </div>

      {/* Foreground Layer: Text Area */}
      <textarea
        ref={textareaRef}
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          if (dropdown) setDropdown(null);
        }}
        onScroll={handleScroll}
        onClick={handleClick}
        placeholder={placeholder}
        rows={rows}
        className="w-full px-5 py-4 bg-transparent text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 text-base leading-relaxed border-none focus:outline-none resize-y min-h-[160px] relative z-10 overflow-y-scroll"
        style={{
          color: 'transparent', // Makes foreground text transparent
          caretColor: 'currentColor', // Makes text insertion caret visible
          background: 'transparent',
        }}
      />
      
      {/* Suggestions Dropdown (Portal) */}
      {dropdown && createPortal(
        <div
          className="suggestions-dropdown fixed z-50 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 rounded-xl shadow-xl py-1.5 animate-in fade-in slide-in-from-top-1 duration-150"
          style={{
            left: `${Math.min(dropdown.x, window.innerWidth - 220)}px`,
            top: `${Math.min(dropdown.y + 12, window.innerHeight - 250)}px`,
          }}
        >
          {/* Header */}
          <div className="px-3 py-1 text-2xs uppercase tracking-wider font-bold text-slate-400 dark:text-slate-500 border-b border-slate-50 dark:border-slate-800/50 mb-1 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
            <span>Spelling Suggestions</span>
          </div>

          {/* Suggestions List */}
          {dropdown.suggestions.length > 0 ? (
            dropdown.suggestions.map((suggestion, idx) => (
              <button
                key={idx}
                onClick={() => handleSelectSuggestion(dropdown.start, dropdown.end, suggestion)}
                className="w-full text-left px-3 py-2 text-sm font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-50 hover:text-indigo-600 dark:hover:bg-indigo-950/40 dark:hover:text-indigo-400 transition-colors flex items-center justify-between"
              >
                <span>{suggestion}</span>
                {idx === 0 && <span className="text-2xs bg-indigo-500/10 text-indigo-500 dark:bg-indigo-500/20 px-1.5 py-0.5 rounded-full font-medium">Best</span>}
              </button>
            ))
          ) : (
            <div className="px-3 py-2 text-xs italic text-slate-400 dark:text-slate-500">
              No suggestions found
            </div>
          )}

          {/* Actions Divider */}
          <div className="border-t border-slate-100 dark:border-slate-800 my-1.5"></div>

          {/* Ignore */}
          <button
            onClick={() => handleIgnoreWord(dropdown.word)}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <EyeOff className="w-3.5 h-3.5" />
            <span>Ignore spelling</span>
          </button>

          {/* Add to Dictionary */}
          <button
            onClick={() => handleAddToDictionary(dropdown.word)}
            className="w-full text-left px-3 py-1.5 text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors flex items-center gap-2"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add "{dropdown.word}" to dictionary</span>
          </button>
        </div>,
        document.body
      )}
    </div>
  );
}
