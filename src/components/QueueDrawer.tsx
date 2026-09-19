import React from 'react';
import { X, Play, Trash2, Music2, ListMusic } from 'lucide-react';
import { Song } from '../types';

interface QueueDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  queue: Song[];
  currentSong: Song | null;
  onPlaySong: (song: Song) => void;
  onRemoveFromQueue: (index: number) => void;
  onClearQueue: () => void;
}

export function QueueDrawer({
  isOpen,
  onClose,
  queue,
  currentSong,
  onPlaySong,
  onRemoveFromQueue,
  onClearQueue,
}: QueueDrawerProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
      <div className="w-full max-w-md bg-neutral-900 border-l border-neutral-800 h-full flex flex-col p-5 shadow-2xl animate-in slide-in-from-right duration-200">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-neutral-800">
          <div className="flex items-center gap-2">
            <ListMusic className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-neutral-100">Play Queue (Agla Gaana)</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-neutral-800 text-neutral-400">
              {queue.length}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {queue.length > 0 && (
              <button
                type="button"
                onClick={onClearQueue}
                className="text-xs text-neutral-400 hover:text-rose-400 transition-colors flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-neutral-800"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Clear</span>
              </button>
            )}
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Current Song Section */}
        {currentSong && (
          <div className="py-4 border-b border-neutral-800/80">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-400 block mb-2">
              Abhi Chal Raha Hai (Now Playing)
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-neutral-800/80 border border-emerald-500/20">
              <img
                src={currentSong.artwork}
                alt={currentSong.title}
                className="w-11 h-11 rounded-lg object-cover bg-neutral-950 shrink-0"
                referrerPolicy="no-referrer"
              />
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-neutral-100 truncate">
                  {currentSong.title}
                </p>
                <p className="text-xs text-neutral-400 truncate">{currentSong.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Queue List */}
        <div className="flex-1 overflow-y-auto py-3 space-y-2">
          {queue.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 text-neutral-500">
              <Music2 className="w-12 h-12 mb-3 stroke-1" />
              <p className="text-sm font-medium text-neutral-300">Queue khali hai</p>
              <p className="text-xs text-neutral-400 mt-1 max-w-xs">
                Gaano ke paas "+" button dabakar ya kisi gaane ko play karke yahan list banayein.
              </p>
            </div>
          ) : (
            queue.map((song, index) => (
              <div
                key={`${song.id}-${index}`}
                className="group flex items-center justify-between p-2 rounded-xl hover:bg-neutral-800/60 transition-colors"
              >
                <div
                  onClick={() => onPlaySong(song)}
                  className="flex items-center gap-3 min-w-0 flex-1 cursor-pointer"
                >
                  <span className="text-xs font-mono text-neutral-400 w-4 text-center">
                    {index + 1}
                  </span>
                  <img
                    src={song.artwork}
                    alt={song.title}
                    className="w-10 h-10 rounded-lg object-cover bg-neutral-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div className="min-w-0 flex-1 pr-2">
                    <p className="text-sm font-medium text-neutral-200 truncate group-hover:text-emerald-300">
                      {song.title}
                    </p>
                    <p className="text-xs text-neutral-400 truncate">{song.artist}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => onPlaySong(song)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-neutral-700 transition-colors"
                    title="Play now"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFromQueue(index)}
                    className="p-1.5 rounded-lg text-neutral-400 hover:text-rose-400 hover:bg-neutral-700 transition-colors"
                    title="Remove from queue"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
