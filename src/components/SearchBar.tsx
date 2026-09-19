import React from 'react';
import { Search, X, Loader2, PlayCircle } from 'lucide-react';
import { SEARCH_SUGGESTIONS } from '../data/curatedSongs';

interface SearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onSearchSubmit: (query: string) => void;
  onClear: () => void;
  isLoading: boolean;
  activeChip: string | null;
  onSelectChip: (chip: string) => void;
  isSearching: boolean;
}

export function SearchBar({
  searchTerm,
  onSearchChange,
  onSearchSubmit,
  onClear,
  isLoading,
  activeChip,
  onSelectChip,
  isSearching,
}: SearchBarProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      onSearchSubmit(searchTerm.trim());
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto mb-8">
      {/* Search Input Box */}
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 sm:pl-5 flex items-center pointer-events-none">
          {isLoading ? (
            <Loader2 className="w-5 h-5 text-emerald-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-neutral-400 group-focus-within:text-emerald-400 transition-colors" />
          )}
        </div>

        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Gaane ka naam, Kalakaar ya Album khojein (e.g. Arijit Singh, Sidhu Moose Wala, Kesariya)..."
          className="w-full pl-12 pr-28 sm:pr-32 py-3.5 sm:py-4 bg-neutral-900/90 hover:bg-neutral-900 border border-neutral-800 focus:border-emerald-500 rounded-2xl text-neutral-100 placeholder:text-neutral-500 text-sm sm:text-base focus:outline-none focus:ring-4 focus:ring-emerald-500/10 shadow-xl transition-all"
        />

        <div className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center gap-1.5">
          {searchTerm && (
            <button
              type="button"
              onClick={onClear}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
              title="Khoj saaf karein (Clear search)"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            className="px-3.5 py-2 bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-emerald-500/20 active:scale-95 flex items-center gap-1"
          >
            <PlayCircle className="w-4 h-4 hidden xs:inline" />
            <span>Search</span>
          </button>
        </div>
      </form>

      {/* Quick Search Chips */}
      <div className="mt-3.5 flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none text-xs">
        <span className="text-neutral-400 font-medium whitespace-nowrap pl-1 text-[11px] uppercase tracking-wider">
          Trending:
        </span>
        {SEARCH_SUGGESTIONS.slice(0, 10).map((chip) => {
          const isSelected = activeChip === chip || searchTerm.toLowerCase() === chip.toLowerCase();
          return (
            <button
              key={chip}
              onClick={() => onSelectChip(chip)}
              className={`px-3 py-1.5 rounded-full whitespace-nowrap transition-all duration-200 border font-medium ${
                isSelected
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-sm'
                  : 'bg-neutral-900/60 text-neutral-400 border-neutral-800/80 hover:border-neutral-700 hover:text-neutral-200 hover:bg-neutral-800/60'
              }`}
            >
              {chip}
            </button>
          );
        })}
      </div>

      {isSearching && (
        <div className="mt-3 flex items-center justify-between text-xs text-neutral-400 px-1">
          <span>
            Search results for: <strong className="text-emerald-400">"{searchTerm}"</strong>
          </span>
          <button
            onClick={onClear}
            className="text-neutral-400 hover:text-emerald-400 transition-colors underline underline-offset-4"
          >
            Wapas Common Gaano par jaayein (Show Common Songs)
          </button>
        </div>
      )}
    </div>
  );
}
