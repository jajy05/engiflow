import React, { useState, useEffect } from 'react';
import { SpinnerIcon } from './icons/SpinnerIcon';

interface SyncStatusIndicatorProps {
  lastSyncTime: number;
}

type SyncState = 'synced' | 'syncing';

export const SyncStatusIndicator: React.FC<SyncStatusIndicatorProps> = ({ lastSyncTime }) => {
  const [syncState, setSyncState] = useState<SyncState>('synced');
  const initialMount = React.useRef(true);

  useEffect(() => {
    // Don't run the effect on the initial render
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }

    setSyncState('syncing');

    const timer = setTimeout(() => {
      setSyncState('synced');
    }, 1500); // Show syncing state for 1.5 seconds

    return () => clearTimeout(timer); // Cleanup timeout on unmount or if sync time changes again
  }, [lastSyncTime]);

  if (syncState === 'syncing') {
    return (
      <div className="flex items-center space-x-2" title="Syncing data across tabs...">
        <SpinnerIcon className="w-4 h-4 text-blue-500" />
        <span className="text-xs text-blue-500 dark:text-blue-400 hidden lg:inline">Syncing...</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2" title="Real-time sync active across browser tabs">
      <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse-green"></div>
      <span className="text-xs text-gray-500 dark:text-gray-400 hidden lg:inline">Synced</span>
    </div>
  );
};