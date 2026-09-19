import { Song } from '../types';
import { CURATED_SONGS } from '../data/curatedSongs';

const cache = new Map<string, Song[]>();

export async function searchSongsOnline(query: string): Promise<Song[]> {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) return [];

  if (cache.has(trimmed)) {
    return cache.get(trimmed)!;
  }

  try {
    const url = `https://itunes.apple.com/search?term=${encodeURIComponent(query)}&media=music&entity=song&limit=40`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Search failed: ${response.statusText}`);
    }

    const data = await response.json();
    const results: Song[] = [];

    if (Array.isArray(data.results)) {
      for (const item of data.results) {
        if (!item.previewUrl) continue;
        results.push({
          id: String(item.trackId || Math.random().toString(36).substring(2)),
          title: item.trackName || 'Unknown Title',
          artist: item.artistName || 'Unknown Artist',
          album: item.collectionName || item.trackName || 'Single',
          artwork: (item.artworkUrl100 || '').replace('100x100bb', '600x600bb'),
          audioUrl: item.previewUrl,
          duration: Math.round((item.trackTimeMillis || 30000) / 1000),
          category: determineCategory(item.primaryGenreName, item.trackName, item.artistName),
          source: 'search',
        });
      }
    }

    cache.set(trimmed, results);
    return results;
  } catch (err) {
    console.warn('Online search error, falling back to local search:', err);
    // Fallback: search in curated library
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
