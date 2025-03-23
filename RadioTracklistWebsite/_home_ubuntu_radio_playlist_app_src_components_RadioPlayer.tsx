'use client';

import React, { useEffect, useState, useRef } from 'react';

export default function RadioPlayer() {
  const [isPlayerVisible, setIsPlayerVisible] = useState(true);
  const scriptRef = useRef<HTMLScriptElement | null>(null);

  useEffect(() => {
    // Check if script already exists to prevent duplicate loading
    if (!document.querySelector('script[src="https://static.elfsight.com/platform/platform.js"]')) {
      // Load Elfsight script
      const script = document.createElement('script');
      script.src = 'https://static.elfsight.com/platform/platform.js';
      script.defer = true;
      script.async = true;
      document.body.appendChild(script);
      scriptRef.current = script;
    }

    return () => {
      // Only remove the script if we added it
      if (scriptRef.current && document.body.contains(scriptRef.current)) {
        document.body.removeChild(scriptRef.current);
      }
    };
  }, []);

  const togglePlayer = () => {
    setIsPlayerVisible(!isPlayerVisible);
  };

  return (
    <div className="fixed bottom-4 right-4 z-50 shadow-lg rounded-lg overflow-hidden">
      <div 
        className={`elfsight-app-6bffb49b-d941-4d91-9957-161acc98843f ${isPlayerVisible ? '' : 'hidden'}`} 
        data-elfsight-app-lazy
      >
        {/* Elfsight Radio Player will be rendered here */}
      </div>
      <div className="bg-white dark:bg-gray-800 p-2 text-xs text-center text-gray-500">
        <button 
          className="hover:text-blue-500 transition-colors"
          onClick={togglePlayer}
        >
          {isPlayerVisible ? 'Hide Player' : 'Show Player'}
        </button>
      </div>
    </div>
  );
}