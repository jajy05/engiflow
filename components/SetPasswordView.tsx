import React, { useState } from 'react';
import type { User } from '../types';
import { LogoIcon } from './icons/LogoIcon';
import { APP_NAME } from '../constants';
import { PasswordStrengthMeter } from './PasswordStrengthMeter';
import { EyeIcon } from './icons/EyeIcon';
import { EyeSlashIcon } from './icons/EyeSlashIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { ExclamationCircleIcon } from './icons/ExclamationCircleIcon';

interface SetPasswordViewProps {
  onSetPassword: (password: string) => void;
  currentUser: User;
}

export const SetPasswordView: React.FC<SetPasswordViewProps> = ({ onSetPassword, currentUser }) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password.length < 8) {
        setError('Password must be at least 8 characters long.');
        return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    onSetPassword(password);
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 font-sans md:grid md:grid-cols-2 lg:grid-cols-5">
      {/* Left Column - Branding */}
      <div className="hidden md:flex flex-col justify-between p-12 bg-gradient-to-br from-blue-700 to-indigo-900 text-white relative lg:col-span-2">
         <div className="absolute top-0 left-0 w-full h-full bg-repeat opacity-20" style={{backgroundImage: `url("data:image/svg+xml,%3csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M 0 40 H 80 M 40 0 V 80' stroke='white' stroke-width='1.5' stroke-linecap='round'/%3e%3ccircle cx='40' cy='40' r='3' fill='none' stroke='white' stroke-width='1.5'/%3e%3ccircle cx='0' cy='0' r='1.5' fill='white'/%3e%3ccircle cx='80' cy='0' r='1.5' fill='white'/%3e%3ccircle cx='0' cy='80' r='1.5' fill='white'/%3e%3ccircle cx='80' cy='80' r='1.5' fill='white'/%3e%3c/svg%3e")`}}></div>
        <div className="z-10">
          <div className="flex items-center">
            <LogoIcon className="w-10 h-10" />
            <span className="ml-3 text-3xl font-bold">{APP_NAME}</span>
          </div>
        </div>
        <div className="z-10">
          <h2 className="text-4xl font-bold leading-tight mb-4">One Last Step to Secure Your Account.</h2>
          <p className="text-indigo-200">Create a strong password to protect your work and start collaborating.</p>
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
            
            <div className="w-full p-8 space-y-8 bg-white dark:bg-gray-900 rounded-2xl shadow-xl animate-fade-in-up">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Welcome, {currentUser.name}!</h2>
                    <p className="mt-2 text-gray-500 dark:text-gray-400">Please set a password to activate your account.</p>
                </div>
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                  <div className="rounded-md shadow-sm space-y-4">
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <label htmlFor="password-set" className="sr-only">New Password</label>
                      <input
                        id="password-set"
                        name="password"
                        type={isPasswordVisible ? 'text' : 'password'}
                        autoComplete="new-password"
                        required
                        className="appearance-none relative block w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                        placeholder="New Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
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
                    <PasswordStrengthMeter password={password} />
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <LockClosedIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <label htmlFor="confirm-password-set" className="sr-only">Confirm Password</label>
                      <input
                        id="confirm-password-set"
                        name="confirm-password"
                        type="password"
                        autoComplete="new-password"
                        required
                        className="appearance-none relative block w-full px-4 py-3 pl-10 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-gray-200 bg-gray-50 dark:bg-gray-800 rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 focus:z-10 sm:text-sm transition duration-200"
                        placeholder="Confirm Password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="p-3 rounded-md flex items-center text-sm bg-red-50 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                      <ExclamationCircleIcon className="w-5 h-5 mr-2 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  <div>
                    <button
                      type="submit"
                      className="group relative w-full flex justify-center py-3 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Set Password & Log In
                    </button>
                  </div>
                </form>
            </div>
        </div>
      </div>
    </div>
  );
};