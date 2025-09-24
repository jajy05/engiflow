import React, { useState, useMemo, useEffect, useRef } from 'react';
import type { User, ChatMessage } from '../types';
import { SendIcon } from './icons/SendIcon';
import { ChatIcon } from './icons/ChatIcon';
import { PhoneIcon } from './icons/PhoneIcon';
import { ArrowLeftIcon } from './icons/ArrowLeftIcon';
import { SearchIcon } from './icons/SearchIcon';

interface ChatViewProps {
  currentUser: User;
  users: User[]; // Now receives organization-filtered users
  messages: ChatMessage[]; // Now receives organization-filtered messages
  onSendMessage: (receiverEmail: string, text: string) => void;
  onInitiateCall: (user: User) => void;
}

const formatTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const ChatView: React.FC<ChatViewProps> = ({ currentUser, users, messages, onSendMessage, onInitiateCall }) => {
  const [selectedUserEmail, setSelectedUserEmail] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const chatEndRef = useRef<HTMLDivElement>(null);
  
  const otherUsers = useMemo(() => {
    return users.filter(user => user.email !== currentUser.email);
  }, [users, currentUser]);

  const filteredUsers = useMemo(() => {
    const trimmedSearch = searchTerm.toLowerCase().trim();
    if (!trimmedSearch) {
      return otherUsers;
    }
    return otherUsers.filter(user => 
        user.name.toLowerCase().includes(trimmedSearch) ||
        user.email.toLowerCase().includes(trimmedSearch)
    );
  }, [otherUsers, searchTerm]);

  const selectedUser = useMemo(() => {
    return users.find(user => user.email === selectedUserEmail);
  }, [users, selectedUserEmail]);
  
  const conversation = useMemo(() => {
    if (!selectedUserEmail) return [];
    return messages
      .filter(msg => 
        (msg.senderEmail === currentUser.email && msg.receiverEmail === selectedUserEmail) ||
        (msg.senderEmail === selectedUserEmail && msg.receiverEmail === currentUser.email)
      )
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }, [messages, currentUser.email, selectedUserEmail]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (newMessage.trim() && selectedUserEmail) {
      onSendMessage(selectedUserEmail, newMessage);
      setNewMessage('');
    }
  };

  return (
    <div className="flex h-full gap-6">
      {/* User List */}
      <aside className={`${selectedUserEmail ? 'hidden md:flex' : 'flex'} w-full md:w-1/3 lg:w-1/4 flex-col bg-white dark:bg-gray-900 rounded-lg shadow-md p-4`}>
        <div className="border-b dark:border-gray-700 pb-3 mb-4">
            <h2 className="text-xl font-bold">Team Members</h2>
            <div className="relative mt-2">
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
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 pr-2">
          {filteredUsers.map(user => (
            <div
              key={user.email}
              onClick={() => setSelectedUserEmail(user.email)}
              className={`flex items-center p-3 rounded-lg cursor-pointer transition-colors ${
                selectedUserEmail === user.email
                  ? 'bg-blue-100 dark:bg-blue-900/50'
                  : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <div className="relative mr-3">
                <img
                  src={user.photoUrl || `https://i.pravatar.cc/150?u=${user.email}`}
                  alt={user.name}
                  className="w-10 h-10 rounded-full"
                />
                <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${user.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} title={user.status === 'active' ? 'Active' : 'Pending Invitation'}></span>
              </div>
              <span className="font-semibold text-gray-800 dark:text-gray-200">{user.name}</span>
            </div>
          ))}
        </div>
      </aside>

      {/* Chat Panel */}
      <main className={`${selectedUserEmail ? 'flex' : 'hidden'} md:flex flex-1 flex-col bg-white dark:bg-gray-900 rounded-lg shadow-md`}>
        {selectedUser ? (
          <>
            <header className="flex items-center justify-between p-4 border-b dark:border-gray-700">
              <div className="flex items-center">
                 <button onClick={() => setSelectedUserEmail(null)} className="md:hidden mr-2 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ArrowLeftIcon className="w-6 h-6" />
                 </button>
                <div className="relative mr-4">
                  <img
                    src={selectedUser.photoUrl || `https://i.pravatar.cc/150?u=${selectedUser.email}`}
                    alt={selectedUser.name}
                    className="w-10 h-10 rounded-full"
                  />
                  <span className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full ring-2 ring-white dark:ring-gray-900 ${selectedUser.status === 'active' ? 'bg-green-500' : 'bg-gray-400'}`} title={selectedUser.status === 'active' ? 'Active' : 'Pending Invitation'}></span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">{selectedUser.name}</h3>
              </div>
              <button
                onClick={() => onInitiateCall(selectedUser)}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label={`Call ${selectedUser.name}`}
                title={`Call ${selectedUser.name}`}
                disabled={selectedUser.status !== 'active'}
              >
                <PhoneIcon className={`w-6 h-6 ${selectedUser.status !== 'active' ? 'text-gray-300 dark:text-gray-600' : ''}`} />
              </button>
            </header>
            <div className="flex-1 p-6 overflow-y-auto space-y-4">
              {conversation.map(msg => {
                const isSender = msg.senderEmail === currentUser.email;
                return (
                  <div key={msg.id} className={`flex items-end gap-3 ${isSender ? 'justify-end' : 'justify-start'}`}>
                    {!isSender && (
                        <img 
                            src={selectedUser.photoUrl || `https://i.pravatar.cc/150?u=${selectedUser.email}`} 
                            alt={selectedUser.name} 
                            className="w-8 h-8 rounded-full"
                        />
                    )}
                    <div className={`max-w-xs md:max-w-md lg:max-w-2xl p-3 rounded-2xl ${
                        isSender
                          ? 'bg-blue-600 text-white rounded-br-none'
                          : 'bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none'
                      }`}
                    >
                      <p className="text-sm break-words">{msg.text}</p>
                       <p className={`text-xs mt-1 ${isSender ? 'text-blue-200' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTimestamp(msg.timestamp)}
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={chatEndRef} />
            </div>
            <form onSubmit={handleSendMessage} className="p-4 border-t dark:border-gray-700">
              <div className="relative">
                <input
                  type="text"
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder={selectedUser.status === 'active' ? 'Type a message...' : 'User has not set up their account yet.'}
                  className="w-full pr-12 py-3 px-4 bg-gray-100 dark:bg-gray-800 border-transparent rounded-full focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:cursor-not-allowed"
                  disabled={selectedUser.status !== 'active'}
                />
                <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 disabled:bg-gray-400 dark:disabled:bg-gray-600" disabled={selectedUser.status !== 'active'}>
                  <SendIcon className="w-5 h-5" />
                </button>
              </div>
            </form>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center h-full text-center text-gray-500 dark:text-gray-400 p-6">
            <ChatIcon className="w-16 h-16 mb-4 text-gray-300 dark:text-gray-600" />
            <h2 className="text-xl font-semibold">Welcome to Team Chat</h2>
            <p className="mt-2">Select a team member from the list to start a conversation.</p>
          </div>
        )}
      </main>
    </div>
  );
};