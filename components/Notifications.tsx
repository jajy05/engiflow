
import React, { useState, useRef, useEffect } from 'react';
import type { Notification } from '../types';
import { BellIcon } from './icons/BellIcon';
import { DocumentIcon } from './icons/DocumentIcon';

interface NotificationsProps {
  notifications: Notification[];
  onViewDocument: (docId: string) => void;
  onMarkAsRead: (notificationId: string) => void;
  onMarkAllAsRead: () => void;
}

const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const past = new Date(timestamp);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);

  if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  return `${diffInDays}d ago`;
};

export const Notifications: React.FC<NotificationsProps> = ({ notifications, onViewDocument, onMarkAsRead, onMarkAllAsRead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.isRead).length;
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.isRead) {
        onMarkAsRead(notification.id);
    }
    onViewDocument(notification.documentId);
    setIsOpen(false);
  };

  const handleMarkAllReadClick = () => {
    onMarkAllAsRead();
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        className="relative p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 hover:text-gray-900 dark:hover:text-white"
        aria-label="View notifications"
      >
        <BellIcon className="w-6 h-6" />
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center ring-2 ring-white dark:ring-gray-900">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 md:w-96 bg-white dark:bg-gray-900 rounded-lg shadow-2xl border dark:border-gray-700 z-50">
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700">
            <h3 className="font-semibold text-lg text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <button onClick={handleMarkAllReadClick} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                Mark all as read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map(notification => (
                <div
                  key={notification.id}
                  onClick={() => handleNotificationClick(notification)}
                  className={`flex items-start p-4 cursor-pointer transition-colors ${!notification.isRead ? 'bg-blue-50 dark:bg-blue-900/30' : ''} hover:bg-gray-100 dark:hover:bg-gray-800 border-b dark:border-gray-200 dark:border-gray-800`}
                >
                  {!notification.isRead && (
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-2 mr-3 flex-shrink-0"></div>
                  )}
                  <div className={`flex-shrink-0 mr-3 ${notification.isRead ? 'ml-5' : ''}`}>
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                       <DocumentIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-800 dark:text-gray-200">{notification.message}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{formatTimeAgo(notification.timestamp)}</p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center text-gray-500 dark:text-gray-400 p-8">
                <BellIcon className="w-12 h-12 mx-auto mb-2 text-gray-300 dark:text-gray-600" />
                <p>You have no notifications.</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
