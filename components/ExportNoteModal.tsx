import React, { useState, useRef, useEffect } from 'react';
import type { Note } from '../types';
import { convertNoteContent } from '../services/geminiService';
import { DocxIcon } from './icons/DocxIcon';
import { PdfIcon } from './icons/PdfIcon';
import { MarkdownIcon } from './icons/MarkdownIcon';
import { TextIcon } from './icons/TextIcon';
import { SpinnerIcon } from './icons/SpinnerIcon';
import { ExportIcon } from './icons/ExportIcon';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface ExportNoteModalProps {
    note: Note;
    onClose: () => void;
}

const ExportOption: React.FC<{
    label: string;
    icon: React.ReactNode;
    onClick: () => void;
    isLoading: boolean;
}> = ({ label, icon, onClick, isLoading }) => (
    <button
        onClick={onClick}
        disabled={isLoading}
        className="flex items-center w-full p-4 rounded-lg bg-gray-50 dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-wait"
    >
        {isLoading ? (
            <SpinnerIcon className="w-6 h-6 mr-4 text-blue-500" />
        ) : (
            <div className="mr-4">{icon}</div>
        )}
        <span className="font-semibold text-gray-800 dark:text-gray-200">{label}</span>
    </button>
);

const ExportNoteModal: React.FC<ExportNoteModalProps> = ({ note, onClose }) => {
    const [loadingFormat, setLoadingFormat] = useState<string | null>(null);
    const modalRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    const getFilename = () => note.title.replace(/[^a-z0-9]/gi, '_').toLowerCase() || 'note';

    const downloadFile = (content: string, filename: string, mimeType: string) => {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };
    
    const handleExportWord = () => {
        setLoadingFormat('word');
        const filename = `${getFilename()}.doc`;
        const contentHtml = `
          <!DOCTYPE html><html><head><meta charset="UTF-8"><title>${note.title}</title></head>
          <body><h1>${note.title}</h1>${note.content}</body></html>`;
        downloadFile(contentHtml, filename, 'application/msword');
        setLoadingFormat(null);
        onClose();
    };

    const handleExportPdf = async () => {
        setLoadingFormat('pdf');
    
        // 1. Create a temporary, styled element for rendering
        const printableElement = document.createElement('div');
        printableElement.style.width = '210mm'; // A4 width
        printableElement.style.padding = '15mm';
        printableElement.style.boxSizing = 'border-box';
        printableElement.style.fontFamily = 'Arial, sans-serif';
        printableElement.style.fontSize = '12pt';
        printableElement.style.lineHeight = '1.6';
        printableElement.style.color = '#333333';
        printableElement.style.background = 'white';
        // Use innerHTML to parse and render the note's HTML content
        printableElement.innerHTML = `
            <h1 style="font-size: 24pt; color: #111111; border-bottom: 2px solid #eeeeee; padding-bottom: 10px; margin-bottom: 20px;">
                ${note.title}
            </h1>
            <div style="word-wrap: break-word;">
                ${note.content}
            </div>
        `;
    
        // Append to body off-screen to ensure it's rendered for html2canvas
        printableElement.style.position = 'absolute';
        printableElement.style.left = '-9999px';
        document.body.appendChild(printableElement);
    
        try {
            // 2. Use html2canvas to capture the rendered element
            const canvas = await html2canvas(printableElement, {
                scale: 2, // Higher scale improves quality
                useCORS: true,
                logging: false,
            });
    
            // 3. Use jsPDF to create the PDF and add the captured image
            const imgData = canvas.toDataURL('image/png');
            const pdf = new jsPDF({
                orientation: 'portrait',
                unit: 'mm',
                format: 'a4',
            });
    
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const imgProps = pdf.getImageProperties(imgData);
            const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
            
            let heightLeft = imgHeight;
            let position = 0;
    
            // Add the first page
            pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
            heightLeft -= pdf.internal.pageSize.getHeight();
    
            // Add subsequent pages if content is too long
            while (heightLeft > 0) {
                position = heightLeft - imgHeight;
                pdf.addPage();
                pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
                heightLeft -= pdf.internal.pageSize.getHeight();
            }
    
            pdf.save(`${getFilename()}.pdf`);
    
        } catch (error) {
            console.error("Failed to export as PDF:", error);
            alert("An error occurred while exporting to PDF.");
        } finally {
            // 4. Clean up by removing the temporary element
            document.body.removeChild(printableElement);
            setLoadingFormat(null);
            onClose();
        }
    };
    
    const handleExportMarkdown = async () => {
        setLoadingFormat('markdown');
        try {
            const markdownContent = await convertNoteContent(note.title, note.content, 'markdown');
            downloadFile(markdownContent, `${getFilename()}.md`, 'text/markdown;charset=utf-8');
        } catch (error) {
            console.error("Failed to export as Markdown:", error);
            alert("An error occurred while exporting to Markdown.");
        } finally {
            setLoadingFormat(null);
            if (!document.hidden) { // Check if tab is active before closing
                onClose();
            }
        }
    };
    
    const handleExportText = async () => {
        setLoadingFormat('text');
        try {
            const textContent = await convertNoteContent(note.title, note.content, 'plaintext');
            downloadFile(textContent, `${getFilename()}.txt`, 'text/plain;charset=utf-8');
        } catch (error) {
            console.error("Failed to export as Text:", error);
            alert("An error occurred while exporting to plain text.");
        } finally {
            setLoadingFormat(null);
             if (!document.hidden) {
                onClose();
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
            <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300 scale-95 hover:scale-100">
                <div className="p-8">
                    <div className="flex items-center mb-6">
                        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                            <ExportIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 dark:text-white">Export Note</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs" title={note.title}>{note.title}</p>
                        </div>
                    </div>
                    
                    <div className="space-y-4">
                        <ExportOption label="Export as Word (.doc)" icon={<DocxIcon className="w-6 h-6" />} onClick={handleExportWord} isLoading={loadingFormat === 'word'} />
                        <ExportOption label="Export as PDF" icon={<PdfIcon className="w-6 h-6" />} onClick={handleExportPdf} isLoading={loadingFormat === 'pdf'} />
                        <ExportOption label="Export as Markdown (.md)" icon={<MarkdownIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />} onClick={handleExportMarkdown} isLoading={loadingFormat === 'markdown'} />
                        <ExportOption label="Export as Plain Text (.txt)" icon={<TextIcon className="w-6 h-6 text-gray-600 dark:text-gray-300" />} onClick={handleExportText} isLoading={loadingFormat === 'text'} />
                    </div>
                </div>
                <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 flex justify-end rounded-b-2xl">
                    <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ExportNoteModal;