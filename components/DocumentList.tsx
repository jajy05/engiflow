import React, { useState, useMemo, useEffect } from 'react';
import type { Document, DocumentDiscipline, User } from '../types';
import { DocumentCard } from './DocumentCard';
import { SearchIcon } from './icons/SearchIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { DOCUMENT_DISCIPLINES } from '../constants';
import { DisciplineAccordion } from './DisciplineAccordion';
import { DisciplineTile } from './DisciplineTile';

interface DocumentListProps {
  documents: Document[];
  onSelectDocument: (docId: string) => void;
  projectName?: string;
  onBackToProjects?: () => void;
  currentUser: User;
}

export const DocumentList: React.FC<DocumentListProps> = ({ documents, onSelectDocument, projectName, onBackToProjects, currentUser }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDiscipline, setSelectedDiscipline] = useState<DocumentDiscipline | null>(null);

  // When project context changes, reset local state
  useEffect(() => {
    setSelectedDiscipline(null);
    setSearchQuery('');
  }, [projectName]);


  const filteredDocuments = useMemo(() => {
    if (!searchQuery.trim()) {
      return documents;
    }
    return documents.filter(doc =>
      doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [documents, searchQuery]);

  const groupedDocuments = useMemo(() => {
    const groups = new Map<DocumentDiscipline, Document[]>();
    documents.forEach(doc => {
        const list = groups.get(doc.discipline) || [];
        list.push(doc);
        groups.set(doc.discipline, list);
    });
    return groups;
  }, [documents]);
  
  const selectedDisciplineInfo = useMemo(() => {
    if (!selectedDiscipline) return null;
    return DOCUMENT_DISCIPLINES.find(d => d.id === selectedDiscipline);
  }, [selectedDiscipline]);

  const hasDocuments = useMemo(() => documents.length > 0, [documents]);
  const isSearching = searchQuery.trim().length > 0;

  const renderContent = () => {
    if (!hasDocuments) {
      return (
        <div className="text-center py-12">
            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Documents Here</h2>
            <p className="text-gray-500 dark:text-gray-400 mt-2">
              Upload a new document to get started.
            </p>
        </div>
      );
    }
    
    if (isSearching) {
      return filteredDocuments.length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {filteredDocuments.map(doc => (
              <DocumentCard key={doc.id} document={doc} onSelect={() => onSelectDocument(doc.id)} currentUser={currentUser} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
              <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Search Results</h2>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                Your search for "{searchQuery}" did not match any documents.
              </p>
          </div>
        );
    }

    if (selectedDiscipline && selectedDisciplineInfo) {
      const docsInDiscipline = groupedDocuments.get(selectedDiscipline) || [];
      return (
        <DisciplineAccordion
            key={selectedDisciplineInfo.id}
            disciplineName={selectedDisciplineInfo.name}
            documents={docsInDiscipline}
            onSelectDocument={onSelectDocument}
            Icon={selectedDisciplineInfo.icon}
            currentUser={currentUser}
        />
      );
    }

    const disciplinesWithDocs = DOCUMENT_DISCIPLINES.filter(d => (groupedDocuments.get(d.id) || []).length > 0);

    if (disciplinesWithDocs.length === 0 && hasDocuments) {
       return (
          <div className="grid grid-cols-1 gap-4">
            {documents.map(doc => (
              <DocumentCard key={doc.id} document={doc} onSelect={() => onSelectDocument(doc.id)} currentUser={currentUser} />
            ))}
          </div>
       );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {disciplinesWithDocs.map(disciplineInfo => {
            const docsInDiscipline = groupedDocuments.get(disciplineInfo.id);
            if (docsInDiscipline && docsInDiscipline.length > 0) {
                return (
                    <DisciplineTile
                        key={disciplineInfo.id}
                        disciplineName={disciplineInfo.name}
                        documentCount={docsInDiscipline.length}
                        onClick={() => setSelectedDiscipline(disciplineInfo.id)}
                        Icon={disciplineInfo.icon}
                    />
                );
            }
            return null;
        })}
      </div>
    );
  };


  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md p-6">
      <div className="mb-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        {selectedDiscipline ? (
            <button
              onClick={() => setSelectedDiscipline(null)}
              className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
            >
              <ArrowLeftIcon className="w-4 h-4 mr-2" />
              Back to Disciplines
            </button>
        ) : projectName && onBackToProjects ? (
          <button
            onClick={onBackToProjects}
            className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
          >
            <ArrowLeftIcon className="w-4 h-4 mr-2" />
            Back to Projects
          </button>
        ) : (
          /* Placeholder to maintain layout */
          <div className="h-5 hidden md:block"></div>
        )}
        <div className="relative flex-grow md:max-w-md">
          <label htmlFor="search-documents" className="sr-only">Search Documents</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="search-documents"
            type="text"
            placeholder="Search documents by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
      </div>
      
      {renderContent()}
    </div>
  );
};