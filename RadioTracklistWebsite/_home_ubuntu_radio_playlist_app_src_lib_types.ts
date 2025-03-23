export interface Song {
  timestamp: string;
  artist: string;
  title: string;
  is_live: boolean;
  scraped_at: string;
  coverart?: string; // URL to album cover art image
}

export interface PlaylistData {
  station: string;
  last_updated: string;
  songs: Song[];
}
