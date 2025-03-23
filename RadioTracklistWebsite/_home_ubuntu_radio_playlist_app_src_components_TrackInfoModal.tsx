'use client';

import React, { useEffect, useState } from 'react';
import { fetchTrackInfo } from '@/lib/api';

interface TrackInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  artist: string;
  title: string;
}

interface TrackInfo {
  name: string;
  artist: {
    name: string;
    url: string;
  };
  album?: {
    title: string;
    url: string;
    artist: string;
    image: Array<{
      size: string;
      '#text': string;
    }>;
  };
  url: string;
  duration: string;
  listeners: string;
  playcount: string;
  toptags?: {
    tag: Array<{
      name: string;
      url: string;
    }>;
  };
  wiki?: {
    published: string;
    summary: string;
    content: string;
  };
}

export default function TrackInfoModal({ isOpen, onClose, artist, title }: TrackInfoModalProps) {
  const [trackInfo, setTrackInfo] = useState<TrackInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadTrackInfo();
    }
  }, [isOpen, artist, title]);

  const loadTrackInfo = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await fetchTrackInfo(artist, title);
      console.log('Track info data:', data);
      setTrackInfo(data);
    } catch (err) {
      console.error('Error loading track info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Add these functions that were referenced but missing
  const openYouTube = (artist: string, title: string) => {
    const query = encodeURIComponent(`${artist} - ${title}`);
    window.open(`https://www.youtube.com/results?search_query=${query}`, '_blank');
  };

  const openSpotify = (artist: string, title: string) => {
    const query = encodeURIComponent(`${artist} ${title}`);
    window.open(`https://open.spotify.com/search/${query}`, '_blank');
  };

  if (!isOpen) return null;

  // Format duration from milliseconds to MM:SS
  const formatDuration = (ms: string) => {
    const totalSeconds = Math.floor(parseInt(ms) / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Get album art or placeholder
  const getAlbumArt = () => {
    if (trackInfo?.album?.image && trackInfo.album.image.length > 0) {
      // Get the largest image
      const largeImage = trackInfo.album.image.find(img => img.size === 'large') || 
                        trackInfo.album.image[trackInfo.album.image.length - 1];
      return largeImage['#text'];
    }
    return null;
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-start mb-4">
            <h2 className="text-2xl font-bold">Track Information</h2>
            <button 
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {loading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
          ) : error ? (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p>{error}</p>
              <p className="text-sm mt-2">This track might not be available on Last.fm.</p>
            </div>
          ) : trackInfo ? (
            <div className="space-y-6">
              <div className="flex flex-col md:flex-row gap-6">
                {getAlbumArt() ? (
                  <div className="w-32 h-32 flex-shrink-0">
                    <img 
                      src={getAlbumArt()!} a
                      alt={`${trackInfo.artist.name} - ${trackInfo.name} album cover`}
                      className="w-full h-full object-cover rounded-md shadow-md"
                    />
                  </div>
                ) : (
                  <div className="w-32 h-32 bg-gray-200 dark:bg-gray-700 flex-shrink-0 rounded-md flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                    </svg>
                  </div>
                )}
                
                <div className="flex-grow">
                  <h3 className="text-xl font-bold">{trackInfo.name}</h3>
                  <p className="text-lg text-gray-700 dark:text-gray-300">
                    By <a 
                      href={trackInfo.artist.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-600 dark:text-blue-400"
                    >
                      {trackInfo.artist.name}
                    </a>
                  </p>
                  {trackInfo.album && (
                    <p className="text-gray-600 dark:text-gray-400 mt-1">
                      Album: <a 
                        href={trackInfo.album.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="hover:underline text-blue-600 dark:text-blue-400"
                      >
                        {trackInfo.album.title}
                      </a>
                    </p>
                  )}
                  <div className="mt-3 space-x-4 flex">
                    <a 
                      href={trackInfo.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm inline-flex items-center"
                    >
                      View on Last.fm
                    </a>
                    <button
                      onClick={() => openYouTube(trackInfo.artist.name, trackInfo.name)}
                      className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                      </svg>
                      YouTube
                    </button>
                    <button
                      onClick={() => openSpotify(trackInfo.artist.name, trackInfo.name)}
                      className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm inline-flex items-center"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                        <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                      </svg>
                      Spotify
                    </button>
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-semibold">Duration:</span> {formatDuration(trackInfo.duration)}
                </div>
                <div>
                  <span className="font-semibold">Listeners:</span> {parseInt(trackInfo.listeners).toLocaleString()}
                </div>
                <div>
                  <span className="font-semibold">Playcount:</span> {parseInt(trackInfo.playcount).toLocaleString()}
                </div>
              </div>
              
              {trackInfo.toptags && trackInfo.toptags.tag && (
                <div>
                  <h4 className="font-semibold mb-2">Tags:</h4>
                  <div className="flex flex-wrap gap-2">
                    {Array.isArray(trackInfo.toptags.tag) 
                      ? trackInfo.toptags.tag.map((tag, i) => (
                          <a 
                            key={i}
                            href={tag.url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            {tag.name}
                          </a>
                        ))
                      : (
                          <a 
                            href={(trackInfo.toptags.tag as any).url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                          >
                            {(trackInfo.toptags.tag as any).name}
                          </a>
                        )
                    }
                  </div>
                </div>
              )}
              
              {trackInfo.wiki && (
                <div>
                  <h4 className="font-semibold mb-2">About:</h4>
                  <div className="text-sm text-gray-700 dark:text-gray-300" 
                       dangerouslySetInnerHTML={{ __html: trackInfo.wiki.summary }} />
                  
                  {trackInfo.wiki.published && (
                    <p className="text-xs text-gray-500 mt-2">
                      Published: {new Date(trackInfo.wiki.published).toLocaleDateString()}
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}