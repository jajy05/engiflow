

import React, { useState, useRef, useEffect } from 'react';
import type { Project } from '../types';
import { ProjectIcon } from './icons/ProjectIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { EllipsisVerticalIcon } from './icons/EllipsisVerticalIcon';
import { PencilIcon } from './icons/PencilIcon';
import { TrashIcon } from './icons/TrashIcon';

interface ProjectCardProps {
  project: Project;
  viewMode: 'grid' | 'list';
  canDelete: boolean;
  onSelect: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export const ProjectCard: React.FC<ProjectCardProps> = ({ project, viewMode, canDelete, onSelect, onEdit, onDelete }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMenuToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsMenuOpen(prev => !prev);
  };
  
  const handleEdit = (e: React.MouseEvent) => {
    e.stopPropagation();
    onEdit();
    setIsMenuOpen(false);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete();
    setIsMenuOpen(false);
  };

  const Menu = () => (
     <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border dark:border-gray-700">
        <button onClick={handleEdit} className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
            <PencilIcon className="w-4 h-4 mr-3" /> Edit
        </button>
        {canDelete && (
          <button onClick={handleDelete} className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/50">
              <TrashIcon className="w-4 h-4 mr-3" /> Delete
          </button>
        )}
    </div>
  );

  const commonClasses = "border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 hover:shadow-lg hover:border-blue-500 dark:hover:border-blue-500 transition-all duration-300";
  const content = (
    <>
        <div className="flex-1 min-w-0" onClick={onSelect} >
            <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{project.name}</h3>
            <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">{project.projectCode}</p>
        </div>
        <div className="relative flex-shrink-0" ref={menuRef}>
            <button
                onClick={handleMenuToggle}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Project options"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && <Menu />}
        </div>
    </>
  );

  if (viewMode === 'list') {
    return (
      <div className={`${commonClasses} p-4 flex items-center justify-between`}>
        <div className="flex items-center cursor-pointer flex-1 min-w-0" onClick={onSelect}>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                <ProjectIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="flex-1 min-w-0">
                <h3 className="font-bold text-lg text-gray-900 dark:text-white truncate">{project.name}</h3>
                <p className="text-sm font-semibold text-blue-500 dark:text-blue-400">{project.projectCode}</p>
            </div>
        </div>
        <div className="flex-1 px-4 cursor-pointer hidden md:block" onClick={onSelect}>
             <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-md">{project.description}</p>
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400 flex items-center flex-shrink-0 ml-4 cursor-pointer hidden lg:flex" onClick={onSelect}>
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            <span>Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</span>
        </div>
         <div className="relative flex-shrink-0 ml-4" ref={menuRef}>
            <button
                onClick={handleMenuToggle}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
                aria-label="Project options"
            >
                <EllipsisVerticalIcon className="w-5 h-5" />
            </button>
            {isMenuOpen && <Menu />}
        </div>
      </div>
    );
  }

  return (
    <div className={`${commonClasses} p-6 flex flex-col`}>
      <div className="flex items-start justify-between mb-2">
        <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg cursor-pointer" onClick={onSelect}>
          <ProjectIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        {content}
      </div>
      <div className="cursor-pointer" onClick={onSelect}>
        <p className="text-sm text-gray-500 dark:text-gray-400 flex-grow mb-4 h-10 overflow-hidden">{project.description}</p>
        <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center border-t dark:border-gray-700 pt-3 mt-auto">
            <CalendarIcon className="w-4 h-4 mr-1.5" />
            <span>Last updated: {new Date(project.lastUpdated).toLocaleDateString()}</span>
        </div>
      </div>
    </div>
  );
};