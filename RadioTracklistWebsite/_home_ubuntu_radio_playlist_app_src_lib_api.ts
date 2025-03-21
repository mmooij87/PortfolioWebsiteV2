import { PlaylistData } from '@/lib/types';

export async function fetchPlaylistData(): Promise<PlaylistData> {
  try {
    // In a production environment, this would be an API call
    // For now, we'll read from the local JSON file
    const response = await fetch('/api/playlist', { 
      cache: 'no-store',
      next: { revalidate: 0 }
    });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist data: ${response.status}`);
    }
    
    return await response.json();
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
