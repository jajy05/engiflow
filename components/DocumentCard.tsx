import React from 'react';
import type { Document, DocumentStatus, User } from '../types';
import { FileIcon } from './icons/FileIcon';
import { UserIcon } from './icons/UserIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { PdfIcon } from './icons/PdfIcon';
import { DocxIcon } from './icons/DocxIcon';
import { XlsxIcon } from './icons/XlsxIcon';
import { DwgIcon } from './icons/DwgIcon';
import { SignatureIcon } from './icons/SignatureIcon';

interface DocumentCardProps {
  document: Document;
  onSelect: () => void;
  currentUser: User;
}

const statusStyles: { [key in DocumentStatus]: { bg: string; text: string; dot: string } } = {
  'Approved': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
  'Rejected': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-500' },
  'In Review': { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' },
  'In Progress': { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
  'Commented': { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
};

const getIconForFileType = (type: string) => {
  const iconProps = { className: "w-8 h-8 mr-4 flex-shrink-0" };
  switch (type.toUpperCase()) {
    case 'PDF':
      return <PdfIcon {...iconProps} />;
    case 'DOCX':
      return <DocxIcon {...iconProps} />;
    case 'XLSX':
      return <XlsxIcon {...iconProps} />;
    case 'DWG':
      return <DwgIcon {...iconProps} />;
    default:
      return <FileIcon {...iconProps} className="w-8 h-8 text-gray-500 mr-4 flex-shrink-0" />;
  }
};


export const DocumentCard: React.FC<DocumentCardProps> = ({ document, onSelect, currentUser }) => {
  const { bg, text, dot } = statusStyles[document.status];

  const hasUserSigned = document.history.some(
    entry => entry.userEmail === currentUser.email && entry.comment.startsWith('[E-signed]')
  );

  return (
    <div
      onClick={onSelect}
      className="flex flex-col md:flex-row items-center justify-between p-4 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-all duration-200"
    >
      <div className="flex items-center mb-4 md:mb-0 w-full md:w-auto">
        {getIconForFileType(document.type)}
        <div className="min-w-0">
          <div className="flex items-center">
            <h4 className="font-semibold text-gray-900 dark:text-white truncate" title={document.name}>{document.name}</h4>
            <span className="ml-2 px-2 py-0.5 text-xs font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                Rev {document.version}
            </span>
          </div>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1 space-x-4">
            <span className="flex items-center"><UserIcon className="w-4 h-4 mr-1"/>{document.uploadedBy.name}</span>
            <span className="flex items-center"><CalendarIcon className="w-4 h-4 mr-1"/>{new Date(document.uploadDate).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
      <div className="flex items-center mt-4 md:mt-0 space-x-2">
        {hasUserSigned && (
          <div title="You have signed this document" className="p-1.5 rounded-full bg-blue-100 dark:bg-blue-900/50">
              <SignatureIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
        )}
        <div className={`px-3 py-1 text-sm font-medium rounded-full flex items-center flex-shrink-0 ${bg} ${text}`}>
          <span className={`w-2 h-2 rounded-full mr-2 ${dot}`}></span>
          {document.status}
        </div>
      </div>
    </div>
  );
};