import { useState } from 'react';
import {
  X,
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Shuffle,
  Repeat,
  Repeat1,
  Volume2,
  VolumeX,
  Heart,
  Music,
  Share2,
  Check,
} from 'lucide-react';
import { Song, RepeatMode } from '../types';

interface ExpandedPlayerModalProps {
  isOpen: boolean;
  onClose: () => void;
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
}

export function ExpandedPlayerModal({
  isOpen,
  onClose,
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
}: ExpandedPlayerModalProps) {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !currentSong) return null;

  const formatTime = (seconds: number) => {
    if (isNaN(seconds) || seconds < 0) return '0:00';
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: currentSong.title,
        text: `Suno: ${currentSong.title} by ${currentSong.artist} on Free Music Player!`,
        url: window.location.href,
      }).catch(() => {});
    } else {
      navigator.clipboard.writeText(
        `Suno ${currentSong.title} by ${currentSong.artist} on Free Music Player: ${window.location.href}`
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-neutral-950/90 backdrop-blur-2xl flex flex-col justify-between p-4 sm:p-8 animate-in fade-in duration-200 overflow-y-auto">
      {/* Top Header */}
      <div className="max-w-xl mx-auto w-full flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            Now Playing
          </span>
          <span className="text-xs text-neutral-400">100% Free • Bina VIP</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleShare}
            className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 transition-colors"
            title="Gaana share karein"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Share2 className="w-4 h-4" />}
          </button>

          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            title="Band karein"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Center Visual & Artwork */}
      <div className="max-w-md mx-auto w-full my-auto py-6 flex flex-col items-center">
        <div className="relative w-64 h-64 sm:w-80 sm:h-80 rounded-3xl overflow-hidden shadow-2xl shadow-emerald-500/10 border border-neutral-800/80 bg-neutral-900 group">
          {currentSong.artwork ? (
            <img
              src={currentSong.artwork}
              alt={currentSong.title}
              className={`w-full h-full object-cover transition-transform duration-700 ${
                isPlaying ? 'scale-105' : 'scale-100'
              }`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-neutral-600">
              <Music className="w-20 h-20" />
            </div>
          )}

          {/* Equalizer animation bar overlay at bottom */}
          {isPlaying && (
            <div className="absolute bottom-4 left-4 right-4 py-2 px-3 rounded-xl bg-neutral-950/80 backdrop-blur-md flex items-end justify-center gap-1.5 h-10 border border-neutral-800/50">
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.8s_infinite] h-4"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.6s_infinite] h-7"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.9s_infinite] h-3"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.7s_infinite] h-6"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.5s_infinite] h-8"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.85s_infinite] h-5"></span>
              <span className="w-1.5 bg-emerald-400 rounded-full animate-[bounce_0.65s_infinite] h-7"></span>
            </div>
          )}
        </div>

        {/* Title, Artist, Like button */}
        <div className="w-full mt-6 flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h2 className="text-xl sm:text-2xl font-bold text-neutral-100 truncate">
              {currentSong.title}
            </h2>
            <p className="text-sm sm:text-base text-neutral-400 truncate mt-0.5">
              {currentSong.artist}
            </p>
            {currentSong.album && (
              <p className="text-xs text-neutral-400 truncate mt-0.5">
                Album: {currentSong.album}
              </p>
            )}
          </div>

          <button
            type="button"
            onClick={() => onToggleLike(currentSong)}
            className="p-2.5 rounded-2xl bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-100 transition-colors shrink-0"
          >
            <Heart className={`w-6 h-6 ${isLiked ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Scrubber Slider */}
        <div className="w-full mt-6">
          <div
            className="relative w-full h-2 bg-neutral-800 rounded-full cursor-pointer group"
            onClick={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const pos = (e.clientX - rect.left) / rect.width;
              onSeek(pos * (duration || 30));
            }}
          >
            <div
              className="h-full bg-emerald-400 rounded-full relative"
              style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
            >
              <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-md transform translate-x-1/2" />
            </div>
          </div>
          <div className="flex justify-between text-xs text-neutral-400 font-mono mt-2">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="w-full mt-6 flex items-center justify-between">
          <button
            type="button"
            onClick={onToggleShuffle}
            className={`p-2.5 rounded-xl transition-colors ${
              isShuffle ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Shuffle"
          >
            <Shuffle className="w-5 h-5" />
          </button>

          <button
            type="button"
            onClick={onPrevious}
            className="p-3 rounded-full text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors"
            title="Previous"
          >
            <SkipBack className="w-7 h-7 fill-current" />
          </button>

          <button
            type="button"
            onClick={onTogglePlay}
            className="w-16 h-16 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 transition-transform active:scale-90"
            title={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <Pause className="w-8 h-8 fill-current" />
            ) : (
              <Play className="w-8 h-8 fill-current ml-1" />
            )}
          </button>

          <button
            type="button"
            onClick={onNext}
            className="p-3 rounded-full text-neutral-200 hover:text-white hover:bg-neutral-900 transition-colors"
            title="Next"
          >
            <SkipForward className="w-7 h-7 fill-current" />
          </button>

          <button
            type="button"
            onClick={onToggleRepeat}
            className={`p-2.5 rounded-xl transition-colors ${
              repeatMode !== 'off' ? 'text-emerald-400 bg-emerald-500/10' : 'text-neutral-400 hover:text-neutral-200'
            }`}
            title="Repeat"
          >
            {repeatMode === 'one' ? <Repeat1 className="w-5 h-5" /> : <Repeat className="w-5 h-5" />}
          </button>
        </div>

        {/* Bottom bar: Volume & Speed */}
        <div className="w-full mt-8 flex items-center justify-between pt-6 border-t border-neutral-800/80">
          <div className="flex items-center gap-2 flex-1 max-w-[200px]">
            <button
              type="button"
              onClick={onToggleMute}
              className="text-neutral-400 hover:text-neutral-200"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5 text-rose-400" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={isMuted ? 0 : volume}
              onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
              className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
            />
          </div>

          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 p-1 rounded-xl">
            {[1, 1.25, 1.5].map((rate) => (
              <button
                key={rate}
                onClick={() => onSpeedChange(rate)}
                className={`px-2 py-1 rounded-lg text-xs font-mono transition-colors ${
                  playbackRate === rate
                    ? 'bg-emerald-500 text-neutral-950 font-bold'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {rate}x
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
