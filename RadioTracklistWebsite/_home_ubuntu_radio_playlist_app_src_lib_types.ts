export interface Song {
  timestamp: string;
  artist: string;
  title: string;
  is_live: boolean;
  scraped_at: string;
}

export interface PlaylistData {
  station: string;
  last_updated: string;
  songs: Song[];
}
