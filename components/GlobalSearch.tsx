import React, { useState, useMemo, useEffect } from 'react';
import type { Document, User, DocumentStatus, Project, ReviewerRole } from '../types';
import { DocumentCard } from './DocumentCard';
import { SearchIcon } from './icons/SearchIcon';
import { TagIcon } from './icons/TagIcon';
import { DocumentIcon } from './icons/DocumentIcon';
import { UsersIcon } from './icons/UsersIcon';
import { CalendarIcon } from './icons/CalendarIcon';
import { CheckCircleIcon } from './icons/CheckCircleIcon';
import { XCircleIcon } from './icons/XCircleIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ArrowUpIcon } from './icons/ArrowUpIcon';
import { ArrowDownIcon } from './icons/ArrowDownIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { CommentIcon } from './icons/CommentIcon';
import { InProgressIcon } from './icons/InProgressIcon';
import { ChevronLeftIcon } from './icons/ChevronLeftIcon';
import { ChevronRightIcon } from './icons/ChevronRightIcon';

interface GlobalSearchProps {
  documents: Document[];
  users: User[];
  projects: Project[];
  onSelectDocument: (docId: string) => void;
  currentUser: User;
}

const ITEMS_PER_PAGE = 10;

const FilterSection: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div className="border-t border-gray-200 dark:border-gray-700 py-6">
        <h3 className="flex items-center text-md font-semibold text-gray-700 dark:text-gray-300 mb-4">
            {icon}
            <span className="ml-2">{title}</span>
        </h3>
        <div className="space-y-3">
            {children}
        </div>
    </div>
);

