
import React, { useState, useRef, useEffect } from 'react';
import { LockIcon } from './icons/LockIcon';

interface ESignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  actionType: string;
}

const ESignModal: React.FC<ESignModalProps> = ({ isOpen, onClose, onConfirm, actionType }) => {
  const [password, setPassword] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);
  const passwordInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        passwordInputRef.current?.focus();
      }, 100);
    }
  }, [isOpen]);
  
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    onConfirm(password);
    setPassword('');
  };

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-md transform transition-all duration-300">
        <form onSubmit={handleSubmit}>
          <div className="p-8">
            <div className="text-center">
              <LockIcon className="w-12 h-12 text-blue-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">E-Signature Required</h2>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                To complete the action: <strong className="text-gray-800 dark:text-gray-200">{actionType}</strong>, please confirm your identity by entering your password.
              </p>
            </div>
            
            <div className="mt-8">
              <label htmlFor="esign-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Your Password
              </label>
              <input
                ref={passwordInputRef}
                id="esign-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
          <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300"
            >
              Confirm & Sign
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ESignModal;
