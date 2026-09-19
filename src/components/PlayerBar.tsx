import React, { useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  Volume1,
  VolumeX,
  Heart,
  Maximize2,
  ListMusic,
  Gauge,
} from 'lucide-react';
import { Song, RepeatMode } from '../types';

interface PlayerBarProps {
  currentSong: Song | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  repeatMode: RepeatMode;
  isShuffle: boolean;
  playbackRate: number;
  isLiked: boolean;
  queueLength: number;
  onTogglePlay: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onSeek: (time: number) => void;
  onVolumeChange: (vol: number) => void;
  onToggleMute: () => void;
  onToggleRepeat: () => void;
  onToggleShuffle: () => void;
  onToggleLike: (song: Song) => void;
  onSpeedChange: (speed: number) => void;
  onOpenExpanded: () => void;
  onToggleQueue: () => void;
}

export function PlayerBar({
  currentSong,
  isPlaying,
  currentTime,
  duration,
  volume,
  isMuted,
  repeatMode,
  isShuffle,
  playbackRate,
  isLiked,
  queueLength,
  onTogglePlay,
  onPrevious,
  onNext,
  onSeek,
  onVolumeChange,
  onToggleMute,
  onToggleRepeat,
  onToggleShuffle,
  onToggleLike,
  onSpeedChange,
  onOpenExpanded,
  onToggleQueue,
}: PlayerBarProps) {
  const [isHoveringSeek, setIsHoveringSeek] = useState(false);

  if (!currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const speeds = [1, 1.25, 1.5, 0.75];
  const cycleSpeed = () => {
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    onSpeedChange(speeds[nextIdx]);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 z-40 bg-neutral-950/95 backdrop-blur-xl border-t border-neutral-800/80 text-neutral-200 px-3 sm:px-6 py-2.5 shadow-2xl transition-all">
      <div className="max-w-7xl mx-auto flex flex-col gap-1.5">
        {/* Mobile Top Scrubber (shown as thin line above bar on mobile) */}
        <div className="sm:hidden w-full flex items-center gap-2">
          <span className="text-[10px] text-neutral-400 font-mono">{formatTime(currentTime)}</span>
          <div
            className="relative flex-1 h-1.5 bg-neutral-800 rounded-full cursor-pointer overflow-hidden"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              onSeek(pos * (duration || 30));
            }}
          >
            <div
              className="h-full bg-emerald-400 rounded-full"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            />
          </div>
          <span className="text-[10px] text-neutral-400 font-mono">{formatTime(duration)}</span>
        </div>

        {/* Main 3-Column Content */}
        <div className="flex items-center justify-between gap-2 sm:gap-6">
          {/* Left: Song Art & Info */}
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0 w-1/3 sm:w-1/4">
            <div
              onClick={onOpenExpanded}
              className="relative w-11 h-11 sm:w-14 sm:h-14 rounded-xl overflow-hidden bg-neutral-900 shrink-0 cursor-pointer group shadow-md"
            >
              {currentSong.artwork ? (
                <img
                  src={currentSong.artwork}
                  alt={currentSong.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-neutral-600">
                  <Play className="w-5 h-5" />
                </div>
              )}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Maximize2 className="w-4 h-4 text-white" />
              </div>
            </div>

            <div className="min-w-0 flex-1">
              <p
                onClick={onOpenExpanded}
                className="font-semibold text-xs sm:text-sm text-neutral-100 truncate hover:text-emerald-400 cursor-pointer transition-colors"
                title={currentSong.title}
              >
                {currentSong.title}
              </p>
              <p className="text-[11px] sm:text-xs text-neutral-400 truncate" title={currentSong.artist}>
                {currentSong.artist}
              </p>
            </div>

            <button
              type="button"
              onClick={() => onToggleLike(currentSong)}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-100 transition-colors hidden xs:block"
              title={isLiked ? 'Liked' : 'Like'}
            >
              <Heart className={`w-4 h-4 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
            </button>
          </div>

          {/* Center: Controls & Scrubber */}
          <div className="flex flex-col items-center gap-1.5 flex-1 max-w-xl">
            {/* Buttons Row */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                type="button"
                onClick={onToggleShuffle}
                className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                  isShuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={isShuffle ? 'Shuffle On' : 'Shuffle Off'}
              >
                <Shuffle className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={onPrevious}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors active:scale-90"
                title="Pichla gaana (Previous)"
              >
                <SkipBack className="w-5 h-5 fill-current" />
              </button>

              {/* Main Play/Pause Button */}
              <button
                type="button"
                onClick={onTogglePlay}
                className="w-10 h-10 sm:w-11 sm:h-11 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shadow-lg shadow-emerald-500/25 transition-all active:scale-95"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <Pause className="w-5 h-5 fill-current" />
                ) : (
                  <Play className="w-5 h-5 fill-current ml-0.5" />
                )}
              </button>

              <button
                type="button"
                onClick={onNext}
                className="p-1.5 rounded-lg text-neutral-300 hover:text-white transition-colors active:scale-90"
                title="Agla gaana (Next)"
              >
                <SkipForward className="w-5 h-5 fill-current" />
              </button>

              <button
                type="button"
                onClick={onToggleRepeat}
                className={`p-1.5 rounded-lg transition-colors hidden sm:block ${
                  repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 hover:text-neutral-200'
                }`}
                title={`Repeat: ${repeatMode}`}
              >
                {repeatMode === 'one' ? <Repeat1 className="w-4 h-4" /> : <Repeat className="w-4 h-4" />}
              </button>
            </div>

            {/* Desktop Scrubber Progress Bar */}
            <div className="hidden sm:flex items-center gap-2.5 w-full">
              <span className="text-xs text-neutral-400 font-mono w-10 text-right">
                {formatTime(currentTime)}
              </span>

              <div
                className="relative flex-1 py-2 cursor-pointer group"
                onMouseEnter={() => setIsHoveringSeek(true)}
                onMouseLeave={() => setIsHoveringSeek(false)}
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  onSeek(pos * (duration || 30));
                }}
              >
                <div className="h-1.5 bg-neutral-800 group-hover:h-2 rounded-full overflow-hidden transition-all">
                  <div
                    className="h-full bg-emerald-500 group-hover:bg-emerald-400 rounded-full transition-all"
                    style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                </div>
                {/* Thumb pointer dot */}
                {isHoveringSeek && (
                  <div
                    className="absolute top-1/2 -translate-y-1/2 w-3.5 h-3.5 bg-white rounded-full shadow pointer-events-none -ml-1.5 transition-all"
                    style={{ left: `${Math.min(100, Math.max(0, progressPercent))}%` }}
                  />
                )}
              </div>

              <span className="text-xs text-neutral-400 font-mono w-10">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Right: Volume, Speed, Queue & Fullscreen */}
          <div className="flex items-center justify-end gap-1.5 sm:gap-3 w-1/3 sm:w-1/4">
            {/* Speed toggle */}
            <button
              type="button"
              onClick={cycleSpeed}
              className="px-2 py-1 rounded-lg text-xs font-mono bg-neutral-900 border border-neutral-800 text-neutral-300 hover:text-emerald-400 transition-colors hidden md:flex items-center gap-1"
              title="Playback speed"
            >
              <Gauge className="w-3 h-3 text-neutral-400" />
              <span>{playbackRate}x</span>
            </button>

            {/* Volume */}
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={onToggleMute}
                className="text-neutral-400 hover:text-neutral-200 p-1"
                title={isMuted ? 'Unmute' : 'Mute'}
              >
                {isMuted || volume === 0 ? (
                  <VolumeX className="w-4 h-4 text-rose-400" />
                ) : volume < 0.5 ? (
                  <Volume1 className="w-4 h-4" />
                ) : (
                  <Volume2 className="w-4 h-4" />
                )}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={isMuted ? 0 : volume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-20 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
              />
            </div>

            {/* Queue Toggle */}
            <button
              type="button"
              onClick={onToggleQueue}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 relative transition-colors"
              title="Music Queue"
            >
              <ListMusic className="w-4 h-4 sm:w-5 sm:h-5" />
              {queueLength > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-500 text-neutral-950 font-bold text-[10px] rounded-full flex items-center justify-center">
                  {queueLength}
                </span>
              )}
            </button>

            {/* Fullscreen Expand */}
            <button
              type="button"
              onClick={onOpenExpanded}
              className="p-2 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/80 transition-colors"
              title="Full Screen Player"
            >
              <Maximize2 className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
