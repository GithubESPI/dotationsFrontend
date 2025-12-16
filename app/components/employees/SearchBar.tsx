'use client';
import React, { useState, useEffect, useRef } from 'react';
import { useEmployeeSearchStore } from '../../stores/employeeSearchStore';

interface SearchBarProps {
  onSearch?: (query: string) => void;
  placeholder?: string;
  autoFocus?: boolean;
}

const SearchBar: React.FC<SearchBarProps> = ({
  onSearch,
  placeholder = 'Rechercher un employé par nom, email ou département...',
  autoFocus = false,
}) => {
  const { searchParams, setQuery } = useEmployeeSearchStore();
  const [localQuery, setLocalQuery] = useState(searchParams.query || '');
  const inputRef = useRef<HTMLInputElement>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    setLocalQuery(searchParams.query || '');
  }, [searchParams.query]);

  useEffect(() => {
    if (autoFocus && inputRef.current) {
      inputRef.current.focus();
    }
  }, [autoFocus]);

  // Debounce de la recherche automatique
  useEffect(() => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      if (localQuery !== searchParams.query) {
        setQuery(localQuery);
      }
    }, 500); // 500ms de délai

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [localQuery, searchParams.query, setQuery]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    setQuery(localQuery);
    onSearch?.(localQuery);
  };

  const handleClear = () => {
    setLocalQuery('');
    setQuery('');
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    inputRef.current?.focus();
  };

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-4xl mx-auto">
      <div className="relative group">
        {/* Icône de recherche */}
        <div className="absolute inset-y-0 left-0 flex items-center pl-6 pointer-events-none">
          <svg
            className="w-7 h-7 text-zinc-400 group-focus-within:text-blue-500 transition-colors"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>

        {/* Input */}
        <input
          ref={inputRef}
          type="text"
          value={localQuery}
          onChange={(e) => setLocalQuery(e.target.value)}
          placeholder={placeholder}
          className="w-full h-20 md:h-24 pl-20 pr-24 text-xl md:text-2xl rounded-full border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 text-black dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:border-blue-500 focus:ring-8 focus:ring-blue-500/10 transition-all duration-300 shadow-lg hover:shadow-xl hover:border-zinc-400 dark:hover:border-zinc-500"
        />

        {/* Bouton effacer */}
        {localQuery && (
          <button
            type="button"
            onClick={handleClear}
            className="absolute inset-y-0 right-20 flex items-center pr-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        )}

        {/* Bouton rechercher */}
        <button
          type="submit"
          className="absolute inset-y-0 right-0 flex items-center pr-4 pl-6 text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors font-medium"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 7l5 5m0 0l-5 5m5-5H6"
            />
          </svg>
        </button>
      </div>
    </form>
  );
};

export default SearchBar;

