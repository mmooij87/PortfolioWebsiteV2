'use client';

'use client';
'use client';
import React, { useState, useEffect, useCallback } from 'react';
import PlaylistTable from '@/components/PlaylistTable';
import AutoRefresh from '@/components/AutoRefresh';
import RadioPlayer from '@/components/RadioPlayer';
import { fetchPlaylistData } from '@/lib/api';
import { PlaylistData } from '@/lib/types';

export default function Home() {
  const [playlistData, setPlaylistData] = useState<PlaylistData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchPlaylistData();
      setPlaylistData(data);
    } catch (err) {
      console.error('Error fetching playlist data:', err);
      setError('Failed to load playlist data. Please try again later.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return (
    <main className="flex min-h-screen flex-col items-center p-4 md:p-8">
      <RadioPlayer />
      <div className="w-full max-w-6xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold mb-2">KINK Radio Playlist</h1>
          <p className="text-gray-600 dark:text-gray-400">

            Live updates of songs played on KINK radio station
          </p>
        </div>

        <div className="mb-6 flex justify-end">
          {playlistData && (
            <AutoRefresh 
              onRefresh={fetchData} 
              lastUpdated={playlistData.last_updated} 
              interval={60}
            />
          )}
        </div>

        {loading && !playlistData ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <p>{error}</p>
          </div>
        ) : playlistData ? (
          <PlaylistTable 
            songs={playlistData.songs} 
            lastUpdated={playlistData.last_updated} 
          />
        ) : null}

        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>Data provided by <a href="https://onlineradiobox.com/nl/kink/playlist/" className="underline hover:text-blue-500" target="_blank" rel="noopener noreferrer">onlineradiobox.com</a></p>


        </footer>
      </div>
    </main>
  );
}
