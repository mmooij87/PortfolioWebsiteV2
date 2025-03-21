'use client';

import { useState, useEffect } from 'react';
import { Song } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

interface PlaylistTableProps {
  songs: Song[];
  lastUpdated: string;
}

export default function PlaylistTable({ songs, lastUpdated }: PlaylistTableProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');

  useEffect(() => {
    if (lastUpdated) {
      const updateTimeAgo = () => {
        try {
          const date = new Date(lastUpdated);
          setTimeAgo(formatDistanceToNow(date, { addSuffix: true }));
        } catch (error) {
          console.error('Error formatting date:', error);
          setTimeAgo('');
        }
      };

      updateTimeAgo();
      const interval = setInterval(updateTimeAgo, 60000);
      return () => clearInterval(interval);
    }
  }, [lastUpdated]);

  const openYouTube = (artist: string, title: string) => {
    const query = encodeURIComponent(`${artist} - ${title}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const openSpotify = (artist: string, title: string) => {
    const query = encodeURIComponent(`${artist} ${title}`);
    window.open(`https://open.spotify.com/search/${query}`, '_blank');
  };

  return (
    <div className="overflow-x-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold">Current Playlist</h2>
        {timeAgo && <p className="text-sm text-gray-500">Last updated: {timeAgo}</p>}
      </div>
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-100 dark:bg-gray-800">
            <th className="px-4 py-2 text-left">Time</th>
            <th className="px-4 py-2 text-left">Artist</th>
            <th className="px-4 py-2 text-left">Title</th>
            <th className="px-4 py-2 text-center">Links</th>
          </tr>
        </thead>
        <tbody>
          {songs.map((song, index) => (
            <tr 
              key={index} 
              className={`border-t border-gray-200 dark:border-gray-700 ${
                song.is_live ? 'bg-green-50 dark:bg-green-900/20' : ''
              }`}
            >
              <td className="px-4 py-3 font-mono">
                {song.is_live ? (
                  <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                    LIVE
                  </span>
                ) : (
                  song.timestamp
                )}
              </td>
              <td className="px-4 py-3 font-medium">{song.artist}</td>
              <td className="px-4 py-3">{song.title}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => openYouTube(song.artist, song.title)}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="Search on YouTube"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                    </svg>
                  </button>
                  <button
                    onClick={() => openSpotify(song.artist, song.title)}
                    className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors"
                    title="Search on Spotify"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                    </svg>
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
