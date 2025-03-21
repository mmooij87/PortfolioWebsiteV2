#!/usr/bin/env python3
"""
Radio Station Playlist Scraper

This script scrapes the playlist data from a radio station website and saves it to a JSON file.
It extracts timestamps, artist names, and song titles.
"""

import json
import os
import re
import time
from datetime import datetime
from typing import Dict, List, Optional, Tuple

import requests
from bs4 import BeautifulSoup
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Constants
PLAYLIST_URL = "https://onlineradiobox.com/nl/kink/playlist/?cs=nl.slamfm"
OUTPUT_FILE = os.path.join(os.path.dirname(os.path.dirname(__file__)), "data", "playlist.json")
CACHE_DURATION = 300  # 5 minutes in seconds


def ensure_data_directory():
    """Ensure the data directory exists."""
    data_dir = os.path.dirname(OUTPUT_FILE)
    os.makedirs(data_dir, exist_ok=True)


def fetch_playlist_page() -> str:
    """Fetch the playlist page content."""
    try:
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
        response = requests.get(PLAYLIST_URL, headers=headers, timeout=10)
        response.raise_for_status()
        return response.text
    except requests.RequestException as e:
        print(f"Error fetching playlist page: {e}")
        return ""


def parse_song_info(row) -> Optional[Dict]:
    """Parse song information from a table row element."""
    try:
        # Get all td elements in the row
        cells = row.find_all('td')
        
        # Skip if we don't have at least 2 cells (timestamp and song)
        if len(cells) < 2:
            return None
        
        # Extract timestamp from the first cell
        timestamp_cell = cells[0]
        timestamp = timestamp_cell.get_text().strip()
        
        # Extract song info from the second cell
        song_cell = cells[1]
        song_text = song_cell.get_text().strip()
        
        # Split artist and title if possible
        if " - " in song_text:
            artist, title = song_text.split(" - ", 1)
        else:
            artist = "Unknown"
            title = song_text
        
        # Check if it's currently playing
        is_live = timestamp.lower() == "live"
        
        return {
            "timestamp": timestamp,
            "artist": artist.strip(),
            "title": title.strip(),
            "is_live": is_live,
            "scraped_at": datetime.now().isoformat()
        }
    except Exception as e:
        print(f"Error parsing song info: {e}")
        return None


def scrape_playlist() -> List[Dict]:
    """Scrape the playlist data from the website."""
    html_content = fetch_playlist_page()
    if not html_content:
        return []
    
    soup = BeautifulSoup(html_content, "html.parser")
    
    # Find the playlist table - it's the only table on the page
    playlist_table = soup.find("table")
    if not playlist_table:
        print("Playlist table not found")
        return []
    
    # Extract song information from table rows
    songs = []
    for row in playlist_table.find_all("tr"):
        song_info = parse_song_info(row)
        if song_info:
            songs.append(song_info)
    
    return songs


def save_playlist(songs: List[Dict]):
    """Save the playlist data to a JSON file."""
    ensure_data_directory()
    
    # Add metadata
    data = {
        "station": "KINK",
        "last_updated": datetime.now().isoformat(),
        "songs": songs
    }
    
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)
    
    print(f"Saved {len(songs)} songs to {OUTPUT_FILE}")


def should_update_cache() -> bool:
    """Check if the cache should be updated."""
    if not os.path.exists(OUTPUT_FILE):
        return True
    
    try:
        file_age = time.time() - os.path.getmtime(OUTPUT_FILE)
        return file_age > CACHE_DURATION
    except Exception:
        return True


def main():
    """Main function."""
    if should_update_cache():
        print("Fetching fresh playlist data...")
        songs = scrape_playlist()
        if songs:
            save_playlist(songs)
        else:
            print("No songs found")
    else:
        print(f"Using cached playlist data (less than {CACHE_DURATION} seconds old)")


if __name__ == "__main__":
    main()
