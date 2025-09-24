import React, { useState } from 'react';
import type { Document, User } from '../types';
import { DocumentCard } from './DocumentCard';
import { ChevronDownIcon } from './icons/ChevronDownIcon';

interface DisciplineAccordionProps {
    disciplineName: string;
    documents: Document[];
    onSelectDocument: (docId: string) => void;
    Icon: React.FC<React.SVGProps<SVGSVGElement>>;
    currentUser: User;
}

const INITIAL_VISIBLE_COUNT = 10;

export const DisciplineAccordion: React.FC<DisciplineAccordionProps> = ({ disciplineName, documents, onSelectDocument, Icon, currentUser }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [visibleCount, setVisibleCount] = useState(INITIAL_VISIBLE_COUNT);

    const visibleDocuments = documents.slice(0, visibleCount);
    const hasMore = documents.length > visibleCount;

    return (
        <div className="border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none"
                aria-expanded={isOpen}
            >
                <div className="flex items-center">
                    <Icon className="w-6 h-6 text-blue-500 dark:text-blue-400 mr-3" />
                    <h3 className="font-semibold text-lg text-gray-800 dark:text-gray-200">{disciplineName}</h3>
                    <span className="ml-3 px-3 py-1 text-xs font-medium rounded-full bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300">
                        {documents.length}
                    </span>
                </div>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            {isOpen && (
                <div className="bg-white dark:bg-gray-900">
                    <div className="p-4 space-y-4 border-t border-gray-200 dark:border-gray-700">
                        {visibleDocuments.map(doc => (
                            <DocumentCard
                                key={doc.id}
                                document={doc}
                                onSelect={() => onSelectDocument(doc.id)}
                                currentUser={currentUser}
                            />
                        ))}
                    </div>
                    {hasMore && (
                        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
                            <button
                                onClick={() => setVisibleCount(prev => prev + INITIAL_VISIBLE_COUNT)}
                                className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50"
                            >
                                Load More ({documents.length - visibleCount} remaining)
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
