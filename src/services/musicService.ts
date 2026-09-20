import { Song } from '../types';
import { CURATED_SONGS } from '../data/curatedSongs';

const cache = new Map<string, Song[]>();

export async function searchSongsOnline(query: string): Promise<Song[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (cache.has(trimmed)) {
    return cache.get(trimmed)!;
  }

  // Resilient 8-second timeout to prevent hanging mobile connections
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=40`;
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json',
      },
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`Search request returned HTTP ${response.status}`);
    }

    const data = await response.json();
    const results: Song[] = [];

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        if (!item.previewUrl) continue;
        // Ensure strictly HTTPS for release compliance
        const secureAudioUrl = String(item.previewUrl).replace(/^http:\/\//i, 'https://');
        const secureArtwork = (item.artworkUrl100 || '')
          .replace(/^http:\/\//i, 'https://')
          .replace('100x100bb', '600x600bb');

        results.push({
          id: String(item.trackId || Math.random().toString(36).substring(2)),
          title: String(item.trackName || 'Unknown Title').trim(),
          artist: String(item.artistName || 'Unknown Artist').trim(),
          album: String(item.collectionName || item.trackName || 'Single').trim(),
          artwork: secureArtwork,
          audioUrl: secureAudioUrl,
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          category: determineCategory(item.primaryGenreName, item.trackName, item.artistName),
          source: 'search',
        });
      }
    }

    cache.set(trimmed, results);
    return results;
  } catch (err: unknown) {
    clearTimeout(timeoutId);
    // Graceful offline and network degradation fallback
    const filtered = CURATED_SONGS.filter(
      (s) =>
        s.title.toLowerCase().includes(trimmed) ||
        s.artist.toLowerCase().includes(trimmed) ||
        s.album.toLowerCase().includes(trimmed)
    );
    return filtered;
  }
}

function determineCategory(genre?: string, title?: string, artist?: string): string {
  const text = `${genre || ''} ${title || ''} ${artist || ''}`.toLowerCase();
  if (text.includes('punjabi') || text.includes('bhangra') || text.includes('moose') || text.includes('dhillon')) {
    return 'punjabi';
  }
  if (text.includes('bollywood') || text.includes('hindi') || text.includes('arijit') || text.includes('pritam')) {
    return 'bollywood';
  }
  if (text.includes('romantic') || text.includes('love') || text.includes('acoustic')) {
    return 'romantic';
  }
  if (text.includes('lofi') || text.includes('chill') || text.includes('relax')) {
    return 'lofi';
  }
  return 'global';
}
