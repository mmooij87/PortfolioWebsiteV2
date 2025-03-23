interface Song {
  artist: string;
  title: string;
  is_live?: boolean;
  coverart?: string;
}

interface PlaylistData {
  station: string;
  last_updated: string;
  songs: Song[];
}

// Last.fm API key - in a production environment, this should be stored in environment variables
const LASTFM_API_KEY = 'e5cc7bbd902948943ba515aabecc5747'; // Last.fm API key provided by user
const LASTFM_API_URL = 'https://ws.audioscrobbler.com/2.0/';

export async function fetchPlaylistData(): Promise<PlaylistData> {
  try {
    // In a production environment, this would be an API call
    // For now, we'll read from the local JSON file
    const response = await fetch('/api/playlist', { 
      cache: 'no-store'
    });
    
    // If running in development and the API route fails, try a fallback
    if (!response.ok && typeof window !== 'undefined' && window.location.hostname === 'localhost') {
      console.log('Trying fallback data source...');
      try {
        const fallbackResponse = await fetch('/data/playlist.json');
        if (fallbackResponse.ok) {
          return await fallbackResponse.json();
        }
      } catch (fallbackError) {
        console.error('Fallback data source failed:', fallbackError);
      }
    }
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist data: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Fetch cover art for all songs, with priority for the live song
    const liveSong = data.songs.find((song: Song) => song.is_live);
    
    // First fetch cover art for the live song
    if (liveSong) {
      try {
        liveSong.coverart = await fetchCoverArt(liveSong.artist, liveSong.title);
      } catch (coverError) {
        console.error('Error fetching cover art for live song:', coverError);
        // Continue without cover art if there's an error
      }
    }
    
    // Then fetch cover art for the rest of the songs (limited to recent ones to avoid API rate limits)
    const recentSongs = data.songs.filter((song: Song) => !song.is_live).slice(0, 10);
    await Promise.all(
      recentSongs.map(async (song: Song) => {
        try {
          song.coverart = await fetchCoverArt(song.artist, song.title);
        } catch (coverError) {
          console.error(`Error fetching cover art for ${song.artist} - ${song.title}:`, coverError);
          // Continue without cover art if there's an error
        }
      })
    );
    
    return data;
  } catch (error) {
    console.error('Error fetching playlist data:', error);
    // Return empty data structure if fetch fails
    return {
      station: 'KINK',
      last_updated: new Date().toISOString(),
      songs: []
    };
  }
}

/**
 * Fetch album cover art from Last.fm API
 */
async function fetchCoverArt(artist: string, title: string): Promise<string | undefined> {
  try {
    // First try to get album art by track info
    const trackUrl = `${LASTFM_API_URL}?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
    
    const response = await fetch(trackUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch track info: ${response.status}`);
    }
    
    const data = await response.json();
    
    // Check if we have album art in the track info
    if (data.track && data.track.album && data.track.album.image) {
      // Get the largest image (usually the last one in the array)
      const images = data.track.album.image;
      const largeImage = images.find((img: any) => img.size === 'extralarge' || img.size === 'large');
      
      if (largeImage && largeImage['#text']) {
        return largeImage['#text'];
      }
    }
    
    // If no album art found in track info, try artist info as fallback
    const artistUrl = `${LASTFM_API_URL}?method=artist.getinfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&format=json`;
    
    const artistResponse = await fetch(artistUrl);
    if (!artistResponse.ok) {
      return undefined;
    }
    
    const artistData = await artistResponse.json();
    
    // Check if we have artist image
    if (artistData.artist && artistData.artist.image) {
      const images = artistData.artist.image;
      const largeImage = images.find((img: any) => img.size === 'extralarge' || img.size === 'large');
      
      if (largeImage && largeImage['#text']) {
        return largeImage['#text'];
      }
    }
    
    return undefined;
  } catch (error) {
    console.error('Error fetching cover art:', error);
    return undefined;
  }
}

/**
 * Fetch detailed track information from Last.fm API
 */
export async function fetchTrackInfo(artist: string, title: string) {
  try {
    const url = `${LASTFM_API_URL}?method=track.getInfo&api_key=${LASTFM_API_KEY}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch track info: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      throw new Error(data.message || 'Track not found');
    }
    
    return data.track;
  } catch (error) {
    console.error('Error fetching track info:', error);
    throw error;
  }
}
