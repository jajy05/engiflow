
import React, { useState } from 'react';
import type { Organization, User } from '../types';
import { UserManagementPanel } from './UserManagementPanel';
import { SubscriptionPanel } from './SubscriptionPanel';
import { UsersIcon } from './icons/UsersIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

interface SettingsViewProps {
  organization: Organization;
  users: User[];
  onInviteUser: () => void;
  onUpgradeSubscription: () => void;
}

type SettingsTab = 'users' | 'subscription';

export const SettingsView: React.FC<SettingsViewProps> = ({ organization, users, onInviteUser, onUpgradeSubscription }) => {
  const [activeTab, setActiveTab] = useState<SettingsTab>('users');

  return (
    <div className="flex flex-col md:flex-row gap-8 h-full">
      <aside className="w-full md:w-64 flex-shrink-0">
        <h2 className="text-2xl font-bold mb-6 text-gray-800 dark:text-white">Settings</h2>
        <nav className="space-y-2">
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
              activeTab === 'users'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <UsersIcon className="w-5 h-5 mr-3" />
            <span className="font-medium">User Management</span>
          </button>
          <button
            onClick={() => setActiveTab('subscription')}
            className={`w-full flex items-center p-3 rounded-lg text-left transition-colors ${
              activeTab === 'subscription'
                ? 'bg-blue-600 text-white'
                : 'hover:bg-gray-200 dark:hover:bg-gray-700'
            }`}
          >
            <CreditCardIcon className="w-5 h-5 mr-3" />
            <span className="font-medium">Subscription</span>
          </button>
        </nav>
      </aside>

      <main className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 md:p-8">
        {activeTab === 'users' && (
          <UserManagementPanel
            users={users}
            onInviteUser={onInviteUser}
            memberLimit={organization.subscription.memberLimit}
          />
        )}
        {activeTab === 'subscription' && (
          <SubscriptionPanel
            organization={organization}
            onUpgrade={onUpgradeSubscription}
          />
        )}
      </main>
    </div>
  );
};
