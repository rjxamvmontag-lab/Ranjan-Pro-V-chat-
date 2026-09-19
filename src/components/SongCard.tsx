import React, { useState } from 'react';
import { Play, Pause, Heart, Plus, Check, Music } from 'lucide-react';
import { Song } from '../types';

interface SongCardProps {
  song: Song;
  isPlaying: boolean;
  isCurrent: boolean;
  isLiked: boolean;
  onPlay: (song: Song) => void;
  onTogglePlay: () => void;
  onToggleLike: (song: Song) => void;
  onAddToQueue: (song: Song) => void;
}

export function SongCard({
  song,
  isPlaying,
  isCurrent,
  isLiked,
  onPlay,
  onTogglePlay,
  onToggleLike,
  onAddToQueue,
}: SongCardProps) {
  const [imageError, setImageError] = useState(false);
  const [addedAnimation, setAddedAnimation] = useState(false);

  const handlePlayClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isCurrent) {
      onTogglePlay();
    } else {
      onPlay(song);
    }
  };

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleLike(song);
  };

  const handleQueueClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToQueue(song);
    setAddedAnimation(true);
    setTimeout(() => setAddedAnimation(false), 1500);
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div
      onClick={() => onPlay(song)}
      className={`group relative rounded-2xl p-3.5 transition-all duration-200 cursor-pointer border ${
        isCurrent
          ? 'bg-neutral-800/90 border-emerald-500/40 shadow-lg shadow-emerald-500/10'
          : 'bg-neutral-900/60 hover:bg-neutral-800/60 border-neutral-800/80 hover:border-neutral-700/80 shadow-sm'
      }`}
    >
      {/* Artwork with play overlay */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden bg-neutral-800 mb-3">
        {!imageError && song.artwork ? (
          <img
            src={song.artwork}
            alt={song.title}
            onError={() => setImageError(true)}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-neutral-800 to-neutral-900 text-neutral-500">
            <Music className="w-12 h-12" />
          </div>
        )}

        {/* Play/Pause Button overlay */}
        <div
          className={`absolute inset-0 bg-neutral-950/40 backdrop-blur-[2px] flex items-center justify-center transition-opacity duration-200 ${
            isCurrent ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
          }`}
        >
          <button
            type="button"
            onClick={handlePlayClick}
            className={`w-12 h-12 rounded-full flex items-center justify-center shadow-xl transition-all transform active:scale-90 ${
              isCurrent && isPlaying
                ? 'bg-emerald-500 text-neutral-950 scale-100'
                : 'bg-white text-neutral-950 hover:scale-110 hover:bg-emerald-400'
            }`}
            aria-label={isCurrent && isPlaying ? 'Pause' : 'Play'}
          >
            {isCurrent && isPlaying ? (
              <Pause className="w-5 h-5 fill-current" />
            ) : (
              <Play className="w-5 h-5 fill-current ml-0.5" />
            )}
          </button>
        </div>

        {/* Equalizer animation badge if playing */}
        {isCurrent && isPlaying && (
          <div className="absolute bottom-2 left-2 px-2 py-1 rounded-md bg-neutral-950/80 backdrop-blur-sm flex items-end gap-0.5 h-5">
            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-2"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite] h-3.5"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.9s_infinite] h-1.5"></span>
            <span className="w-1 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite] h-3"></span>
          </div>
        )}

        {/* Category tag */}
        {song.category && (
          <span className="absolute top-2 left-2 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full bg-neutral-950/70 text-neutral-300 backdrop-blur-sm">
            {song.category}
          </span>
        )}
      </div>

      {/* Song details */}
      <div className="space-y-1">
        <div className="flex items-start justify-between gap-1">
          <h3
            className={`font-semibold text-sm truncate leading-tight transition-colors ${
              isCurrent ? 'text-emerald-400' : 'text-neutral-100 group-hover:text-emerald-300'
            }`}
            title={song.title}
          >
            {song.title}
          </h3>
          <span className="text-[11px] text-neutral-400 shrink-0 font-mono">
            {formatDuration(song.duration)}
          </span>
        </div>

        <p className="text-xs text-neutral-400 truncate" title={song.artist}>
          {song.artist}
        </p>

        {/* Quick action buttons */}
        <div className="pt-2 flex items-center justify-between border-t border-neutral-800/60 mt-2">
          <button
            type="button"
            onClick={handleLikeClick}
            className={`p-1.5 rounded-lg transition-colors ${
              isLiked
                ? 'text-rose-500 hover:text-rose-400'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800'
            }`}
            title={isLiked ? 'Unlike' : 'Like'}
          >
            <Heart className={`w-4 h-4 ${isLiked ? 'fill-rose-500' : ''}`} />
          </button>

          <button
            type="button"
            onClick={handleQueueClick}
            className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors flex items-center gap-1 text-[11px]"
            title="Add to queue"
          >
            {addedAnimation ? (
              <Check className="w-3.5 h-3.5 text-emerald-400" />
            ) : (
              <Plus className="w-3.5 h-3.5" />
            )}
            <span className="hidden sm:inline">Queue</span>
          </button>
        </div>
      </div>
    </div>
  );
}
