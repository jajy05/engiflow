

import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { Note } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { NoteIcon } from './icons/NoteIcon';
import { BoldIcon } from './icons/BoldIcon';
import { ItalicIcon } from './icons/ItalicIcon';
import { ListBulletIcon } from './icons/ListBulletIcon';
import { ListNumberIcon } from './icons/ListNumberIcon';
import { ExportIcon } from './icons/ExportIcon';
import ExportNoteModal from './ExportNoteModal';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

const EditorToolbar: React.FC<{ onFormat: (command: string) => void }> = ({ onFormat }) => {
    const commands = [
        { command: 'bold', icon: BoldIcon, label: 'Bold' },
        { command: 'italic', icon: ItalicIcon, label: 'Italic' },
        { command: 'insertUnorderedList', icon: ListBulletIcon, label: 'Bulleted List' },
        { command: 'insertOrderedList', icon: ListNumberIcon, label: 'Numbered List' },
    ];

    return (
        <div className="flex items-center space-x-1 p-2 border-b dark:border-gray-700">
            {commands.map(({ command, icon: Icon, label }) => (
                <button
                    key={command}
                    onClick={() => onFormat(command)}
                    className="p-2 rounded-md text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700"
                    aria-label={label}
                    title={label}
                >
                    <Icon className="w-5 h-5" />
                </button>
            ))}
        </div>
    );
};

interface NotesViewProps {
    notes: Note[];
    onAddNote: () => string; // Returns the new note's ID
    onUpdateNote: (noteId: string, title: string, content: string) => void;
    onDeleteNote: (noteId: string) => void;
}

