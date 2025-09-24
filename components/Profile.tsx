import React, { useState, useEffect } from 'react';
import type { User } from '../types';
import { UserIcon } from './icons/UserIcon';
import { MailIcon } from './icons/MailIcon';
import { CameraIcon } from './icons/CameraIcon';

interface ProfileProps {
  currentUser: User;
  onUpdateUser: (updatedUser: User) => void;
}

export const Profile: React.FC<ProfileProps> = ({ currentUser, onUpdateUser }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(currentUser.name);
  const [email, setEmail] = useState(currentUser.email);
  const [photoUrl, setPhotoUrl] = useState(currentUser.photoUrl || '');

  useEffect(() => {
    setName(currentUser.name);
    setEmail(currentUser.email);
    setPhotoUrl(currentUser.photoUrl || '');
  }, [currentUser, isEditing]);

  const handleSave = () => {
    onUpdateUser({ ...currentUser, name, email, photoUrl });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg shadow-md max-w-2xl mx-auto">
      <div className="p-8">
        <div className="flex flex-col items-center mb-6">
           <img 
            src={photoUrl || `https://i.pravatar.cc/150?u=${currentUser.email}`}
            onError={(e) => { e.currentTarget.src = `https://i.pravatar.cc/150?u=${currentUser.email}` }}
            alt="Profile"
            className="w-24 h-24 rounded-full object-cover mb-4 ring-4 ring-blue-500/50 dark:ring-blue-400/50"
          />
           {!isEditing && (
             <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{currentUser.name}</h2>
                <p className="text-sm text-gray-500 dark:text-gray-400">{currentUser.email}</p>
             </>
           )}
        </div>

        <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">User Information</h2>
            {!isEditing && (
                 <button 
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700"
                >
                    Edit Profile
                </button>
            )}
        </div>
       
        <div className="space-y-6 border-t dark:border-gray-700 pt-6">
            <div>
                <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <UserIcon className="w-4 h-4 mr-2" />
                    Full Name
                </label>
                {isEditing ? (
                    <input 
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                ) : (
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{name}</p>
                )}
            </div>
             <div>
                <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                    <MailIcon className="w-4 h-4 mr-2" />
                    Email Address
                </label>
                {isEditing ? (
                    <input 
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                ) : (
                    <p className="text-lg font-semibold text-gray-900 dark:text-white">{email}</p>
                )}
            </div>
            {isEditing && (
              <div>
                  <label className="flex items-center text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">
                      <CameraIcon className="w-4 h-4 mr-2" />
                      Photo URL
                  </label>
                  <input 
                      type="text"
                      value={photoUrl}
                      onChange={(e) => setPhotoUrl(e.target.value)}
                      placeholder="https://example.com/photo.jpg"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  />
              </div>
            )}
        </div>

        {isEditing && (
            <div className="mt-8 pt-6 border-t dark:border-gray-700 flex justify-end space-x-3">
                <button 
                    onClick={handleCancel}
                    className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700"
                >
                    Cancel
                </button>
                <button 
                    onClick={handleSave}
                    className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700"
                >
                    Save Changes
                </button>
            </div>
        )}
      </div>
    </div>
  );
};