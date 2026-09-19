import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Check, Music } from 'lucide-react';
import { Song } from '../types';

interface SongRowProps {
  index: number;
  song: Song;
  isPlaying: boolean;
  isCurrent: boolean;
  isLiked: boolean;
  onPlay: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleLike: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
}

export function SongRow({
  index,
  song,
  isPlaying,
  isCurrent,
  isLiked,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onAddToQueue,
}: SongRowProps) {
  const [imageError, setImageError] = useState(false);
  const [added, setAdded] = useState(false);

  const handlePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      onTogglePlay();
    } else {
      onPlay(song);
    }
  };

  const handleLike = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(song);
  };

  const handleQueue = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQueue(song);
    setAdded(true);
    setTimeout(() => setAdded(false), 1500);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      onClick={() => onPlay(song)}
      className={`group flex items-center justify-between p-2.5 sm:p-3 rounded-xl transition-all cursor-pointer border ${
        isCurrent
          ? 'bg-neutral-800/90 border-emerald-500/30 text-emerald-400'
          : 'hover:bg-neutral-800/50 border-transparent text-neutral-300'
      }`}
    >
      {/* Left: Index / Play Icon + Artwork + Title & Artist */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Track Index or Play button on hover */}
        <div className="w-6 text-center shrink-0 flex items-center justify-center">
          {isCurrent && isPlaying ? (
            <div className="flex items-end gap-0.5 h-4">
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-3"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-4"></span>
              <span className="w-1 bg-emerald-400 rounded-full animate-pulse h-2"></span>
            </div>
          ) : (
            <button
              onClick={handlePlay}
              className="w-6 h-6 flex items-center justify-center rounded-full text-neutral-400 hover:text-white"
            >
              <span className="group-hover:hidden text-xs font-mono">{index + 1}</span>
              <Play className="w-3.5 h-3.5 hidden group-hover:block fill-current" />
            </button>
          )}
        </div>

        {/* Thumbnail */}
        <div className="w-11 h-11 rounded-lg overflow-hidden bg-neutral-800 shrink-0 relative">
          {!imageError && song.artwork ? (
            <img
              src={song.artwork}
              alt={song.title}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-neutral-800 text-neutral-500">
              <Music className="w-5 h-5" />
            </div>
          )}
        </div>

        {/* Info */}
        <div className="min-w-0 flex-1 pr-2">
          <p
            className={`font-medium text-sm truncate leading-snug ${
              isCurrent ? 'text-emerald-400 font-semibold' : 'text-neutral-100 group-hover:text-emerald-300'
            }`}
          >
            {song.title}
          </p>
          <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
        </div>
      </div>

      {/* Center/Right: Album name on desktop */}
      <div className="hidden md:block w-48 text-xs text-neutral-400 truncate px-2">
        {song.album}
      </div>

      {/* Right: Actions and Duration */}
      <div className="flex items-center gap-2 shrink-0">
        <button
          type="button"
          onClick={handleLike}
          className={`p-1.5 rounded-lg transition-colors ${
            isLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-neutral-200 opacity-0 group-hover:opacity-100 sm:opacity-100'
          }`}
          title={isLiked ? 'Unlike' : 'Like'}
        >
          <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
        </button>

        <button
          type="button"
          onClick={handleQueue}
          className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 opacity-0 group-hover:opacity-100 transition-opacity"
          title="Add to queue"
        >
          {added ? <Check className="w-4 h-4 text-emerald-400" /> : <Plus className="w-4 h-4" />}
        </button>

        <span className="text-xs text-neutral-400 font-mono w-10 text-right">
          {formatDuration(song.duration)}
        </span>
      </div>
    </div>
  );
}