export const GlobalSearch: React.FC<GlobalSearchProps> = ({ documents, users, projects, onSelectDocument, currentUser }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<DocumentStatus | 'All'>('All');
    const [typeFilter, setTypeFilter] = useState<string | 'All'>('All');
    const [uploaderFilter, setUploaderFilter] = useState<string | 'All'>('All');
    const [approverFilter, setApproverFilter] = useState<string | 'All'>('All');
    const [reviewerRoleFilter, setReviewerRoleFilter] = useState<ReviewerRole | 'All'>('All');
    const [projectCodeFilter, setProjectCodeFilter] = useState<string | 'All'>('All');
    const [startDateFilter, setStartDateFilter] = useState('');
    const [endDateFilter, setEndDateFilter] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
    const [currentPage, setCurrentPage] = useState(1);
    
    const docTypes = useMemo(() => ['All', ...Array.from(new Set(documents.map(d => d.type.toUpperCase())))], [documents]);
    const projectCodes = useMemo(() => ['All', ...Array.from(new Set(projects.map(p => p.projectCode)))], [projects]);

    const clearFilters = () => {
        setSearchQuery('');
        setStatusFilter('All');
        setTypeFilter('All');
        setUploaderFilter('All');
        setApproverFilter('All');
        setReviewerRoleFilter('All');
        setProjectCodeFilter('All');
        setStartDateFilter('');
        setEndDateFilter('');
        setSortBy('newest');
        setCurrentPage(1);
    };

    const filteredAndSortedDocuments = useMemo(() => {
        let filtered = documents;

        if (searchQuery.trim()) {
            filtered = filtered.filter(doc => doc.name.toLowerCase().includes(searchQuery.toLowerCase().trim()));
        }
        if (statusFilter !== 'All') {
            filtered = filtered.filter(doc => doc.status === statusFilter);
        }
        if (typeFilter !== 'All') {
            filtered = filtered.filter(doc => doc.type.toUpperCase() === typeFilter);
        }
        if (projectCodeFilter !== 'All') {
            filtered = filtered.filter(doc => doc.projectCode === projectCodeFilter);
        }
        if (uploaderFilter !== 'All') {
            filtered = filtered.filter(doc => doc.uploadedBy.email === uploaderFilter);
        }
        if (approverFilter !== 'All') {
            filtered = filtered.filter(doc => doc.reviewers.some(r => r.role === 'Approver' && r.email === approverFilter));
        }
        if (reviewerRoleFilter !== 'All') {
            filtered = filtered.filter(doc => doc.reviewers.some(r => r.role === reviewerRoleFilter));
        }
        if (startDateFilter) {
            filtered = filtered.filter(doc => new Date(doc.uploadDate) >= new Date(startDateFilter));
        }
        if (endDateFilter) {
             const endOfDay = new Date(endDateFilter);
             endOfDay.setHours(23, 59, 59, 999);
             filtered = filtered.filter(doc => new Date(doc.uploadDate) <= endOfDay);
        }

        return filtered.sort((a, b) => {
            const dateA = new Date(a.uploadDate).getTime();
            const dateB = new Date(b.uploadDate).getTime();
            return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
        });
    }, [documents, searchQuery, statusFilter, typeFilter, uploaderFilter, approverFilter, reviewerRoleFilter, projectCodeFilter, startDateFilter, endDateFilter, sortBy]);

    // Reset to first page whenever filters change
    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery, statusFilter, typeFilter, uploaderFilter, approverFilter, reviewerRoleFilter, projectCodeFilter, startDateFilter, endDateFilter, sortBy]);
    
    const totalPages = Math.ceil(filteredAndSortedDocuments.length / ITEMS_PER_PAGE);
    const paginatedResults = filteredAndSortedDocuments.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);

    const renderStatusButton = (status: DocumentStatus | 'All', label: string, icon: React.ReactNode) => (
        <button
            onClick={() => setStatusFilter(status)}
            className={`w-full flex items-center text-left p-2 rounded-md transition-colors text-sm ${statusFilter === status ? 'bg-blue-600 text-white' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}
        >
            {icon}
            <span className="ml-2">{label}</span>
        </button>
    );

    return (
        <div className="flex flex-col md:flex-row gap-8 h-full">
            {/* Filters Sidebar */}
            <aside className="w-full md:w-80 lg:w-96 flex-shrink-0 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 overflow-y-auto">
                <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-4 mb-2">
                    <h2 className="text-xl font-bold">Filters</h2>
                    <button onClick={clearFilters} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Clear All</button>
                </div>

                <FilterSection title="Status" icon={<TagIcon className="w-5 h-5" />}>
                   {renderStatusButton('All', 'All Statuses', <div className="w-5 h-5 flex items-center justify-center"><div className="w-3 h-3 rounded-full bg-gray-400"></div></div>)}
                   {renderStatusButton('Approved', 'Approved', <CheckCircleIcon className="w-5 h-5 text-green-500" />)}
                   {renderStatusButton('In Review', 'In Review', <ClockIcon className="w-5 h-5 text-amber-500" />)}
                   {renderStatusButton('In Progress', 'In Progress', <InProgressIcon className="w-5 h-5 text-teal-500" />)}
                   {renderStatusButton('Commented', 'Commented', <CommentIcon className="w-5 h-5 text-violet-500" />)}
                   {renderStatusButton('Rejected', 'Rejected', <XCircleIcon className="w-5 h-5 text-red-500" />)}
                </FilterSection>

                <FilterSection title="Project" icon={<ProjectIcon className="w-5 h-5" />}>
                   <select value={projectCodeFilter} onChange={e => setProjectCodeFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500">
                       {projectCodes.map(code => <option key={code} value={code}>{code === 'All' ? 'All Projects' : code}</option>)}
                   </select>
                </FilterSection>

                <FilterSection title="Document Type" icon={<DocumentIcon className="w-5 h-5" />}>
                   <select value={typeFilter} onChange={e => setTypeFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500">
                       {docTypes.map(type => <option key={type} value={type}>{type === 'All' ? 'All Types' : type}</option>)}
                   </select>
                </FilterSection>

                 <FilterSection title="People" icon={<UsersIcon className="w-5 h-5" />}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Uploaded By</label>
                        <select value={uploaderFilter} onChange={e => setUploaderFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500">
                            <option value="All">All Users</option>
                            {users.map(user => <option key={user.email} value={user.email}>{user.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Assigned Approver</label>
                        <select value={approverFilter} onChange={e => setApproverFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500">
                            <option value="All">Any Approver</option>
                            {users.map(user => <option key={user.email} value={user.email}>{user.name}</option>)}
                        </select>
                    </div>
                     <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reviewer Role</label>
                        <select value={reviewerRoleFilter} onChange={e => setReviewerRoleFilter(e.target.value as ReviewerRole | 'All')} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500">
                            <option value="All">All Roles</option>
                            <option value="Approver">Approver</option>
                            <option value="Commenter">Commenter</option>
                            <option value="Viewer">Viewer</option>
                        </select>
                    </div>
                </FilterSection>

                <FilterSection title="Date Range" icon={<CalendarIcon className="w-5 h-5" />}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">From</label>
                        <input type="date" value={startDateFilter} onChange={e => setStartDateFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">To</label>
                        <input type="date" value={endDateFilter} onChange={e => setEndDateFilter(e.target.value)} className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                </FilterSection>
            </aside>

            {/* Search Results */}
            <div className="flex-1 bg-white dark:bg-gray-900 rounded-lg shadow-md p-6 flex flex-col">
                <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-6">
                    <div className="relative flex-grow">
                        <label htmlFor="global-search" className="sr-only">Search Documents</label>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <SearchIcon className="h-5 w-5 text-gray-400" />
                        </div>
                        <input id="global-search" type="text" placeholder="Search by document name..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-gray-50 dark:bg-gray-800 focus:ring-blue-500 focus:border-blue-500" />
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                         <span className="text-sm font-medium">Sort by:</span>
                         <button onClick={() => setSortBy('newest')} className={`flex items-center gap-1 p-2 rounded-md transition-colors text-sm ${sortBy === 'newest' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                             <ArrowDownIcon className="w-4 h-4" /> Newest
                         </button>
                         <button onClick={() => setSortBy('oldest')} className={`flex items-center gap-1 p-2 rounded-md transition-colors text-sm ${sortBy === 'oldest' ? 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300' : 'hover:bg-gray-200 dark:hover:bg-gray-700'}`}>
                             <ArrowUpIcon className="w-4 h-4" /> Oldest
                         </button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 mb-4">
                    {paginatedResults.length > 0 ? (
                        <div className="grid grid-cols-1 gap-4">
                            {paginatedResults.map(doc => (
                                <DocumentCard key={doc.id} document={doc} onSelect={() => onSelectDocument(doc.id)} currentUser={currentUser} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 flex flex-col items-center">
                            <SearchIcon className="w-16 h-16 text-gray-300 dark:text-gray-600 mb-4" />
                            <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-300">No Documents Found</h2>
                            <p className="text-gray-500 dark:text-gray-400 mt-2">Try adjusting your search query or filters.</p>
                        </div>
                    )}
                </div>
                {totalPages > 1 && (
                    <div className="flex items-center justify-between pt-4 border-t dark:border-gray-700">
                        <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage === 1} className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50">
                            <ChevronLeftIcon className="w-5 h-5 mr-2" /> Previous
                        </button>
                        <span className="text-sm">Page {currentPage} of {totalPages}</span>
                        <button onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))} disabled={currentPage === totalPages} className="flex items-center px-4 py-2 text-sm font-medium border rounded-md disabled:opacity-50">
                            Next <ChevronRightIcon className="w-5 h-5 ml-2" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
