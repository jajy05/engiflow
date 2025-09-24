import React from 'react';
import { PdfIcon } from './icons/PdfIcon';
import { DocxIcon } from './icons/DocxIcon';
import { XlsxIcon } from './icons/XlsxIcon';
import { DwgIcon } from './icons/DwgIcon';
import { FileIcon } from './icons/FileIcon';
import { ImageIcon } from './icons/ImageIcon';

interface InlineFileViewerProps {
  documentType: string;
  documentName: string;
  fileUrl?: string;
}

export const InlineFileViewer: React.FC<InlineFileViewerProps> = ({ documentType, documentName, fileUrl }) => {
  const renderPreview = () => {
    const type = documentType.toUpperCase();
    const clickableWrapperClasses = "block cursor-pointer transition-transform transform hover:scale-[1.01] focus:outline-none focus:ring-4 focus:ring-blue-500/50 rounded-lg";

    const pdfUrl = fileUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf";
    const imageUrl = fileUrl || `https://source.unsplash.com/random/1200x800?sig=${encodeURIComponent(documentName)}`;

    switch (type) {
      case 'PDF':
        return (
          <a
            href={pdfUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clickableWrapperClasses}
            aria-label={`Open ${documentName} in a new tab`}
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-200 dark:bg-gray-700 rounded-lg">
              <PdfIcon className="w-24 h-24 mb-4" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">PDF Preview</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Click to open in a new tab.</p>
            </div>
          </a>
        );
      case 'PNG':
      case 'JPG':
      case 'JPEG':
      case 'GIF':
        return (
          <a
            href={imageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={clickableWrapperClasses}
            aria-label={`Open ${documentName} in a new tab`}
          >
            <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-200 dark:bg-gray-700 rounded-lg overflow-hidden">
              <ImageIcon className="w-16 h-16 mb-4 text-gray-500" />
              <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">Image Preview</h3>
              <p className="text-gray-600 dark:text-gray-400 mt-2">Click to open full image in a new tab.</p>
              <div className="mt-4 w-full aspect-video flex items-center justify-center">
                <img
                  src={imageUrl}
                  alt={`Preview of ${documentName}`}
                  className="rounded-lg shadow-md max-h-full max-w-full object-contain"
                />
              </div>
            </div>
          </a>
        );
      default:
        let IconComponent;
        switch (type) {
          case 'DOCX': IconComponent = DocxIcon; break;
          case 'XLSX': IconComponent = XlsxIcon; break;
          case 'DWG': IconComponent = DwgIcon; break;
          default: IconComponent = FileIcon;
        }
        return (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <IconComponent className="w-24 h-24 mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 dark:text-gray-200">No Preview Available</h3>
            <p className="text-gray-600 dark:text-gray-400 mt-2">A live preview for <strong>.{type.toLowerCase()}</strong> files is not supported.</p>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg w-full h-full min-h-[calc(100vh-10rem)] flex flex-col justify-center">
      {renderPreview()}
    </div>
  );
};