import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

const PLAYLIST_URL = "https://onlineradiobox.com/nl/kink/playlist/?cs=nl.slamfm";

async function fetchPlaylistPage(): Promise<string> {
  try {
    const headers = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
    };
    const response = await fetch(PLAYLIST_URL, { headers, cache: 'no-store' });
    
    if (!response.ok) {
      throw new Error(`Failed to fetch playlist data: ${response.status}`);
    }
    
    return await response.text();
  } catch (error) {
    console.error('Error fetching playlist page:', error);
    throw error;
  }
}

function parseSongInfo(row: cheerio.Element, $: cheerio.CheerioAPI) {
  try {
    // Get all td elements in the row
    const cells = $(row).find('td');
    
    // Skip if we don't have at least 2 cells (timestamp and song)
    if (cells.length < 2) {
      return null;
    }
    
    // Extract timestamp from the first cell
    const timestamp = $(cells[0]).text().trim();
    
    // Extract song info from the second cell
    const songText = $(cells[1]).text().trim();
    
    // Split artist and title if possible
    let artist = "Unknown";
    let title = songText;
    
    if (songText.includes(" - ")) {
      [artist, title] = songText.split(" - ", 2);
    }
    
    // Check if it's currently playing
    const isLive = timestamp.toLowerCase() === "live";
    
    return {
      timestamp,
      artist: artist.trim(),
      title: title.trim(),
      is_live: isLive,
      scraped_at: new Date().toISOString()
    };
  } catch (error) {
    console.error('Error parsing song info:', error);
    return null;
  }
}

async function scrapePlaylist() {
  try {
    const html = await fetchPlaylistPage();
    const $ = cheerio.load(html);
    
    // Find the playlist table
    const playlistTable = $('table').first();
    
    if (!playlistTable.length) {
      throw new Error('Playlist table not found');
    }
    
    // Extract song information from table rows
    const songs = [];
    
    playlistTable.find('tr').each((_, row) => {
      const songInfo = parseSongInfo(row, $);
      if (songInfo) {
        songs.push(songInfo);
      }
    });
    
    return {
      station: "KINK",
      last_updated: new Date().toISOString(),
      songs
    };
  } catch (error) {
    console.error('Error scraping playlist:', error);
    throw error;
  }
}

export async function GET(request: NextRequest) {
  try {
    const playlistData = await scrapePlaylist();
    return NextResponse.json(playlistData);
  } catch (error) {
    console.error('Error in playlist API route:', error);
    return NextResponse.json(
      { error: 'Failed to fetch playlist data' },
      { status: 500 }
    );
  }
}
