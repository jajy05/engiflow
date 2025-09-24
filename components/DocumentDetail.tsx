import React, { useState, useMemo, useEffect } from 'react';
import type { Document, DocumentStatus, User, Organization } from '../types';
import { LockIcon } from './icons/LockIcon';
import { UserIcon } from './icons/UserIcon';
import { BellIcon } from './icons/BellIcon';
import { generateDocumentSummary } from '../services/geminiService';
import { SparklesIcon } from './icons/SparklesIcon';
import { InlineFileViewer } from './InlineFileViewer';
import { SignatureIcon } from './icons/SignatureIcon';
import { ClockIcon } from './icons/ClockIcon';
import { ListIcon } from './icons/ListIcon';
import { LockClosedIcon } from './icons/LockClosedIcon';
import { ActiveViewers } from './ActiveViewers';
import { CollaborativeScratchpad } from './CollaborativeScratchpad';
import { CollaborationUpsell } from './CollaborationUpsell';

interface DocumentDetailProps {
  document: Document;
  onUpdateStatus: (docId: string, status: DocumentStatus, user: string, comment?: string) => void;
  onAddComment: (docId: string, comment: string) => void;
  onSetReminder: (docId: string, date: string) => void;
  currentUser: User;
  users: User[];
  revisions: Document[];
  onSelectRevision: (docId: string) => void;
  currentOrganization: Organization;
  activeCollaborators: { user: User; isTypingComment?: boolean }[];
  onUpdateScratchpad: (docId: string, content: string) => void;
}

const DetailItem: React.FC<{ label: string; value: string | undefined }> = ({ label, value }) => (
  <div>
    <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</p>
    <p className="mt-1 text-md text-gray-900 dark:text-white">{value || 'N/A'}</p>
  </div>
);

const statusStyles: { [key in DocumentStatus]: { bg: string; text: string; dot: string } } = {
  'Approved': { bg: 'bg-green-100 dark:bg-green-900', text: 'text-green-800 dark:text-green-200', dot: 'bg-green-500' },
  'Rejected': { bg: 'bg-red-100 dark:bg-red-900', text: 'text-red-800 dark:text-red-200', dot: 'bg-red-500' },
  'In Review': { bg: 'bg-amber-100 dark:bg-amber-900', text: 'text-amber-800 dark:text-amber-200', dot: 'bg-amber-500' },
  'In Progress': { bg: 'bg-teal-100 dark:bg-teal-900', text: 'text-teal-800 dark:text-teal-200', dot: 'bg-teal-500' },
  'Commented': { bg: 'bg-violet-100 dark:bg-violet-900', text: 'text-violet-800 dark:text-violet-200', dot: 'bg-violet-500' },
};

