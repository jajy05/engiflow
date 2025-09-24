import React from 'react';

interface DisciplineTileProps {
  disciplineName: string;
  documentCount: number;
  onClick: () => void;
  Icon: React.FC<React.SVGProps<SVGSVGElement>>;
}

export const DisciplineTile: React.FC<DisciplineTileProps> = ({ disciplineName, documentCount, onClick, Icon }) => {
  return (
    <div
      onClick={onClick}
      className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col items-center text-center"
      role="button"
      tabIndex={0}
      onKeyPress={(e) => (e.key === 'Enter' || e.key === ' ') && onClick()}
      aria-label={`View documents for ${disciplineName}`}
    >
      <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-full mb-4">
        <Icon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
      </div>
      <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate max-w-full">{disciplineName}</h3>
      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
        {documentCount} {documentCount === 1 ? 'Document' : 'Documents'}
      </p>
    </div>
  );
};