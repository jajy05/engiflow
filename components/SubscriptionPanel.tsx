
import React from 'react';
import type { Organization } from '../types';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { SparklesIcon } from './icons/SparklesIcon';
import { CreditCardIcon } from './icons/CreditCardIcon';

interface SubscriptionPanelProps {
  organization: Organization;
  onUpgrade: () => void;
}

const PlanFeature: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <li className="flex items-center">
        <CheckCircleIcon className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" />
        <span className="text-gray-600 dark:text-gray-300">{children}</span>
    </li>
);

export const SubscriptionPanel: React.FC<SubscriptionPanelProps> = ({ organization, onUpgrade }) => {
  const { plan, status, memberLimit } = organization.subscription;
  const isPro = plan === 'Pro';

  return (
    <div>
        <div className="mb-8">
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center">
                <CreditCardIcon className="w-7 h-7 mr-3 text-blue-500" />
                <span>Subscription Details</span>
            </h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
                Manage your billing and plan information.
            </p>
        </div>

        <div className={`p-8 rounded-xl border-2 ${isPro ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900'}`}>
            <div className="flex flex-col md:flex-row justify-between md:items-center">
                <div>
                    <div className="flex items-center gap-3">
                        <h4 className="text-2xl font-extrabold text-gray-900 dark:text-white">{plan} Plan</h4>
                        <span className={`px-3 py-1 text-sm font-semibold rounded-full capitalize ${
                            status === 'active' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' : 'bg-gray-200 text-gray-700'
                        }`}>
                            {status}
                        </span>
                    </div>
                    <p className="text-gray-500 dark:text-gray-400 mt-1">Your organization's current subscription.</p>
                </div>
                {!isPro && (
                     <button
                        onClick={onUpgrade}
                        className="mt-4 md:mt-0 flex items-center justify-center bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-bold py-3 px-6 rounded-lg shadow-lg transition-transform transform hover:scale-105"
                    >
                        <SparklesIcon className="w-5 h-5 mr-2" />
                        Upgrade to Pro
                    </button>
                )}
            </div>

            <div className="border-t border-gray-200 dark:border-gray-700 my-8"></div>

            <div>
                <h5 className="font-bold text-lg text-gray-800 dark:text-gray-100 mb-4">Plan Features:</h5>
                <ul className="space-y-3">
                    <PlanFeature>Up to {memberLimit} team members</PlanFeature>
                    <PlanFeature>Unlimited document uploads</PlanFeature>
                    <PlanFeature>Unlimited projects</PlanFeature>
                    <PlanFeature>Core document review workflow</PlanFeature>
                    <li className={`flex items-center transition-opacity ${isPro ? 'opacity-100' : 'opacity-50'}`}>
                        <CheckCircleIcon className={`w-5 h-5 mr-3 flex-shrink-0 ${isPro ? 'text-green-500' : 'text-gray-400'}`} />
                        <span className="text-gray-600 dark:text-gray-300">
                            AI-Powered Document Summaries
                            {!isPro && <span className="ml-2 text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">PRO</span>}
                        </span>
                    </li>
                </ul>
            </div>
        </div>
    </div>
  );
};