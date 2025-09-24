import React, { useState } from 'react';
import { APP_NAME } from '../constants';
import { LogoIcon } from './icons/LogoIcon';
import { LoginView } from './Login';
import { RegisterView } from './RegisterView';
import type { User, Organization } from '../types';

interface AuthLayoutProps {
  onLogin: (organizationName: string, email: string, password: string) => { success: boolean; message: string };
  onRegister: (name: string, email: string, password: string, organizationName: string) => boolean;
  users: User[];
  organizations: Organization[];
  onFindOrganization: (organizationName: string) => Organization | undefined;
  onFindUserInOrg: (email: string, organizationId: string) => User | undefined;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ onLogin, onRegister, users, organizations, onFindOrganization, onFindUserInOrg }) => {
  const [isLoginView, setIsLoginView] = useState(true);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans md:grid md:grid-cols-2 lg:grid-cols-5">
      {/* Left Column - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative lg:col-span-2">
        <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-10" style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M 0 40 H 80 M 40 0 V 80' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3e%3ccircle cx='40' cy='40' r='3' fill='none' stroke='white' stroke-width='1.5'/%3e%3ccircle cx='0' cy='0' r='1.5' fill='white'/%3e%3ccircle cx='80' cy='0' r='1.5' fill='white'/%3e%3ccircle cx='0' cy='80' r='1.5' fill='white'/%3e%3ccircle cx='80' cy='80' r='1.5' fill='white'/%3e%3c/svg%3e")`}}></div>
        
        <div className="z-10">
          <div className="flex items-center">
            <LogoIcon className="w-10 h-10" />
            <span className="ml-3 text-3xl font-bold">{APP_NAME}</span>
          </div>
        </div>

        <div className="z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">Streamline Your Engineering Document Workflow.</h2>
          <p className="text-indigo-200">Manage approvals, track revisions, and collaborate with your team, all in one secure platform.</p>
        </div>
        
        <div className="z-10 text-sm text-indigo-300">
          &copy; {new Date().getFullYear()} {APP_NAME}. All Rights Reserved.
        </div>
      </div>

      {/* Right Column - Form */}
      <div className="flex flex-col items-center justify-center p-4 lg:col-span-3">
        <div className="w-full max-w-md">
            {/* Logo for mobile view */}
            <div className="md:hidden flex items-center justify-center mb-8">
                <LogoIcon className="w-10 h-10 text-gray-800 dark:text-white" />
                <h1 className="ml-4 text-3xl font-bold text-gray-800 dark:text-white">{APP_NAME}</h1>
            </div>
            
            {isLoginView ? (
              <LoginView 
                onLogin={onLogin} 
                onSwitchToRegister={() => setIsLoginView(false)} 
                onFindOrganization={onFindOrganization}
                onFindUserInOrg={onFindUserInOrg}
              />
            ) : (
              <RegisterView onRegister={onRegister} onSwitchToLogin={() => setIsLoginView(true)} />
            )}
        </div>
      </div>
    </div>
  );
};