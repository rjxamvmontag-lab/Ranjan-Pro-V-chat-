import { useState } from 'react';
import {
  Play,
  Shuffle,
  LayoutGrid,
  List,
  Sparkles,
  Flame,
  Zap,
  Heart,
  Moon,
  Globe,
  Music2,
  BookmarkCheck,
} from 'lucide-react';
import { Song } from '../types';
import { SongCard } from './SongCard';
import { SongRow } from './SongRow';
import { CATEGORIES } from '../data/curatedSongs';

interface SongListProps {
  songs: Song[];
  title: string;
  subtitle?: string;
  selectedCategory: string;
  onSelectCategory: (categoryId: string) => void;
  currentSong: Song | null;
  isPlaying: boolean;
  likedSongIds: Set<string>;
  onPlaySong: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleLike: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
  onPlayAll: (songs: Song[], shuffle?: boolean) => void;
  isSearchActive: boolean;
}

export function SongList({
  songs,
  title,
  subtitle,
  selectedCategory,
  onSelectCategory,
  currentSong,
  isPlaying,
  likedSongIds,
  onPlaySong,
  onTogglePlay,
  onToggleLike,
  onAddToQueue,
  onPlayAll,
  isSearchActive,
}: SongListProps) {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Flame':
        return <Flame className="w-3.5 h-3.5 text-orange-400" />;
      case 'Zap':
        return <Zap className="w-3.5 h-3.5 text-amber-400" />;
      case 'Heart':
        return <Heart className="w-3.5 h-3.5 text-rose-400" />;
      case 'Moon':
        return <Moon className="w-3.5 h-3.5 text-indigo-400" />;
      case 'Globe':
        return <Globe className="w-3.5 h-3.5 text-sky-400" />;
      case 'BookmarkCheck':
        return <BookmarkCheck className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Sparkles':
      default:
        return <Sparkles className="w-3.5 h-3.5 text-emerald-400" />;
    }
  };

  return (
    <div className="w-full">
      {/* Category Tabs (Only when not in active search mode, or as filter) */}
      {!isSearchActive && (
        <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6 scrollbar-none">
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-medium whitespace-nowrap transition-all duration-200 border ${
                  isSelected
                    ? 'bg-emerald-500 text-neutral-950 border-emerald-400 font-semibold shadow-md shadow-emerald-500/20'
                    : 'bg-neutral-900/60 text-neutral-400 border-neutral-800/80 hover:bg-neutral-800 hover:text-neutral-100 hover:border-neutral-700'
                }`}
              >
                {getCategoryIcon(cat.icon)}
                <span>{cat.label}</span>
                {cat.id === 'favorites' && likedSongIds.size > 0 && (
                  <span className={`text-xs px-1.5 py-0.2 rounded-full ${isSelected ? 'bg-neutral-900 text-emerald-400' : 'bg-neutral-800 text-neutral-300'}`}>
                    {likedSongIds.size}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Header with Title & Action controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal px-2.5 py-0.5 rounded-full bg-neutral-800 text-neutral-400 border border-neutral-700/60">
              {songs.length} {songs.length === 1 ? 'Gaana' : 'Gaane'}
            </span>
          </h2>
          {subtitle && <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">{subtitle}</p>}
        </div>

        {/* Buttons: Play All, Shuffle, View Mode */}
        {songs.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            <button
              type="button"
              onClick={() => onPlayAll(songs, false)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-semibold transition-all shadow-md shadow-emerald-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" />
              <span>Sabhi Play Karein</span>
            </button>

            <button
              type="button"
              onClick={() => onPlayAll(songs, true)}
              className="flex items-center gap-1.5 px-3 py-1.5 sm:py-2 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-neutral-200 text-xs sm:text-sm font-medium transition-all active:scale-95 border border-neutral-700/60"
            >
              <Shuffle className="w-3.5 h-3.5 text-neutral-300" />
              <span>Shuffle</span>
            </button>

            {/* Grid vs List toggle */}
            <div className="flex items-center p-0.5 rounded-xl bg-neutral-900 border border-neutral-800 text-neutral-400">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'grid' ? 'bg-neutral-800 text-emerald-400' : 'hover:text-neutral-200'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-lg transition-colors ${
                  viewMode === 'list' ? 'bg-neutral-800 text-emerald-400' : 'hover:text-neutral-200'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Empty State */}
      {songs.length === 0 && (
        <div className="py-16 text-center rounded-2xl bg-neutral-900/40 border border-neutral-800/80 px-4">
          <div className="w-16 h-16 rounded-full bg-neutral-800/80 flex items-center justify-center mx-auto mb-4 text-neutral-500">
            <Music2 className="w-8 h-8" />
          </div>
          <h3 className="text-base font-semibold text-neutral-200 mb-1">
            Koi gaana nahi mila (No songs found)
          </h3>
          <p className="text-xs sm:text-sm text-neutral-400 max-w-sm mx-auto">
            {selectedCategory === 'favorites'
              ? 'Aapne abhi tak koi gaana pasand nahi kiya hai. Kisi bhi gaane ke heart icon par click karke use yahan save karein.'
              : 'Dusra naam likhkar search karein ya upar diye gaye popular chips me se chunein.'}
          </p>
        </div>
      )}

      {/* Songs Display */}
      {songs.length > 0 && (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
              {songs.map((song) => (
                <SongCard
                  key={song.id}
                  song={song}
                  isPlaying={isPlaying}
                  isCurrent={currentSong?.id === song.id}
                  isLiked={likedSongIds.has(song.id)}
                  onPlay={onPlaySong}
                  onTogglePlay={onTogglePlay}
                  onToggleLike={onToggleLike}
                  onAddToQueue={onAddToQueue}
                />
              ))}
            </div>
          ) : (
            <div className="bg-neutral-900/60 rounded-2xl border border-neutral-800/80 divide-y divide-neutral-800/60 overflow-hidden">
              {songs.map((song, index) => (
                <SongRow
                  key={song.id}
                  index={index}
                  song={song}
                  isPlaying={isPlaying}
                  isCurrent={currentSong?.id === song.id}
                  isLiked={likedSongIds.has(song.id)}
                  onPlay={onPlaySong}
                  onTogglePlay={onTogglePlay}
                  onToggleLike={onToggleLike}
                  onAddToQueue={onAddToQueue}
                />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
