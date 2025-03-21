'use client';

import { useState, useEffect } from 'react';
import { PlaylistData } from '@/lib/types';

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
    
    setIsRefreshing(true);
    try {
      await onRefresh();
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
