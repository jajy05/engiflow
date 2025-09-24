import React, { useState, useEffect, useRef } from 'react';
import { NoteIcon } from './icons/NoteIcon';

interface CollaborativeScratchpadProps {
  documentId: string;
  content: string;
  onUpdate: (docId: string, content: string) => void;
}

export const CollaborativeScratchpad: React.FC<CollaborativeScratchpadProps> = ({ documentId, content, onUpdate }) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isSaving, setIsSaving] = useState(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Update the editor's content when the prop changes from an external source
  useEffect(() => {
    if (editorRef.current && content !== editorRef.current.innerHTML) {
      editorRef.current.innerHTML = content;
    }
  }, [content]);

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newContent = e.currentTarget.innerHTML;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    
    setIsSaving(true);

    saveTimeoutRef.current = setTimeout(() => {
      onUpdate(documentId, newContent);
      setIsSaving(false);
    }, 1000); // Auto-save after 1 second of inactivity
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md border dark:border-gray-700">
      <div className="p-4 border-b dark:border-gray-700 flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <NoteIcon className="w-5 h-5 mr-2 text-blue-500" />
          Collaborative Scratchpad
        </h3>
        <div className="text-xs text-gray-400 dark:text-gray-500 italic">
          {isSaving ? 'Saving...' : 'Saved'}
        </div>
      </div>
      <div
        ref={editorRef}
        contentEditable
        onInput={handleContentChange}
        className="w-full h-48 bg-transparent focus:outline-none p-4 resize-none text-gray-700 dark:text-gray-300 leading-relaxed overflow-y-auto relative empty:before:content-[attr(data-placeholder)] empty:before:absolute empty:before:inset-4 empty:before:text-gray-500 empty:before:pointer-events-none"
        data-placeholder="Type shared notes here..."
      />
    </div>
  );
};
