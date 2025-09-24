
import React from 'react';
import type { View, User } from '../types';
import { DashboardIcon } from './icons/DashboardIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { ProfileIcon } from './icons/ProfileIcon';
import { APP_NAME } from '../constants';
import { ProjectIcon } from './icons/ProjectIcon';
import { SearchIcon } from './icons/SearchIcon';
import { LogoIcon } from './icons/LogoIcon';
import { ThemeToggle } from './ThemeToggle';
import { CalendarIcon } from './icons/CalendarIcon';
import { NoteIcon } from './icons/NoteIcon';
import { ChatIcon } from './icons/ChatIcon';
import { XIcon } from './icons/XIcon';
import { SettingsIcon } from './icons/SettingsIcon';
import { LogoutIcon } from './icons/LogoutIcon';

interface SidebarProps {
  currentView: View;
  setView: (view: View) => void;
  theme: 'light' | 'dark';
  onToggleTheme: () => void;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  currentUser: User;
  organizationName: string;
  onLogout: () => void;
}

const NavItem: React.FC<{
  icon: React.ReactNode;
  label: string;
  isActive: boolean;
  onClick: () => void;
  isDanger?: boolean;
}> = ({ icon, label, isActive, onClick, isDanger = false }) => {
  return (
    <li
      onClick={onClick}
      className={`flex items-center p-3 my-1 rounded-lg cursor-pointer transition-all duration-200 ${
        isActive
          ? 'bg-blue-600 text-white shadow-lg'
          : isDanger
          ? 'text-red-500 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 hover:text-red-600 dark:hover:text-red-400'
          : 'text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white'
      }`}
    >
      {icon}
      <span className="ml-4 font-medium">{label}</span>
    </li>
  );
};


export const Sidebar: React.FC<SidebarProps> = ({ currentView, setView, theme, onToggleTheme, isOpen, setIsOpen, currentUser, organizationName, onLogout }) => {
  const handleViewChange = (view: View) => {
    setView(view);
    setIsOpen(false);
  };
  
  return (
    <aside className={`w-64 bg-white dark:bg-gray-900 shadow-md flex-shrink-0 flex flex-col justify-between fixed md:relative h-full z-40 transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
      <div>
        <div className="flex items-center justify-between h-20 border-b dark:border-gray-700 px-4">
          <div className="flex items-center">
            <LogoIcon className="w-8 h-8" />
            <span className="ml-3 text-2xl font-bold text-gray-800 dark:text-white">{APP_NAME}</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            <XIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="px-4 py-3 border-b dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Organization</p>
            <p className="text-md font-bold text-gray-800 dark:text-white mt-1 truncate">{organizationName}</p>
        </div>
        <nav className="p-4">
          <ul>
            <NavItem
              icon={<DashboardIcon className="w-6 h-6" />}
              label="Dashboard"
              isActive={currentView === 'dashboard'}
              onClick={() => handleViewChange('dashboard')}
            />
            <NavItem
              icon={<ProjectIcon className="w-6 h-6" />}
              label="Projects"
              isActive={currentView === 'projects'}
              onClick={() => handleViewChange('projects')}
            />
            <NavItem
              icon={<DocumentIcon className="w-6 h-6" />}
              label="All Documents"
              isActive={currentView === 'documents'}
              onClick={() => handleViewChange('documents')}
            />
             <NavItem
              icon={<SearchIcon className="w-6 h-6" />}
              label="Global Search"
              isActive={currentView === 'search'}
              onClick={() => handleViewChange('search')}
            />
             <NavItem
              icon={<CalendarIcon className="w-6 h-6" />}
              label="Calendar"
              isActive={currentView === 'calendar'}
              onClick={() => handleViewChange('calendar')}
            />
             <NavItem
              icon={<NoteIcon className="w-6 h-6" />}
              label="Notes"
              isActive={currentView === 'notes'}
              onClick={() => handleViewChange('notes')}
            />
             <NavItem
              icon={<ChatIcon className="w-6 h-6" />}
              label="Chat"
              isActive={currentView === 'chat'}
              onClick={() => handleViewChange('chat')}
            />
          </ul>
        </nav>
      </div>
       <div>
          <div className="p-4 border-t dark:border-gray-700">
            <ul>
              <NavItem
                icon={<ProfileIcon className="w-6 h-6" />}
                label="Profile"
                isActive={currentView === 'profile'}
                onClick={() => handleViewChange('profile')}
              />
              {currentUser.role === 'Admin' && (
                 <NavItem
                  icon={<SettingsIcon className="w-6 h-6" />}
                  label="Settings"
                  isActive={currentView === 'settings'}
                  onClick={() => handleViewChange('settings')}
                />
              )}
               <NavItem
                icon={<LogoutIcon className="w-6 h-6" />}
                label="Logout"
                isActive={false}
                onClick={onLogout}
                isDanger
              />
            </ul>
             <div className="mt-4 flex items-center justify-between">
              <span className="font-medium text-gray-500 dark:text-gray-400">Theme</span>
              <ThemeToggle theme={theme} onToggle={onToggleTheme} />
            </div>
        </div>
        <div className="p-4 border-t dark:border-gray-700 text-center text-xs text-gray-500 dark:text-gray-400">
          <p>Version 2.1.0 (Auth)</p>
          <p className="mt-1">&copy; {new Date().getFullYear()} EngiFlow</p>
        </div>
      </div>
    </aside>
  );
};
