import { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { AlertCircle, RotateCcw, SkipForward } from 'lucide-react';
import { CURATED_SONGS } from './data/curatedSongs';
import { Song, RepeatMode } from './types';
import { searchSongsOnline } from './services/musicService';
import { Header } from './components/Header';
import { SearchBar } from './components/SearchBar';
import { SongList } from './components/SongList';
import { PlayerBar } from './components/PlayerBar';
import { ExpandedPlayerModal } from './components/ExpandedPlayerModal';
import { QueueDrawer } from './components/QueueDrawer';

export default function App() {
  // Audio Element
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Playback States
  const [currentSong, setCurrentSong] = useState<Song | null>(CURATED_SONGS[0] || null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.85);
  const [isMuted, setIsMuted] = useState(false);
  const [repeatMode, setRepeatMode] = useState<RepeatMode>('all');
  const [isShuffle, setIsShuffle] = useState(false);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [streamError, setStreamError] = useState<string | null>(null);

  // Queue and Liked Songs
  const [queue, setQueue] = useState<Song[]>([]);
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(() => {
    try {
      const saved = localStorage.getItem('free_music_player_liked');
      return saved ? new Set(JSON.parse(saved)) : new Set<string>();
    } catch {
      return new Set<string>();
    }
  });

  // Search & Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Song[]>([]);
  const [isLoadingSearch, setIsLoadingSearch] = useState(false);
  const [activeChip, setActiveChip] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Modals & Panels
  const [isExpandedPlayer, setIsExpandedPlayer] = useState(false);
  const [isQueueOpen, setIsQueueOpen] = useState(false);

  // Initialize initial song in audio element
  useEffect(() => {
    if (audioRef.current && currentSong && !audioRef.current.src) {
      audioRef.current.src = currentSong.audioUrl;
      audioRef.current.load();
    }
  }, [currentSong]);

  // Save liked songs to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('free_music_player_liked', JSON.stringify(Array.from(likedSongIds)));
    } catch (err) {
      console.error('Failed to save liked songs:', err);
    }
  }, [likedSongIds]);

  // Sync Audio volume and playback rate
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
      audioRef.current.playbackRate = playbackRate;
    }
  }, [volume, isMuted, playbackRate]);

  // Play a song with robust state handling
  const handlePlaySong = useCallback((song: Song) => {
    setStreamError(null);
    setCurrentSong(song);
    if (audioRef.current) {
      audioRef.current.src = song.audioUrl;
      audioRef.current.load();
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err: unknown) => {
        setIsPlaying(false);
        const errMessage = err instanceof Error ? err.message : '';
        if (!errMessage.includes('abort') && !errMessage.includes('interrupted')) {
          setStreamError(`Playback for "${song.title}" could not start. Click Retry or Skip to Next.`);
        }
      });
    }
  }, []);

  // Toggle play/pause
  const handleTogglePlay = useCallback(() => {
    if (!audioRef.current || !currentSong) return;
    setStreamError(null);

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      if (!audioRef.current.src || !audioRef.current.src.includes(currentSong.audioUrl)) {
        audioRef.current.src = currentSong.audioUrl;
        audioRef.current.load();
      }
      audioRef.current.play().then(() => {
        setIsPlaying(true);
      }).catch((err: unknown) => {
        setIsPlaying(false);
        const errMessage = err instanceof Error ? err.message : '';
        if (!errMessage.includes('abort') && !errMessage.includes('interrupted')) {
          setStreamError(`Playback error. Please retry playing "${currentSong.title}".`);
        }
      });
    }
  }, [isPlaying, currentSong]);

  // Current active songs list (for next/previous calculations)
  const currentActiveList = useMemo(() => {
    if (searchTerm.trim() && searchResults.length > 0) {
      return searchResults;
    }
    if (selectedCategory === 'favorites') {
      const allKnown = [...CURATED_SONGS, ...searchResults];
      return allKnown.filter((s) => likedSongIds.has(s.id));
    }
    if (selectedCategory === 'all') {
      return CURATED_SONGS;
    }
    return CURATED_SONGS.filter((s) => s.category === selectedCategory);
  }, [searchTerm, searchResults, selectedCategory, likedSongIds]);

  // Next song
  const handleNext = useCallback(() => {
    if (queue.length > 0) {
      const nextSong = queue[0];
      setQueue((prev) => prev.slice(1));
      handlePlaySong(nextSong);
      return;
    }

    if (!currentSong || currentActiveList.length === 0) return;

    if (isShuffle) {
      const randomIndex = Math.floor(Math.random() * currentActiveList.length);
      handlePlaySong(currentActiveList[randomIndex]);
      return;
    }

    const currentIndex = currentActiveList.findIndex((s) => s.id === currentSong.id);
    if (currentIndex !== -1 && currentIndex < currentActiveList.length - 1) {
      handlePlaySong(currentActiveList[currentIndex + 1]);
    } else if (repeatMode === 'all') {
      handlePlaySong(currentActiveList[0]);
    }
  }, [queue, currentSong, currentActiveList, isShuffle, repeatMode, handlePlaySong]);

  // Previous song
  const handlePrevious = useCallback(() => {
    if (!currentSong || currentActiveList.length === 0) return;

    // If played > 3 seconds, replay current song from beginning
    if (currentTime > 3 && audioRef.current) {
      audioRef.current.currentTime = 0;
      return;
    }

    const currentIndex = currentActiveList.findIndex((s) => s.id === currentSong.id);
    if (currentIndex > 0) {
      handlePlaySong(currentActiveList[currentIndex - 1]);
    } else {
      handlePlaySong(currentActiveList[currentActiveList.length - 1]);
    }
  }, [currentSong, currentActiveList, currentTime, handlePlaySong]);

  // Seek
  const handleSeek = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  // Audio Event Listeners
  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
      if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
        setDuration(audioRef.current.duration);
      }
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  const handleEnded = () => {
    if (repeatMode === 'one' && audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    } else {
      handleNext();
    }
  };

  // Like Toggle
  const handleToggleLike = (song: Song) => {
    setLikedSongIds((prev) => {
      const next = new Set(prev);
      if (next.has(song.id)) {
        next.delete(song.id);
      } else {
        next.add(song.id);
      }
      return next;
    });
  };

  // Add to Queue
  const handleAddToQueue = (song: Song) => {
    setQueue((prev) => [...prev, song]);
  };

  // Play All
  const handlePlayAll = (songs: Song[], shuffle = false) => {
    if (!songs.length) return;
    if (shuffle) {
      const shuffled = [...songs].sort(() => Math.random() - 0.5);
      handlePlaySong(shuffled[0]);
      setQueue(shuffled.slice(1));
    } else {
      handlePlaySong(songs[0]);
      setQueue(songs.slice(1));
    }
  };

  // Search logic
  const handleSearchSubmit = async (query: string) => {
    if (!query.trim()) return;
    setIsLoadingSearch(true);
    setActiveChip(null);
    try {
      const results = await searchSongsOnline(query);
      setSearchResults(results);
    } catch (err) {
      console.error('Search error:', err);
    } finally {
      setIsLoadingSearch(false);
    }
  };

  // Live search debounce
  useEffect(() => {
    if (!searchTerm.trim()) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(() => {
      handleSearchSubmit(searchTerm);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  const handleSelectChip = (chip: string) => {
    setActiveChip(chip);
    setSearchTerm(chip);
    handleSearchSubmit(chip);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setSearchResults([]);
    setActiveChip(null);
  };

  // Keyboard Shortcuts (Space for play/pause, Left/Right for seek)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is focused inside an input or textarea
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA'
      ) {
        return;
      }

      if (e.code === 'Space') {
        e.preventDefault();
        handleTogglePlay();
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.min(
            (duration || 30),
            audioRef.current.currentTime + 5
          );
        }
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (audioRef.current) {
          audioRef.current.currentTime = Math.max(0, audioRef.current.currentTime - 5);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleTogglePlay, duration]);

  // Media Session API for lock screen and bluetooth media controls
  useEffect(() => {
    if (
      typeof window !== 'undefined' &&
      'mediaSession' in navigator &&
      typeof MediaMetadata !== 'undefined' &&
      currentSong
    ) {
      try {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: currentSong.title,
          artist: currentSong.artist,
          album: currentSong.album,
          artwork: [
            { src: currentSong.artwork, sizes: '96x96', type: 'image/jpeg' },
            { src: currentSong.artwork, sizes: '256x256', type: 'image/jpeg' },
            { src: currentSong.artwork, sizes: '512x512', type: 'image/jpeg' },
          ],
        });

        const safeSetAction = (action: MediaSessionAction, handler: MediaSessionActionHandler | null) => {
          try {
            navigator.mediaSession.setActionHandler(action, handler);
          } catch {
            // Ignore unsupported actions gracefully on older/custom Android WebViews
          }
        };

        safeSetAction('play', () => handleTogglePlay());
        safeSetAction('pause', () => handleTogglePlay());
        safeSetAction('previoustrack', () => handlePrevious());
        safeSetAction('nexttrack', () => handleNext());
        safeSetAction('seekto', (details) => {
          if (details.seekTime !== undefined && details.seekTime !== null) {
            handleSeek(details.seekTime);
          }
        });
      } catch {
        // Suppress debug notice in production
      }
    }
  }, [currentSong, handleTogglePlay, handlePrevious, handleNext]);

  // Handle hardware back button on Android devices
  useEffect(() => {
    const handleBackButton = () => {
      if (isExpandedPlayer) {
        setIsExpandedPlayer(false);
      } else if (isQueueOpen) {
        setIsQueueOpen(false);
      }
    };
    window.addEventListener('popstate', handleBackButton);
    document.addEventListener('backbutton', handleBackButton);
    return () => {
      window.removeEventListener('popstate', handleBackButton);
      document.removeEventListener('backbutton', handleBackButton);
    };
  }, [isExpandedPlayer, isQueueOpen]);

  // Determine what songs to display
  const isSearchActive = searchTerm.trim().length > 0;
  const displaySongs = useMemo(() => {
    if (isSearchActive) {
      return searchResults;
    }
    if (selectedCategory === 'favorites') {
      const allKnown = [...CURATED_SONGS, ...searchResults];
      return allKnown.filter((s) => likedSongIds.has(s.id));
    }
    if (selectedCategory === 'all') {
      return CURATED_SONGS;
    }
    return CURATED_SONGS.filter((s) => s.category === selectedCategory);
  }, [isSearchActive, searchResults, selectedCategory, likedSongIds]);

  const displayTitle = useMemo(() => {
    if (isSearchActive) {
      return `Khoj Parinam: "${searchTerm}"`;
    }
    switch (selectedCategory) {
      case 'bollywood':
        return 'Bollywood Hits (Superhit Gaane)';
      case 'punjabi':
        return 'Punjabi Beats (Bhangra & Hip-Hop)';
      case 'romantic':
        return 'Romantic Melodies (Dil Se)';
      case 'lofi':
        return 'Lo-Fi & Relax (Shant Dhoon)';
      case 'global':
        return 'Global Hits (International)';
      case 'favorites':
        return 'Aapke Manpasand Gaane (Liked Songs)';
      default:
        return 'Common Gaane (Trending & Popular)';
    }
  }, [isSearchActive, searchTerm, selectedCategory]);

  const displaySubtitle = useMemo(() => {
    if (isSearchActive) {
      return 'Kissi bhi gaane par click karke turant sunein';
    }
    return '100% Free • Koi VIP ya Subscription nahi • Bina rukawat suniye';
  }, [isSearchActive]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Hidden Native Audio Element with State Synchronization */}
      <audio
        ref={audioRef}
        playsInline
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleEnded}
        onError={(e) => {
          setIsPlaying(false);
          const mediaError = e.currentTarget.error;
          let message = `"${currentSong?.title || 'Song'}" preview stream unavailable. Skip to next song or retry.`;
          if (mediaError?.code === MediaError.MEDIA_ERR_NETWORK) {
            message = `Network issue while streaming "${currentSong?.title || 'Song'}". Please check connection.`;
          }
          setStreamError(message);
        }}
        preload="auto"
      />

      {/* Top Navbar */}
      <Header />

      {/* Audio Stream Error Alert */}
      {streamError && (
        <div className="max-w-4xl mx-auto px-4 mt-3">
          <div className="flex items-center justify-between gap-3 bg-rose-500/10 border border-rose-500/30 text-rose-300 px-4 py-3 rounded-xl text-sm animate-in fade-in duration-200">
            <div className="flex items-center gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{streamError}</span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setStreamError(null);
                  if (currentSong) handlePlaySong(currentSong);
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-rose-500/20 hover:bg-rose-500/30 rounded-lg text-rose-200 font-medium transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Retry
              </button>
              <button
                type="button"
                onClick={() => {
                  setStreamError(null);
                  handleNext();
                }}
                className="flex items-center gap-1 px-2.5 py-1 text-xs bg-neutral-800 hover:bg-neutral-700 rounded-lg text-neutral-200 font-medium transition-colors"
              >
                <SkipForward className="w-3.5 h-3.5" />
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-32 sm:pb-36">
        {/* Search Bar section (As requested: "upar mein search bar ho jisse hum gana play kar paye") */}
        <SearchBar
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          onSearchSubmit={handleSearchSubmit}
          onClear={handleClearSearch}
          isLoading={isLoadingSearch}
          activeChip={activeChip}
          onSelectChip={handleSelectChip}
          isSearching={isSearchActive}
        />

        {/* Common Songs Section (As requested: "niche kuchh common gana ho jise hum sun paye play pause kar paye") */}
        <SongList
          songs={displaySongs}
          title={displayTitle}
          subtitle={displaySubtitle}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          currentSong={currentSong}
          isPlaying={isPlaying}
          likedSongIds={likedSongIds}
          onPlaySong={handlePlaySong}
          onTogglePlay={handleTogglePlay}
          onToggleLike={handleToggleLike}
          onAddToQueue={handleAddToQueue}
          onPlayAll={handlePlayAll}
          isSearchActive={isSearchActive}
        />
      </main>

      {/* Sticky Bottom Player Bar (Always visible with play, pause, seek, volume, next/prev) */}
      <PlayerBar
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration || (currentSong?.duration || 30)}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        playbackRate={playbackRate}
        isLiked={currentSong ? likedSongIds.has(currentSong.id) : false}
        queueLength={queue.length}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleRepeat={() => {
          const modes: RepeatMode[] = ['off', 'all', 'one'];
          const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
          setRepeatMode(next);
        }}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleLike={handleToggleLike}
        onSpeedChange={setPlaybackRate}
        onOpenExpanded={() => setIsExpandedPlayer(true)}
        onToggleQueue={() => setIsQueueOpen((prev) => !prev)}
      />

      {/* Full-Screen Immersive Player Modal */}
      <ExpandedPlayerModal
        isOpen={isExpandedPlayer}
        onClose={() => setIsExpandedPlayer(false)}
        currentSong={currentSong}
        isPlaying={isPlaying}
        currentTime={currentTime}
        duration={duration || (currentSong?.duration || 30)}
        volume={volume}
        isMuted={isMuted}
        repeatMode={repeatMode}
        isShuffle={isShuffle}
        playbackRate={playbackRate}
        isLiked={currentSong ? likedSongIds.has(currentSong.id) : false}
        onTogglePlay={handleTogglePlay}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSeek={handleSeek}
        onVolumeChange={setVolume}
        onToggleMute={() => setIsMuted((prev) => !prev)}
        onToggleRepeat={() => {
          const modes: RepeatMode[] = ['off', 'all', 'one'];
          const next = modes[(modes.indexOf(repeatMode) + 1) % modes.length];
          setRepeatMode(next);
        }}
        onToggleShuffle={() => setIsShuffle((prev) => !prev)}
        onToggleLike={handleToggleLike}
        onSpeedChange={setPlaybackRate}
      />

      {/* Queue Drawer */}
      <QueueDrawer
        isOpen={isQueueOpen}
        onClose={() => setIsQueueOpen(false)}
        queue={queue}
        currentSong={currentSong}
        onPlaySong={(song) => {
          handlePlaySong(song);
          setQueue((prev) => prev.filter((s) => s.id !== song.id));
        }}
        onRemoveFromQueue={(index) => {
          setQueue((prev) => prev.filter((_, i) => i !== index));
        }}
        onClearQueue={() => setQueue([])}
      />
    </div>
  );
}
