import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { NewProjectData, User } from '../types';
import { ProjectIcon } from './icons/ProjectIcon';
import { UsersIcon } from './icons/UsersIcon';
import { SearchIcon } from './icons/SearchIcon';

interface AddProjectModalProps {
  onClose: () => void;
  onAddProject: (projectData: NewProjectData) => void;
  users: User[];
}

const AddProjectModal: React.FC<AddProjectModalProps> = ({ onClose, onAddProject, users }) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [projectCode, setProjectCode] = useState('');
  const [team, setTeam] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

  const filteredUsers = useMemo(() => {
    if (!searchTerm.trim()) {
      return users;
    }
    return users.filter(user =>
      user.name.toLowerCase().includes(searchTerm.toLowerCase().trim()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase().trim())
    );
  }, [users, searchTerm]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  const handleTeamChange = (email: string) => {
    setTeam(prev =>
      prev.includes(email) ? prev.filter(e => e !== email) : [...prev, email]
    );
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectCode.trim()) {
        alert('Project name and code are required.');
        return;
    };

    setIsLoading(true);
    
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 300));

    onAddProject({ name, description, projectCode, team });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-lg transform transition-all duration-300 scale-95 hover:scale-100">
        
        <form onSubmit={handleSubmit}>
            <div className="p-8">
                <div className="flex items-center mb-6">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/50 rounded-lg mr-4">
                        <ProjectIcon className="w-6 h-6 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Project</h2>
                </div>
              
              <div className="space-y-6">
                <div>
                    <label htmlFor="project-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Name</label>
                    <input
                        id="project-name"
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g., Project Phoenix"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="project-code" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Project Code *</label>
                    <input
                        id="project-code"
                        type="text"
                        value={projectCode}
                        onChange={(e) => setProjectCode(e.target.value.toUpperCase())}
                        placeholder="e.g., PNX-001 (Must be unique)"
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        required
                    />
                </div>
                 <div>
                    <label htmlFor="project-description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Description</label>
                    <textarea
                        id="project-description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Enter a brief description of the project..."
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                        rows={3}
                    />
                </div>
                <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        <UsersIcon className="w-4 h-4 mr-2" />
                        Assign Team Members
                    </label>
                    <div className="relative mb-2">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800"
                        />
                    </div>
                    <div className="p-2 border border-gray-300 dark:border-gray-600 rounded-md max-h-40 overflow-y-auto">
                        {filteredUsers.map(user => (
                            <label key={user.email} className="flex items-center p-2 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={team.includes(user.email)}
                                    onChange={() => handleTeamChange(user.email)}
                                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <img src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} className="w-6 h-6 rounded-full mx-2 object-cover" />
                                <span className="text-sm text-gray-900 dark:text-gray-200">{user.name}</span>
                            </label>
                        ))}
                    </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                {isLoading ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </form>
      </div>
    </div>
  );
};

export default AddProjectModal;
