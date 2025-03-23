'use client';

import React, { useState, useEffect } from 'react';
import { Song } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';
import { fetchTrackInfo } from '@/lib/api';

interface PlaylistTableProps {
  songs: Song[];
  lastUpdated: string;
}

export default function PlaylistTable({ songs, lastUpdated }: PlaylistTableProps) {
  const [timeAgo, setTimeAgo] = useState<string>('');
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null);
  const [trackInfo, setTrackInfo] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [detailsPanelVisible, setDetailsPanelVisible] = useState(false);

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
  
  const handleTrackClick = async (songIndex: number) => {
    // If clicking the same track, toggle it closed
    if (selectedTrackId === songIndex) {
      setSelectedTrackId(null);
      setTrackInfo(null);
      setDetailsPanelVisible(false);
      return;
    }
    
    // Set the selected track and start loading
    setSelectedTrackId(songIndex);
    setLoading(true);
    setError(null);
    setTrackInfo(null);
    setDetailsPanelVisible(true);
    
    const song = songs[songIndex];
    
    try {
      const data = await fetchTrackInfo(song.artist, song.title);
      console.log('Track info data:', data);
      setTrackInfo(data);
    } catch (err) {
      console.error('Error loading track info:', err);
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Find the currently playing song
  const currentSong = songs.find(song => song.is_live);

  // Function to close the details panel
  const closeDetailsPanel = () => {
    setDetailsPanelVisible(false);
    setSelectedTrackId(null);
    setTrackInfo(null);
  };

  // CSS styles for song details panel
const songDetailsPanelStyles = `
  /* Song details panel styles */
  .song-details-panel {
    background-color: #1e1e1e;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 15px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
    position: relative;
    max-height: 500px;
    overflow: hidden;
    transition: max-height 0.3s ease-out, opacity 0.3s ease-out, margin 0.3s ease-out;
  }

  .song-details-panel.collapsed {
    max-height: 0;
    padding-top: 0;
    padding-bottom: 0;
    margin-top: 0;
    margin-bottom: 0;
    opacity: 0;
    pointer-events: none;
  }

  .song-details-content {
    display: flex;
    flex-wrap: wrap;
  }

  .song-cover-art {
    width: 120px;
    height: 120px;
    border-radius: 6px;
    margin-right: 20px;
    margin-bottom: 15px;
    background-color: #282828;
    overflow: hidden;
  }

  .song-cover-art img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .song-info {
    flex: 1;
    min-width: 200px;
  }

  .song-title {
    font-size: 24px;
    font-weight: 700;
    margin-bottom: 5px;
  }

  .song-artist {
    font-size: 18px;
    color: #b3b3b3;
    margin-bottom: 15px;
  }

  .close-btn {
    position: absolute;
    top: 12px;
    right: 12px;
    background: none;
    border: none;
    color: #b3b3b3;
    cursor: pointer;
    padding: 5px;
    border-radius: 50%;
  }

  .close-btn:hover {
    background-color: #282828;
    color: #ffffff;
  }

  .song-actions {
    display: flex;
    gap: 10px;
    margin-top: 15px;
  }

  .song-action-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    background-color: #282828;
    color: #ffffff;
    border: none;
    border-radius: 4px;
    padding: 8px 12px;
    font-size: 14px;
    cursor: pointer;
  }

  .song-action-btn.youtube {
    background-color: rgba(255, 0, 0, 0.2);
  }

  .song-action-btn.spotify {
    background-color: rgba(29, 185, 84, 0.2);
  }

  /* Light mode compatibility */
  @media (prefers-color-scheme: light) {
    .song-details-panel {
      background-color: #f5f5f5;
      color: #333333;
    }
    
    .song-artist {
      color: #666666;
    }
    
    .close-btn {
      color: #666666;
    }
    
    .close-btn:hover {
      background-color: #e0e0e0;
      color: #333333;
    }
    
    .song-action-btn {
      background-color: #e0e0e0;
      color: #333333;
    }
  }
`;

return (
    <div className="overflow-x-auto">
      <style>{songDetailsPanelStyles}</style>
      {/* Song details panel */}
      <div id="song-details-panel" className={`song-details-panel ${!detailsPanelVisible ? 'collapsed' : ''}`}>
        <button 
          id="close-song-details"
          onClick={closeDetailsPanel}
          className="close-btn"
          title="Close"
        >
          ✕
        </button>
        
        <div className="song-details-content">
          {selectedTrackId !== null && songs[selectedTrackId] && (
            <div className="song-cover-art" id="song-cover-art">
              {songs[selectedTrackId].coverart ? (
                <img 
                  id="song-cover-img"
                  src={songs[selectedTrackId].coverart} 
                  alt={`${songs[selectedTrackId].artist} - ${songs[selectedTrackId].title} album cover`}
                />
              ) : (
                <div className="w-full h-full bg-gray-700 flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
            </div>
          )}
          
          <div className="song-info">
            {selectedTrackId !== null && songs[selectedTrackId] && (
              <>
                <div className="song-title" id="song-title">{songs[selectedTrackId].title}</div>
                <div className="song-artist" id="song-artist">{songs[selectedTrackId].artist}</div>
              </>  
            )}
            
            {loading ? (
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-blue-500"></div>
                <span>Loading track information...</span>
              </div>
            ) : error ? (
              <div className="text-red-400 mb-4">
                <p>{error}</p>
                <p className="text-sm mt-1">This track might not be available on Last.fm.</p>
              </div>
            ) : trackInfo ? (
              <div id="song-description" className="space-y-4">
                {trackInfo.wiki?.summary && (
                  <div className="text-sm text-gray-300" 
                       dangerouslySetInnerHTML={{ __html: trackInfo.wiki.summary }} />
                )}
                
                {trackInfo.album && (
                  <p className="text-gray-400">
                    Album: <a 
                      href={trackInfo.album.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:underline text-blue-400"
                    >
                      {trackInfo.album.title}
                    </a>
                  </p>
                )}
                
                {trackInfo.toptags && trackInfo.toptags.tag && (
                  <div>
                    <span className="text-gray-400 mr-2">Tags:</span>
                    <div className="inline-flex flex-wrap gap-2">
                      {Array.isArray(trackInfo.toptags.tag) 
                        ? trackInfo.toptags.tag.slice(0, 5).map((tag: any, i: number) => (
                            <a 
                              key={i}
                              href={tag.url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors"
                            >
                              {tag.name}
                            </a>
                          ))
                        : (
                            <a 
                              href={(trackInfo.toptags.tag as any).url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="bg-gray-700 px-2 py-1 rounded-full text-xs hover:bg-gray-600 transition-colors"
                            >
                              {(trackInfo.toptags.tag as any).name}
                            </a>
                          )
                      }
                    </div>
                  </div>
                )}
              </div>
            ) : null}
            
            {selectedTrackId !== null && songs[selectedTrackId] && (
              <div className="song-actions">
                <button
                  id="song-youtube-btn"
                  className="song-action-btn youtube"
                  onClick={(e) => {
                    e.stopPropagation();
                    openYouTube(songs[selectedTrackId].artist, songs[selectedTrackId].title);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"></path>
                  </svg>
                  Watch on YouTube
                </button>
                <button
                  id="song-spotify-btn"
                  className="song-action-btn spotify"
                  onClick={(e) => {
                    e.stopPropagation();
                    openSpotify(songs[selectedTrackId].artist, songs[selectedTrackId].title);
                  }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Open in Spotify
                </button>
                {trackInfo && trackInfo.url && (
                  <a 
                    href={trackInfo.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="song-action-btn"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12-5.373-12-12-12-5.373-12-12-12zm-1.25 16.518l-4.5-4.319 1.396-1.435 3.078 2.937 6.105-6.218 1.421 1.409-7.5 7.626z"/>
                    </svg>
                    View on Last.fm
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Display current song with cover art */}
      {currentSong && (
        <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
          <div className="flex flex-col md:flex-row items-center gap-4">
            <div className="w-32 h-32 relative flex-shrink-0">
              {currentSong.coverart ? (
                <img 
                  src={currentSong.coverart} 
                  alt={`${currentSong.artist} - ${currentSong.title} album cover`}
                  className="w-full h-full object-cover rounded-md shadow-md"
              ) : (
                <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                </div>
              )}
              <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-tl-md rounded-br-md">
                LIVE
              </div>
            </div>
            <div className="flex-grow text-center md:text-left">
              <h3 className="text-xl font-bold">{currentSong.title}</h3>
              <p className="text-lg text-gray-700 dark:text-gray-300">{currentSong.artist}</p>
              <div className="mt-3 flex justify-center md:justify-start space-x-2">
                <button type="button"
                  onClick={() => openYouTube(currentSong.artist, currentSong.title)}
                  className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
                  </svg>
                  YouTube
                </button>
                <button
                  onClick={() => openSpotify(currentSong.artist, currentSong.title)}
                  className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
                  </svg>
                  Spotify
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
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
            <React.Fragment key={index}>
              <tr 
                className={`border-t border-gray-200 dark:border-gray-700 ${
                  song.is_live ? 'bg-green-50 dark:bg-green-900/20' : ''
                } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer ${
                  selectedTrackId === index ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                }`}
                onClick={() => handleTrackClick(index)}
              >
                <td className="px-4 py-4 font-mono">
                  {song.is_live ? (
                    <span className="inline-block px-2 py-1 text-xs font-semibold rounded-full bg-green-500 text-white">
                      LIVE
                    </span>
                  ) : (
                    song.timestamp
                  )}
                </td>
                <td className="px-4 py-4">
                  <div className="flex items-center">
                    {song.coverart ? (
                      <img 
                        src={song.coverart} 
                        alt={`${song.artist} - ${song.title} album cover`}
                        className="w-10 h-10 mr-3 rounded-md object-cover"
                  ) : (
                    <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3-2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  <span className="font-medium">{song.artist}</span>
                </div>
              </td>
              <td className="px-4 py-4">{song.title}</td>
              <td className="px-4 py-4 text-center">
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

      {/* Track Info Modal */}
      {selectedTrack && (
        <TrackInfoModal
          isOpen={showTrackInfo}
          onClose={() => setShowTrackInfo(false)}
          artist={selectedTrack.artist}
          title={selectedTrack.title}
        />
      )}
    </div>
  );
}

// Format duration from milliseconds to MM:SS
const formatDuration = (ms: string) => {
  const totalSeconds = Math.floor(parseInt(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

return (
  <div className="overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Current Playlist</h2>
      {timeAgo && <p className="text-sm text-gray-500">Last updated: {timeAgo}</p>}
    </div>
    
    {/* Display current song with cover art */}
    {currentSong && (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 relative flex-shrink-0">
            {currentSong.coverart ? (
              <img 
                src={currentSong.coverart} 
                alt={`${currentSong.artist} - ${currentSong.title} album cover`}
                className="w-full h-full object-cover rounded-md shadow-md"
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-tl-md rounded-br-md">
            LIVE
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold">{currentSong.title}</h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">{currentSong.artist}</p>
          <div className="mt-3 flex justify-center md:justify-start space-x-2">
            <button type="button"
              onClick={() => openYouTube(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              YouTube
            </button>
            <button
              onClick={() => openSpotify(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </button>
          </div>
        </div>
      </div>
    )}
    
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
          <React.Fragment key={index}>
            <tr 
              className={`border-t border-gray-200 dark:border-gray-700 ${
                song.is_live ? 'bg-green-50 dark:bg-green-900/20' : ''
              } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer`}
              onClick={() => handleTrackClick(song)}
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
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {song.coverart ? (
                    <img 
                      src={song.coverart} 
                      alt={`${song.artist} - ${song.title} album cover`}
                      className="w-10 h-10 mr-3 rounded-md object-cover"
                  ) : (
                    <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  <span className="font-medium">{song.artist}</span>
                </div>
              </td>
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

      {/* Track Info Modal */}
      {selectedTrack && (
        <TrackInfoModal
          isOpen={showTrackInfo}
          onClose={() => setShowTrackInfo(false)}
          artist={selectedTrack.artist}
          title={selectedTrack.title}
        />
      )}
    </div>
  );
}

// Format duration from milliseconds to MM:SS
const formatDuration = (ms: string) => {
  const totalSeconds = Math.floor(parseInt(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

return (
  <div className="overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Current Playlist</h2>
      {timeAgo && <p className="text-sm text-gray-500">Last updated: {timeAgo}</p>}
    </div>
    
    {/* Display current song with cover art */}
    {currentSong && (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 relative flex-shrink-0">
            {currentSong.coverart ? (
              <img 
                src={currentSong.coverart} 
                alt={`${currentSong.artist} - ${currentSong.title} album cover`}
                className="w-full h-full object-cover rounded-md shadow-md"
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-tl-md rounded-br-md">
            LIVE
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold">{currentSong.title}</h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">{currentSong.artist}</p>
          <div className="mt-3 flex justify-center md:justify-start space-x-2">
            <button type="button"
              onClick={() => openYouTube(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              YouTube
            </button>
            <button
              onClick={() => openSpotify(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </button>
          </div>
        </div>
      </div>
    )}
    
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
          <React.Fragment key={index}>
            <tr 
              className={`border-t border-gray-200 dark:border-gray-700 ${
                song.is_live ? 'bg-green-50 dark:bg-green-900/20' : ''
              } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer`}
              onClick={() => handleTrackClick(song)}
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
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {song.coverart ? (
                    <img 
                      src={song.coverart} 
                      alt={`${song.artist} - ${song.title} album cover`}
                      className="w-10 h-10 mr-3 rounded-md object-cover"
                  ) : (
                    <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  <span className="font-medium">{song.artist}</span>
                </div>
              </td>
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

      {/* Track Info Modal */}
      {selectedTrack && (
        <TrackInfoModal
          isOpen={showTrackInfo}
          onClose={() => setShowTrackInfo(false)}
          artist={selectedTrack.artist}
          title={selectedTrack.title}
        />
      )}
    </div>
  );
}

// Format duration from milliseconds to MM:SS
const formatDuration = (ms: string) => {
  const totalSeconds = Math.floor(parseInt(ms) / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
};

return (
  <div className="overflow-x-auto">
    <div className="flex justify-between items-center mb-4">
      <h2 className="text-xl font-bold">Current Playlist</h2>
      {timeAgo && <p className="text-sm text-gray-500">Last updated: {timeAgo}</p>}
    </div>
    
    {/* Display current song with cover art */}
    {currentSong && (
      <div className="mb-6 p-4 bg-green-50 dark:bg-green-900/20 rounded-lg shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-32 h-32 relative flex-shrink-0">
            {currentSong.coverart ? (
              <img 
                src={currentSong.coverart} 
                alt={`${currentSong.artist} - ${currentSong.title} album cover`}
                className="w-full h-full object-cover rounded-md shadow-md"
          ) : (
            <div className="w-full h-full bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
              </svg>
            </div>
          )}
          <div className="absolute top-0 left-0 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-tl-md rounded-br-md">
            LIVE
          </div>
        </div>
        <div className="flex-grow text-center md:text-left">
          <h3 className="text-xl font-bold">{currentSong.title}</h3>
          <p className="text-lg text-gray-700 dark:text-gray-300">{currentSong.artist}</p>
          <div className="mt-3 flex justify-center md:justify-start space-x-2">
            <button type="button"
              onClick={() => openYouTube(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-red-600 text-white hover:bg-red-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19.615 3.184c-3.604-.246-11.631-.245-15.23 0-3.897.266-4.356 2.62-4.385 8.816.029 6.185.484 8.549 4.385 8.816 3.6.245 11.626.246 15.23 0 3.897-.266 4.356-2.62 4.385-8.816-.029-6.185-.484-8.549-4.385-8.816zm-10.615 12.816v-8l8 3.993-8 4.007z"/>
              </svg>
              YouTube
            </button>
            <button
              onClick={() => openSpotify(currentSong.artist, currentSong.title)}
              className="px-3 py-1 rounded bg-green-600 text-white hover:bg-green-700 transition-colors text-sm flex items-center"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.48.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Spotify
            </button>
          </div>
        </div>
      </div>
    )}
    
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
          <React.Fragment key={index}>
            <tr 
              className={`border-t border-gray-200 dark:border-gray-700 ${
                song.is_live ? 'bg-green-50 dark:bg-green-900/20' : ''
              } hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer`}
              onClick={() => handleTrackClick(song)}
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
              <td className="px-4 py-3">
                <div className="flex items-center">
                  {song.coverart ? (
                    <img 
                      src={song.coverart} 
                      alt={`${song.artist} - ${song.title} album cover`}
                      className="w-10 h-10 mr-3 rounded-md object-cover"
                  ) : (
                    <div className="w-10 h-10 mr-3 bg-gray-200 dark:bg-gray-700 rounded-md flex items-center justify-center flex-shrink-0">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                      </svg>
                    </div>
                  )}
                  <span className="font-medium">{song.artist}</span>
                </div>
              </td>
              <td className="px-4 py-3">{song.title}</td>
              <td className="px-4 py-3 text-center">
                <div className="flex justify-center space-x-2">
                  <button
                    onClick={() => openYouTube(song.artist, song.title)}
                    className="p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition-colors"
                    title="Search on
