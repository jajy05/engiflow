import React from 'react';
import { SparklesIcon } from './icons/SparklesIcon';

interface CollaborationUpsellProps {
  featureName: string;
}

export const CollaborationUpsell: React.FC<CollaborationUpsellProps> = ({ featureName }) => {
  return (
    <div className="bg-gray-50 dark:bg-gray-800/50 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg p-6 text-center">
      <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/50 rounded-full flex items-center justify-center mx-auto mb-4">
        <SparklesIcon className="w-6 h-6 text-blue-500" />
      </div>
      <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
        Unlock the {featureName}
      </h4>
      <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
        Upgrade to the Pro plan for real-time collaboration with your team.
      </p>
      <button 
        className="mt-4 bg-blue-600 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
        onClick={() => alert('Upgrade functionality would be handled here.')}
      >
        Upgrade to Pro
      </button>
    </div>
  );
};
