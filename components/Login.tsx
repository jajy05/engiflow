import React, { useState } from 'react';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import type { User, Organization } from '../types';
import { BuildingOfficeIcon } from './icons/BuildingOfficeIcon';
import { AtSymbolIcon } from './icons/AtSymbolIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';

interface LoginViewProps {
  onLogin: (organizationName: string, email: string, password: string) => { success: boolean; message: string };
  onSwitchToRegister: () => void;
  onFindOrganization: (organizationName: string) => Organization | undefined;
  onFindUserInOrg: (email: string, organizationId: string) => User | undefined;
}

type LoginStep = 'organization' | 'email' | 'password';

export const LoginView: React.FC<LoginViewProps> = ({ onLogin, onSwitchToRegister, onFindOrganization, onFindUserInOrg }) => {
  const [step, setStep] = useState<LoginStep>('organization');
  const [organizationName, setOrganizationName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState<{ text: string; type: 'error' | 'info' } | null>(null);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [validatedOrg, setValidatedOrg] = useState<Organization | null>(null);
  const [validatedUser, setValidatedUser] = useState<User | null>(null);

  const handleOrgSubmit = () => {
    setIsLoading(true);
    setMessage(null);
    const org = onFindOrganization(organizationName);
    if (org) {
      setValidatedOrg(org);
      setStep('email');
    } else {
      setMessage({ text: 'Organization not found. Please check the name or register a new organization.', type: 'error' });
    }
    setIsLoading(false);
  };

  const handleEmailSubmit = () => {
    if (!validatedOrg) return;
    setIsLoading(true);
    setMessage(null);
    const user = onFindUserInOrg(email, validatedOrg.id);
    if (user) {
      setValidatedUser(user);
      setStep('password');
    } else {
      setMessage({ text: 'This email is not registered with your organization.', type: 'error' });
    }
    setIsLoading(false);
  };

  const handlePasswordSubmit = () => {
    if (!validatedOrg || !validatedUser) return;
    setIsLoading(true);
    setMessage(null);

    const loginPassword = validatedUser.status === 'active' ? password : '';
    const result = onLogin(validatedOrg.name, validatedUser.email, loginPassword);

    if (!result.success) {
      setMessage({ text: result.message, type: 'error' });
    }
    setIsLoading(false);
  };

  const handleBack = () => {
    setMessage(null);
    if (step === 'email') {
      setValidatedOrg(null);
      setStep('organization');
    }
    if (step === 'password') {
      setValidatedUser(null);
      setPassword('');
      setStep('email');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    switch (step) {
      case 'organization': handleOrgSubmit(); break;
      case 'email': handleEmailSubmit(); break;
      case 'password': handlePasswordSubmit(); break;
    }
  };
  
  const getHeaderText = () => {
    switch (step) {
      case 'organization': return { title: 'Welcome!', subtitle: 'Sign in to your organization' };
      case 'email': return { title: 'Enter Your Email', subtitle: `Signing in to ${validatedOrg?.name}` };
      case 'password':
        if (validatedUser?.status === 'pending') return { title: 'Welcome!', subtitle: 'Let\'s set up your account' };
        return { title: `Welcome back, ${validatedUser?.name}!`, subtitle: 'Enter your password to continue' };
      default: return { title: '', subtitle: ''};
    }
  };

  const getButtonText = () => {
    if (isLoading) return "Loading...";
    switch (step) {
      case 'organization': return "Continue";
      case 'email': return "Continue";
      case 'password':
        return validatedUser?.status === 'pending' ? 'Set Up Account' : 'Sign in';
      default: return "Continue";
    }
  };

  const { title, subtitle } = getHeaderText();

  return (
    <div className="w-full max-w-md p-8 space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-fade-in-up">
        <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 dark:text-white">{title}</h2>
            <p className="mt-2 text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {step !== 'organization' && (
            <button type="button" onClick={handleBack} className="flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline mb-4">
              <ArrowLeftIcon className="w-4 h-4 mr-1" />
              Back
            </button>
          )}

          <div className="rounded-md shadow-sm space-y-4">
            <div className={`relative ${step !== 'organization' ? 'opacity-50' : ''}`}>
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <BuildingOfficeIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="organization-name"
                name="organization"
                type="text"
                autoComplete="organization"
                required
                className="appearance-none relative block w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                placeholder="Organization Name"
                value={organizationName}
                onChange={(e) => setOrganizationName(e.target.value)}
                readOnly={step !== 'organization'}
              />
            </div>

            {step !== 'organization' && (
              <div className={`relative animate-fade-in-up ${step !== 'email' ? 'opacity-50' : ''}`}>
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <AtSymbolIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email-address"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className="appearance-none relative block w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  readOnly={step !== 'email'}
                />
              </div>
            )}
            
            {step === 'password' && validatedUser?.status === 'active' && (
              <div className="relative animate-fade-in-up">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <LockClosedIcon className="h-5 w-5 text-gray-400" />
                </div>
                <input
                    id="password-sr"
                    name="password"
                    type={isPasswordVisible ? 'text' : 'password'}
                    autoComplete="current-password"
                    required
                    className="appearance-none relative block w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoFocus
                />
                <button
                    type="button"
                    className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                    aria-label={isPasswordVisible ? 'Hide password' : 'Show password'}
                >
                    {isPasswordVisible ? <EyeSlashIcon className="h-5 w-5" /> : <EyeIcon className="h-5 w-5" />}
                </button>
              </div>
            )}
          </div>
          
          {step === 'password' && validatedUser?.status === 'active' && (
            <div className="flex items-center justify-end">
              <div className="text-sm">
                <button type="button" onClick={() => setMessage({ text: 'Password reset functionality is not yet implemented.', type: 'info' })} className="font-medium text-blue-600 hover:text-blue-500">
                  Forgot your password?
                </button>
              </div>
            </div>
          )}

          {message && (
            <div className={`p-3 rounded-md flex items-center text-sm ${
                message.type === 'error' 
                ? 'bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300' 
                : 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
            }`}>
                <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                <span>{message.text}</span>
            </div>
          )}

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {getButtonText()}
            </button>
          </div>
        </form>
         <p className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            Don't have an account?{' '}
            <button onClick={onSwitchToRegister} className="font-medium text-blue-600 hover:text-blue-500">
                Sign up
            </button>
        </p>
    </div>
  );
};