export const DocumentDetail: React.FC<DocumentDetailProps> = ({ document, onUpdateStatus, onAddComment, onSetReminder, currentUser, users, revisions, onSelectRevision, currentOrganization, activeCollaborators, onUpdateScratchpad }) => {
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(!document.password);
  const [error, setError] = useState('');
  const [comment, setComment] = useState('');
  const [reminderDate, setReminderDate] = useState('');
  const [summary, setSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const typingTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const userRole = useMemo(() => {
    return document.reviewers.find(r => r.email === currentUser.email)?.role;
  }, [document.reviewers, currentUser.email]);
  
  const isProPlan = currentOrganization.subscription.plan === 'Pro';

  // --- Real-time Collaboration Effects ---
  useEffect(() => {
    if (!isAuthenticated || !isProPlan) return;
    
    // Announce user joining
    const joinEvent = { type: 'doc-join', docId: document.id, user: currentUser };
    localStorage.setItem('engiFlowCollaborationEvent', JSON.stringify(joinEvent));

    // Announce leaving
    return () => {
      const leaveEvent = { type: 'doc-leave', docId: document.id, user: currentUser };
      localStorage.setItem('engiFlowCollaborationEvent', JSON.stringify(leaveEvent));
    };
  }, [document.id, currentUser, isAuthenticated, isProPlan]);

  const handleCommentTyping = (isTyping: boolean) => {
    if (!isProPlan) return;
    
    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    const broadcastTypingState = (typingState: boolean) => {
      const typingEvent = { 
          type: 'doc-comment-typing', 
          docId: document.id, 
          user: currentUser,
          content: { isTyping: typingState }
      };
      localStorage.setItem('engiFlowCollaborationEvent', JSON.stringify(typingEvent));
    };

    if(isTyping) {
      broadcastTypingState(true);
      typingTimeoutRef.current = setTimeout(() => {
        broadcastTypingState(false);
      }, 2000); // Stop typing after 2s of inactivity
    } else {
      broadcastTypingState(false);
    }
  };


  const hasCurrentUserSignedThisRevision = useMemo(() => {
    return document.history.some(
      entry => entry.userEmail === currentUser.email && 
             entry.comment.startsWith('[E-signed]') && 
             entry.version === document.version
    );
  }, [document, currentUser]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === document.password) {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid password.');
    }
  };

  const handleAction = (status: DocumentStatus) => {
    if (status === 'Rejected' && !comment.trim()) {
        alert('A comment is required for rejection.');
        return;
    }
    onUpdateStatus(document.id, status, currentUser.name, comment);
    setComment('');
    handleCommentTyping(false);
  };

  const handleCommentSubmit = () => {
    if (!comment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    onAddComment(document.id, comment);
    setComment('');
    handleCommentTyping(false);
  };

  const handleSetReminder = () => {
    if (!reminderDate) {
      alert('Please select a date for the reminder.');
      return;
    }
    onSetReminder(document.id, reminderDate);
  };

  const handleSummarize = async () => {
    if (!isProPlan) {
      alert("AI Summary is a Pro feature. Please upgrade your plan.");
      return;
    }
    setIsSummarizing(true);
    setSummary(null);
    try {
      const result = await generateDocumentSummary(document.name, document.history);
      setSummary(result);
    } catch (error) {
      console.error("Failed to generate summary:", error);
      alert("There was an error generating the document summary.");
    } finally {
      setIsSummarizing(false);
    }
  };
  
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-full max-w-md bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg">
          <form onSubmit={handleAuth}>
            <div className="flex flex-col items-center text-center">
              <LockIcon className="w-12 h-12 text-gray-400 mb-4" />
              <h2 className="text-xl font-bold mb-2">Access Required</h2>
              <p className="text-gray-500 dark:text-gray-400 mb-6">This document is password protected. Please enter the password to view details.</p>
            </div>
            <div className="mb-4">
              <label htmlFor="doc-password" className="sr-only">Password</label>
              <input
                id="doc-password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                placeholder="Enter document password"
              />
            </div>
            {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            <button type="submit" className="w-full px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Unlock Document
            </button>
          </form>
        </div>
      </div>
    );
  }

  const { bg, text, dot } = statusStyles[document.status];
  
  const SummarizeButton = () => {
    const buttonContent = (
      <>
        {!isProPlan && <LockClosedIcon className="w-4 h-4 mr-2" />}
        {isSummarizing ? 'Generating...' : (summary ? 'Regenerate' : 'Generate Summary')}
      </>
    );

    const buttonProps = {
      onClick: handleSummarize,
      disabled: isSummarizing || !isProPlan,
      className: `flex items-center justify-center bg-blue-600 text-white font-bold py-2 px-3 rounded-lg shadow-md transition-transform transform hover:scale-105 disabled:bg-gray-400 disabled:cursor-not-allowed text-sm ${!isProPlan ? 'bg-gray-500 hover:bg-gray-500' : 'hover:bg-blue-700'}`,
    };

    if (isProPlan) {
      return <button {...buttonProps}>{buttonContent}</button>;
    }

    return (
      <div className="relative group">
        <button {...buttonProps}>{buttonContent}</button>
        <div className="absolute bottom-full mb-2 w-60 left-1/2 -translate-x-1/2 bg-gray-800 text-white text-xs rounded-lg py-2 px-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
          AI Summary is a Pro feature. Please contact your administrator to upgrade your plan.
          <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-4 border-x-transparent border-t-4 border-t-gray-800"></div>
        </div>
      </div>
    );
  };

  const otherCollaboratorsTyping = activeCollaborators.filter(c => c.isTypingComment);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
      {/* Left Column: File Viewer */}
      <div className="lg:col-span-3">
        <InlineFileViewer documentType={document.type} documentName={document.name} fileUrl={document.fileUrl} />
         <div className="mt-8">
          {isProPlan ? (
              <CollaborativeScratchpad 
                  documentId={document.id}
                  content={document.scratchpadContent || ''}
                  onUpdate={onUpdateScratchpad}
              />
          ) : (
              <CollaborationUpsell featureName="Collaborative Scratchpad" />
          )}
        </div>
      </div>

      {/* Right Column: Details & Actions */}
      <div className="lg:col-span-2">
          <div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900 dark:text-white break-all">
                      {document.name}
                      <span className="ml-3 text-base font-medium text-gray-500 dark:text-gray-400">Revision {document.version}</span>
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400">ID: {document.id}</p>
                  </div>
                   <div className="flex items-center gap-2 ml-4 flex-shrink-0">
                      {hasCurrentUserSignedThisRevision && (
                        <div title="You have signed this revision" className="p-2 rounded-full bg-blue-100 dark:bg-blue-900/50">
                          <SignatureIcon className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                      )}
                      <div className={`px-4 py-2 text-sm font-semibold rounded-full flex items-center ${bg} ${text}`}>
                          <span className={`w-2.5 h-2.5 rounded-full mr-2 ${dot}`}></span>
                          {document.status}
                      </div>
                  </div>
              </div>
               {isProPlan && (
                  <div className="mt-4 flex items-center justify-between">
                      <ActiveViewers users={[currentUser, ...activeCollaborators.map(c => c.user)]} />
                  </div>
              )}
            </div>
            
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <DetailItem label="Uploaded By" value={document.uploadedBy.name} />
              <DetailItem label="Upload Date" value={new Date(document.uploadDate).toLocaleString()} />
              <DetailItem label="File Type" value={document.type} />
              <DetailItem label="Project Code" value={document.projectCode} />
              <div className="md:col-span-2">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reviewers</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {document.reviewers.map(reviewer => (
                      <span key={reviewer.email} className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full text-sm">
                          <UserIcon className="w-4 h-4 text-gray-600 dark:text-gray-300"/>
                          <span className="text-gray-800 dark:text-gray-200">{reviewer.email}</span>
                          <span className="font-semibold text-blue-600 dark:text-blue-400">({reviewer.role})</span>
                      </span>
                  ))}
                </div>
              </div>
            </div>
            
             <div className="p-6 border-t dark:border-gray-700">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                    <SparklesIcon className="w-5 h-5 mr-2 text-blue-500" />
                    AI-Powered Summary
                  </h3>
                  <SummarizeButton />
                </div>
                {isSummarizing && (
                  <div className="text-center p-4 text-gray-500 dark:text-gray-400">
                    <p>Analyzing document history... please wait.</p>
                  </div>
                )}
                {summary && !isSummarizing && (
                  <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                    <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">{summary}</p>
                  </div>
                )}
              </div>

            {(document.status === 'In Review' || document.status === 'In Progress') && (
              <div className="p-6 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Set Reminder</h3>
                  {document.reminderDate ? (
                    <div className="p-3 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-md flex items-center">
                      <BellIcon className="w-5 h-5 mr-3"/>
                      Reminder is set for {new Date(document.reminderDate).toLocaleDateString()}.
                    </div>
                  ) : (
                     <div className="flex items-center space-x-2">
                      <input
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                         min={new Date().toISOString().split("T")[0]}
                        className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                      />
                       <button onClick={handleSetReminder} className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
                        Set
                      </button>
                    </div>
                  )}
              </div>
            )}
            
            <div className="p-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <ListIcon className="w-5 h-5 mr-2 text-gray-500" />
                Revision History
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                {revisions.map(rev => {
                    const isCurrent = rev.id === document.id;
                    return (
                        <div 
                            key={rev.id} 
                            onClick={!isCurrent ? () => onSelectRevision(rev.id) : undefined}
                            className={`p-3 rounded-lg flex justify-between items-center ${isCurrent ? 'bg-blue-50 dark:bg-blue-900/50' : 'hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer'}`}
                        >
                            <div>
                                <p className="font-semibold text-gray-800 dark:text-gray-200">
                                    Revision {rev.version}
                                    {isCurrent && <span className="ml-2 text-xs font-bold text-blue-600 dark:text-blue-400">CURRENT</span>}
                                </p>
                                <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded by {rev.uploadedBy.name} on {new Date(rev.uploadDate).toLocaleDateString()}</p>
                            </div>
                            <div className={`px-2 py-1 text-xs font-medium rounded-full ${statusStyles[rev.status].bg} ${statusStyles[rev.status].text}`}>
                                {rev.status}
                            </div>
                        </div>
                    );
                })}
              </div>
            </div>

            <div className="p-6 border-t dark:border-gray-700">
              <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white flex items-center">
                <ClockIcon className="w-5 h-5 mr-2 text-gray-500" />
                Review History
              </h3>
              <div className="space-y-2 max-h-72 overflow-y-auto pr-2 -mr-2">
                {document.history.map((entry, index) => {
                  const isSigned = entry.comment.startsWith('[E-signed]');
                  const displayComment = isSigned ? entry.comment.substring('[E-signed] '.length) : entry.comment;
                  const entryUser = users.find(u => u.email === entry.userEmail);
                  const userAvatarUrl = entryUser?.photoUrl || `https://i.pravatar.cc/150?u=${entry.userEmail}`;
                  const { bg: statusBg, text: statusText, dot: statusDot } = statusStyles[entry.status];

                  return (
                    <div 
                      key={index} 
                      className="p-3 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors"
                      onClick={() => alert(`Viewing details for history entry #${index + 1}. \n\nUser: ${entry.user}\nStatus: ${entry.status}\nDate: ${new Date(entry.date).toLocaleString()}\nComment: ${displayComment}`)}
                      role="button"
                      tabIndex={0}
                      aria-label={`View history entry from ${entry.user} on ${new Date(entry.date).toLocaleDateString()}`}
                    >
                      <div className="flex items-start space-x-3">
                        <img 
                            src={userAvatarUrl} 
                            alt={entry.user} 
                            className="w-10 h-10 rounded-full flex-shrink-0" 
                        />
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                                <p className="font-semibold text-gray-800 dark:text-gray-200 flex items-center truncate">
                                    <span className="truncate">{entry.user}</span>
                                    {isSigned && (
                                        <span title="Electronically Signed" className="ml-2 text-blue-500 flex-shrink-0">
                                          <SignatureIcon className="w-4 h-4" />
                                        </span>
                                    )}
                                </p>
                                <div className={`px-2 py-0.5 text-xs font-medium rounded-full flex items-center flex-shrink-0 ${statusBg} ${statusText}`}>
                                    <span className={`w-2 h-2 rounded-full mr-1.5 ${statusDot}`}></span>
                                    {entry.status}
                                </div>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 break-words mt-1">{displayComment}</p>
                            <div className="flex items-center justify-between mt-1">
                               <p className="text-xs text-gray-400 dark:text-gray-500">{new Date(entry.date).toLocaleString()}</p>
                                <span className="text-xs font-semibold px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full">
                                    Revision {entry.version}
                                </span>
                            </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            
            {(document.status === 'In Review' || document.status === 'In Progress') && (userRole === 'Approver' || userRole === 'Commenter') && (
              <div className="p-6 bg-gray-50 dark:bg-gray-800 border-t dark:border-gray-700">
                <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">Take Action</h3>
                <div className="mb-2">
                  <textarea
                    value={comment}
                    onChange={(e) => { setComment(e.target.value); handleCommentTyping(true); }}
                    onBlur={() => handleCommentTyping(false)}
                    placeholder="Add a comment..."
                    className="w-full px-4 py-2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    rows={3}
                  ></textarea>
                </div>
                 {otherCollaboratorsTyping.length > 0 && (
                  <div className="text-xs text-gray-500 dark:text-gray-400 h-4 mb-2 italic">
                    {otherCollaboratorsTyping.map(c => c.user.name).join(', ')} {otherCollaboratorsTyping.length > 1 ? 'are' : 'is'} typing...
                  </div>
                )}
                <div className="flex flex-wrap gap-2">
                  {userRole === 'Approver' && (
                    <>
                      {document.status === 'In Review' && (
                        <button onClick={() => handleAction('In Progress')} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-teal-600 hover:bg-teal-700">Set to In Progress</button>
                      )}
                      <button onClick={() => handleAction('Approved')} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-green-600 hover:bg-green-700">Approve</button>
                      <button onClick={() => handleAction('Rejected')} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700">Reject</button>
                    </>
                  )}
                  {userRole === 'Commenter' && (
                    <button onClick={handleCommentSubmit} className="flex-1 px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Submit Comment</button>
                  )}
                </div>
              </div>
            )}
          </div>
      </div>
    </div>
  );
};