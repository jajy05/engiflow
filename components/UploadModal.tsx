import React, { useState, useRef, useEffect, useMemo } from 'react';
import type { Document, Reviewer, ReviewerRole, User, Project, DocumentDiscipline } from '../types';
import { generateReviewEmail } from '../services/geminiService';
import { UploadIcon } from './icons/UploadIcon';
import { MailIcon } from './icons/MailIcon';
import { LockIcon } from './icons/LockIcon';
import { TrashIcon } from './icons/TrashIcon';
import { ProjectIcon } from './icons/ProjectIcon';
import { DOCUMENT_DISCIPLINES } from '../constants';
import { FolderIcon } from './icons/FolderIcon';
import { SearchIcon } from './icons/SearchIcon';

interface UploadModalProps {
  onClose: () => void;
  onAddDocument: (newDocument: Omit<Document, 'id' | 'history' | 'status' | 'version' | 'isLatest' | 'organizationId'>) => void;
  currentUser: User;
  projects: Project[];
  users: User[];
  projectCode?: string | null;
}

const UploadModal: React.FC<UploadModalProps> = ({ onClose, onAddDocument, currentUser, projects, users, projectCode }) => {
  const [file, setFile] = useState<File | null>(null);
  const [fileDataUrl, setFileDataUrl] = useState<string | null>(null);
  const [selectedProjectCode, setSelectedProjectCode] = useState(projectCode || '');
  const [discipline, setDiscipline] = useState<DocumentDiscipline | ''>('');
  const [reviewers, setReviewers] = useState<Reviewer[]>([]);
  const [reviewerEmail, setReviewerEmail] = useState('');
  const [reviewerRole, setReviewerRole] = useState<ReviewerRole>('Approver');
  const [password, setPassword] = useState<string>('');
  const [generatedEmail, setGeneratedEmail] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [userSearch, setUserSearch] = useState('');
  const modalRef = useRef<HTMLDivElement>(null);

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

  useEffect(() => {
    if (selectedProjectCode) {
      const project = projects.find(p => p.projectCode === selectedProjectCode);
      if (project && project.team) {
        const projectTeamReviewers = project.team
          .map(email => {
            const userExists = users.find(u => u.email === email);
            if (userExists) {
              return { email, role: 'Viewer' as ReviewerRole };
            }
            return null;
          })
          .filter((r): r is Reviewer => r !== null);
        setReviewers(projectTeamReviewers);
      } else {
        setReviewers([]);
      }
    }
  }, [selectedProjectCode, projects, users]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const currentFile = e.target.files[0];
      setFile(currentFile);
      setFileDataUrl(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        setFileDataUrl(reader.result as string);
      };
      reader.readAsDataURL(currentFile);
    }
  };

  const handleAddReviewer = () => {
    if (reviewerEmail && !reviewers.some(r => r.email === reviewerEmail)) {
      setReviewers([...reviewers, { email: reviewerEmail, role: reviewerRole }]);
      setReviewerEmail('');
      setReviewerRole('Approver');
    }
  };

  const handleRemoveReviewer = (email: string) => {
    setReviewers(reviewers.filter(r => r.email !== email));
  };

  const generatePassword = () => {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*()';
    let newPassword = '';
    for (let i = 0; i < 12; i++) {
      newPassword += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(newPassword);
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file || !fileDataUrl || reviewers.length === 0 || !selectedProjectCode || !discipline) {
        alert("Please fill all required fields: File, Project, Discipline, and at least one Reviewer.");
        return;
    }

    setIsLoading(true);

    const newDocument: Omit<Document, 'id' | 'history' | 'status' | 'version' | 'isLatest' | 'organizationId'> = {
      name: file.name,
      type: file.name.split('.').pop()?.toUpperCase() || 'FILE',
      uploadedBy: currentUser,
      uploadDate: new Date().toISOString(),
      reviewers,
      password: password,
      projectCode: selectedProjectCode,
      fileUrl: fileDataUrl,
      discipline: discipline,
    };

    try {
      const emailContent = await generateReviewEmail(newDocument.name, newDocument.reviewers);
      setGeneratedEmail(emailContent);
      onAddDocument(newDocument);
      setIsSubmitted(true);
    } catch (error) {
      console.error("Failed to generate email:", error);
      alert("There was an error processing your request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };
  
  const availableReviewers = useMemo(() => {
    const filtered = users.filter(u => u.email !== currentUser.email);
    if (!userSearch.trim()) {
      return filtered;
    }
    return filtered.filter(u => 
      u.name.toLowerCase().includes(userSearch.toLowerCase().trim()) || 
      u.email.toLowerCase().includes(userSearch.toLowerCase().trim())
    );
  }, [users, currentUser, userSearch]);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div ref={modalRef} className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        
        {!isSubmitted ? (
          <form onSubmit={handleSubmit} className="flex flex-col overflow-hidden">
            <div className="p-8 overflow-y-auto">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Upload New Document</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <div>
                  <label htmlFor="file-upload" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Document File *</label>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 dark:border-gray-600 border-dashed rounded-md h-full">
                    <div className="space-y-1 text-center flex flex-col justify-center">
                      <UploadIcon className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600 dark:text-gray-400">
                        <label htmlFor="file-upload" className="relative cursor-pointer bg-white dark:bg-gray-900 rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                          <span className="truncate max-w-xs block">{file ? file.name : 'Upload a file'}</span>
                          <input id="file-upload" name="file-upload" type="file" className="sr-only" onChange={handleFileChange} required />
                        </label>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-500">or drag and drop</p>
                    </div>
                  </div>
                </div>
                 <div className="space-y-6">
                    <div>
                      <label htmlFor="project-select" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <ProjectIcon className="w-4 h-4 mr-2"/>
                          Project *
                      </label>
                      <select
                          id="project-select"
                          value={selectedProjectCode}
                          onChange={(e) => setSelectedProjectCode(e.target.value)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                      >
                          <option value="" disabled>Select a project</option>
                          {projects.map(p => (
                              <option key={p.id} value={p.projectCode}>{p.name} ({p.projectCode})</option>
                          ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="discipline-select" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          <FolderIcon className="w-4 h-4 mr-2"/>
                          Discipline *
                      </label>
                      <select
                          id="discipline-select"
                          value={discipline}
                          onChange={(e) => setDiscipline(e.target.value as DocumentDiscipline)}
                          className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                          required
                      >
                          <option value="" disabled>Select a discipline</option>
                          {DOCUMENT_DISCIPLINES.map(d => (
                              <option key={d.id} value={d.id}>{d.name}</option>
                          ))}
                      </select>
                    </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><MailIcon className="w-4 h-4 mr-2"/>Reviewers *</label>
                <div className="relative mb-2">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <SearchIcon className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                        type="text"
                        list="reviewer-emails"
                        value={reviewerEmail}
                        onChange={(e) => setReviewerEmail(e.target.value)}
                        onFocus={() => setUserSearch('')} // Clear search when focusing on email input
                        placeholder="Select or type a user's email..."
                        className="w-full px-4 py-2 pl-10 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                     <datalist id="reviewer-emails">
                        {availableReviewers.map(u => <option key={u.email} value={u.email}>{u.name}</option>)}
                    </datalist>
                </div>
                <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                  <select
                    value={reviewerRole}
                    onChange={(e) => setReviewerRole(e.target.value as ReviewerRole)}
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="Approver">Approver</option>
                    <option value="Commenter">Commenter</option>
                    <option value="Viewer">Viewer</option>
                  </select>
                  <button type="button" onClick={handleAddReviewer} className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">Add</button>
                </div>
                <div className="mt-3 space-y-2 max-h-24 overflow-y-auto">
                  {reviewers.map(r => (
                    <div key={r.email} className="flex items-center justify-between bg-gray-100 dark:bg-gray-800 p-2 rounded-md">
                      <div>
                        <span className="font-medium text-gray-800 dark:text-gray-200">{r.email}</span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">({r.role})</span>
                      </div>
                      <button type="button" onClick={() => handleRemoveReviewer(r.email)} className="text-red-500 hover:text-red-700">
                        <TrashIcon className="w-5 h-5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mb-6">
                 <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"><LockIcon className="w-4 h-4 mr-2"/>Document Password (Optional)</label>
                 <div className="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-2">
                    <input
                      type="text"
                      id="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Enter a password or generate one"
                      className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    />
                    <button type="button" onClick={generatePassword} className="w-full sm:w-auto px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-gray-600 hover:bg-gray-700">Generate</button>
                 </div>
              </div>
            </div>
            <div className="bg-gray-100 dark:bg-gray-800 px-8 py-4 flex justify-end space-x-3 rounded-b-2xl mt-auto">
              <button type="button" onClick={onClose} className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 hover:bg-gray-200 dark:hover:bg-gray-700">Cancel</button>
              <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300">
                {isLoading ? 'Processing...' : 'Upload & Notify'}
              </button>
            </div>
          </form>
        ) : (
          <div className="p-8 text-center overflow-y-auto">
            <h2 className="text-2xl font-bold text-green-600 mb-4">Upload Successful!</h2>
            <p className="text-gray-700 dark:text-gray-300 mb-6">The document has been added to the system and a notification email has been generated for the reviewers.</p>
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded-lg text-left">
              <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Generated Email Content:</h3>
              <pre className="whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400 font-sans">{generatedEmail}</pre>
            </div>
            <button onClick={onClose} className="mt-8 px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700">
              Close
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default UploadModal;
