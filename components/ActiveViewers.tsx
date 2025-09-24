import React from 'react';
import type { User } from '../types';

interface ActiveViewersProps {
  users: User[];
}

export const ActiveViewers: React.FC<ActiveViewersProps> = ({ users }) => {
  // Ensure unique users, just in case
  const uniqueUsers = Array.from(new Map(users.map(u => [u.email, u])).values());

  return (
    <div className="flex items-center">
      <div className="flex -space-x-2 overflow-hidden">
        {uniqueUsers.slice(0, 5).map(user => (
          <img
            key={user.email}
            className="inline-block h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900"
            src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.email}`}
            alt={user.name}
            title={user.name}
          />
        ))}
      </div>
       {uniqueUsers.length > 5 && (
        <div className="h-8 w-8 rounded-full ring-2 ring-white dark:ring-gray-900 bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-semibold">
          +{uniqueUsers.length - 5}
        </div>
      )}
      <span className="ml-3 text-sm font-medium text-gray-600 dark:text-gray-400">
        {uniqueUsers.length} {uniqueUsers.length === 1 ? 'person' : 'people'} currently viewing
      </span>
    </div>
  );
};
