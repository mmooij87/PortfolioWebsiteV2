'use client';

import { useState, useEffect } from 'react';
import type { FC } from 'react';
// Removed unused PlaylistData import

interface AutoRefreshProps {
  onRefresh: () => void;
  lastUpdated: string;
  interval?: number; // in seconds
}

export default function AutoRefresh({ onRefresh, lastUpdated, interval = 60 }: AutoRefreshProps) {
  const [countdown, setCountdown] = useState(interval);
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    // Reset countdown when lastUpdated changes
    setCountdown(interval);
  }, [lastUpdated, interval]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          handleRefresh();
          return interval;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [interval]);

  const handleRefresh = async () => {
    if (isRefreshing) return;
    
    // Save current scroll position before refreshing
    const scrollPosition = window.scrollY;
    
    setIsRefreshing(true);
    try {
      await onRefresh();
      
      // Restore scroll position after data is refreshed
      setTimeout(() => {
        window.scrollTo({
          top: scrollPosition,
          behavior: 'auto'
        });
      }, 100); // Small delay to ensure DOM has updated
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <div className="flex items-center space-x-4">
      <div className="text-sm text-gray-500">
        Auto-refresh in: <span className="font-mono">{countdown}s</span>
      </div>
      <button
        onClick={handleRefresh}
        disabled={isRefreshing}
        className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50 transition-colors"
      >
        {isRefreshing ? 'Refreshing...' : 'Refresh Now'}
      </button>
    </div>
  );
}