export const NotesView: React.FC<NotesViewProps> = ({ notes, onAddNote, onUpdateNote, onDeleteNote }) => {
    const [selectedNoteId, setSelectedNoteId] = useState<string | null>(null);
    const editorRef = useRef<HTMLDivElement>(null);
    const titleInputRef = useRef<HTMLInputElement>(null);
    const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isExportModalOpen, setIsExportModalOpen] = useState(false);
    const [lastCreatedNoteId, setLastCreatedNoteId] = useState<string | null>(null);

    const sortedNotes = useMemo(() => {
        return [...notes].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    }, [notes]);

    const selectedNote = useMemo(() => {
        return notes.find(n => n.id === selectedNoteId) || null;
    }, [notes, selectedNoteId]);
    
    // Editor state
    const [activeTitle, setActiveTitle] = useState('');
    const [activeContent, setActiveContent] = useState('');

    // Effect to populate editor when a note is selected
    useEffect(() => {
        if (selectedNote) {
            setActiveTitle(selectedNote.title);
            setActiveContent(selectedNote.content);
             if (editorRef.current && editorRef.current.innerHTML !== selectedNote.content) {
                editorRef.current.innerHTML = selectedNote.content;
            }
            // If this is a newly created note, focus and select the title
            if (selectedNote.id === lastCreatedNoteId) {
                titleInputRef.current?.focus();
                titleInputRef.current?.select();
                setLastCreatedNoteId(null); // Reset after focus
            }
        } else {
            setActiveTitle('');
            setActiveContent('');
            if (editorRef.current) {
                editorRef.current.innerHTML = '';
            }
        }
        
        // When note changes, cancel any pending save
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }
        setIsSaving(false);
    }, [selectedNote, lastCreatedNoteId]);

    // Effect for auto-saving note content
    useEffect(() => {
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current);
        }

        const hasChanges = selectedNote && (activeTitle !== selectedNote.title || activeContent !== selectedNote.content);

        if (hasChanges) {
            setIsSaving(true);
            saveTimeoutRef.current = setTimeout(() => {
                if (selectedNote) {
                    onUpdateNote(selectedNote.id, activeTitle, activeContent);
                }
                // isSaving will be set to false on re-render when selectedNote is updated via props
            }, 2000); // 2-second delay
        } else {
            setIsSaving(false);
        }

        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current);
            }
        };
    }, [activeTitle, activeContent, selectedNote, onUpdateNote]);

    const handleCreateNote = () => {
        const newNoteId = onAddNote();
        setLastCreatedNoteId(newNoteId); // Mark this ID as newly created
        setSelectedNoteId(newNoteId);
    };

    const handleDelete = (e: React.MouseEvent, noteId: string) => {
        e.stopPropagation();
        if (window.confirm('Are you sure you want to delete this note?')) {
            onDeleteNote(noteId);
            if (selectedNoteId === noteId) {
                setSelectedNoteId(null);
            }
        }
    };

    const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
        setActiveContent(e.currentTarget.innerHTML);
    };

    const handleFormat = (command: string) => {
        document.execCommand(command, false, undefined);
        editorRef.current?.focus();
        // Manually trigger input event to update state after formatting
        if (editorRef.current) {
            const event = new Event('input', { bubbles: true, cancelable: true });
            editorRef.current.dispatchEvent(event);
        }
    };
    
    const getPlainText = (html: string) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = html;
        return tempDiv.textContent || tempDiv.innerText || "";
    }


    return (
        <div className="flex flex-row gap-6 h-full">
            {/* Notes List */}
            <div className={`${selectedNoteId ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-1/3 lg:w-1/4 bg-white dark:bg-gray-900 rounded-lg shadow-md p-4`}>
                <button
                    onClick={handleCreateNote}
                    className="w-full flex items-center justify-center bg-blue-600 text-white px-4 py-2 mb-4 rounded-lg hover:bg-blue-700 transition"
                >
                    <PlusIcon className="w-5 h-5 mr-2" />
                    <span>New Note</span>
                </button>
                <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                    {sortedNotes.map(note => {
                        const plainTextContent = getPlainText(note.content);
                        const preview = plainTextContent.substring(0, 50) + (plainTextContent.length > 50 ? '...' : '');

                        return (
                             <div
                                key={note.id}
                                onClick={() => setSelectedNoteId(note.id)}
                                className={`p-3 rounded-lg cursor-pointer transition-colors group ${selectedNoteId === note.id ? 'bg-blue-100 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800'}`}
                            >
                                <div className="flex justify-between items-start">
                                    <h3 className="font-semibold text-gray-800 dark:text-gray-200 truncate pr-2">{note.title}</h3>
                                    <button
                                        onClick={(e) => handleDelete(e, note.id)}
                                        className="p-1 rounded-full text-gray-400 hover:text-red-500 hover:bg-red-100 dark:hover:bg-red-900/50 opacity-0 group-hover:opacity-100 transition-opacity"
                                        aria-label="Delete note"
                                    >
                                        <TrashIcon className="w-4 h-4" />
                                    </button>
                                </div>
                                <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                    {preview || 'No content'}
                                </p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                                    {new Date(note.updatedAt).toLocaleDateString()}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Editor */}
            <div className={`${selectedNoteId ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white dark:bg-gray-900 rounded-lg shadow-md`}>
                {selectedNote ? (
                    <div className="flex flex-col h-full">
                        <div className="md:hidden flex items-center p-2 border-b dark:border-gray-700">
                            <button onClick={() => setSelectedNoteId(null)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                                <ArrowLeftIcon className="w-5 h-5" />
                            </button>
                            <span className="ml-2 font-semibold text-sm">Back to Notes</span>
                        </div>
                         <div className="p-6 pb-2">
                            <input
                                ref={titleInputRef}
                                type="text"
                                value={activeTitle}
                                onChange={(e) => setActiveTitle(e.target.value)}
                                placeholder="Note Title"
                                className="w-full text-2xl font-bold bg-transparent border-none focus:ring-0 p-0 mb-4 text-gray-900 dark:text-white"
                            />
                        </div>
                        <EditorToolbar onFormat={handleFormat} />
                        <div
                            ref={editorRef}
                            contentEditable
                            onInput={handleContentChange}
                            className="w-full flex-1 bg-transparent focus:outline-none p-6 pt-4 resize-none text-gray-700 dark:text-gray-300 leading-relaxed overflow-y-auto"
                        />
                         <div className="mt-auto border-t dark:border-gray-700 p-2 px-6 flex justify-between items-center">
                            <button
                                onClick={() => setIsExportModalOpen(true)}
                                className="flex items-center space-x-2 px-3 py-1.5 border border-gray-300 dark:border-gray-600 rounded-md text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                            >
                                <ExportIcon className="w-4 h-4" />
                                <span>Export</span>
                            </button>
                           <div className="text-right text-xs text-gray-400 dark:text-gray-500 flex items-center space-x-2">
                               {isSaving ? (
                                   <span className="italic">Saving...</span>
                               ) : (
                                   <span className="italic text-gray-400 dark:text-gray-500">Saved</span>
                               )}
                               <span>Last updated: {new Date(selectedNote.updatedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-6">
                        <NoteIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
                        <h2 className="text-xl font-semibold">Select a note or create a new one</h2>
                        <p className="mt-2">Your notes will be saved automatically.</p>
                    </div>
                )}
            </div>
             {isExportModalOpen && selectedNote && (
                <ExportNoteModal
                    note={selectedNote}
                    onClose={() => setIsExportModalOpen(false)}
                />
            )}
        </div>
    );
};