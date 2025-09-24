

import React, { useState, useMemo } from 'react';
import type { Project, User } from '../types';
import { ProjectCard } from './ProjectCard';
import { GridIcon } from './icons/GridIcon';
import { ListIcon } from './icons/ListIcon';
import { SearchIcon } from './icons/SearchIcon';
import { PlusIcon } from './icons/PlusIcon';

interface ProjectsProps {
  projects: Project[];
  currentUser: User;
  onSelectProject: (projectCode: string) => void;
  onAddNewProject: () => void;
  onEditProject: (project: Project) => void;
  onDeleteProject: (projectCode: string) => void;
}

export const Projects: React.FC<ProjectsProps> = ({ projects, currentUser, onSelectProject, onAddNewProject, onEditProject, onDeleteProject }) => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProjects = useMemo(() => {
    if (!searchQuery.trim()) {
      return projects;
    }
    return projects.filter(proj =>
      proj.name.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
      proj.projectCode.toLowerCase().includes(searchQuery.toLowerCase().trim())
    );
  }, [projects, searchQuery]);

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="relative flex-grow w-full md:w-auto">
          <label htmlFor="search-projects" className="sr-only">Search Projects</label>
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <SearchIcon className="h-5 w-5 text-gray-400" aria-hidden="true" />
          </div>
          <input
            id="search-projects"
            type="text"
            placeholder="Search by project name or code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md leading-5 bg-gray-50 dark:bg-gray-800 text-gray-900 dark:text-gray-200 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
        </div>
        <div className="flex items-center gap-4">
          {currentUser.role === 'Admin' && (
            <button
              onClick={onAddNewProject}
              className="flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-lg shadow-md transition-transform transform hover:scale-105"
            >
              <PlusIcon className="w-5 h-5 mr-2" />
              New Project
            </button>
          )}
          <div className="flex items-center p-1 bg-gray-200 dark:bg-gray-700 rounded-lg">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="Grid View"
            >
              <GridIcon className="w-5 h-5" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white dark:bg-gray-800 shadow' : 'text-gray-500 dark:text-gray-400'}`}
              aria-label="List View"
            >
              <ListIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {filteredProjects.length > 0 ? (
        <div
          className={`transition-all duration-300 ${
            viewMode === 'grid'
              ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'
              : 'flex flex-col gap-4'
          }`}
        >
          {filteredProjects.map(project => (
            <ProjectCard
              key={project.id}
              project={project}
              viewMode={viewMode}
              canDelete={currentUser.role === 'Admin'}
              onSelect={() => onSelectProject(project.projectCode)}
              onEdit={() => onEditProject(project)}
              onDelete={() => onDeleteProject(project.projectCode)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Projects Found</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            {searchQuery ? `Your search for "${searchQuery}" did not match any projects.` : 'Create a new project to get started.'}
          </p>
        </div>
      )}
    </div>
  );
};
