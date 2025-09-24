import React, { useState, useMemo, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { DocumentList } from './components/DocumentList';
import UploadModal from './components/UploadModal';
import { DocumentDetail } from './components/DocumentDetail';
import type { Document, View, DocumentStatus, User, Project, NewProjectData, Task, Note, TaskPriority, ChatMessage, ActiveCall, Organization, UserRole, Notification, HistoryEntry } from './types';
import { INITIAL_DOCUMENTS, USERS, INITIAL_PROJECTS, INDIAN_HOLIDAYS, ORGANIZATIONS } from './constants';
import { PlusIcon } from './components/icons/PlusIcon';
import { ArrowLeftIcon } from './components/icons/ArrowLeftIcon';
import { Profile } from './components/Profile';
import { Projects } from './components/Projects';
import AddProjectModal from './components/AddProjectModal';
import EditProjectModal from './components/EditProjectModal';
import { GlobalSearch } from './components/GlobalSearch';
import ESignModal from './components/ESignModal';
import { CalendarView } from './components/CalendarView';
import { NotesView } from './components/NotesView';
import { ChatView } from './components/ChatView';
import { CallingView } from './components/CallingView';
import { MenuIcon } from './components/icons/MenuIcon';
import { SettingsView } from './components/SettingsView';
import InviteUserModal from './components/InviteUserModal';
import { AuthLayout } from './components/AuthLayout';
import { Notifications } from './components/Notifications';
import { generateStatusUpdateEmail } from './services/geminiService';
import { SetPasswordView } from './components/SetPasswordView';
import { SyncStatusIndicator } from './components/SyncStatusIndicator';
import { RefreshIcon } from './components/icons/RefreshIcon';


type ESignAction = {
  type: 'statusUpdate';
  docId: string;
  status: DocumentStatus;
  comment: string;
} | {
  type: 'comment';
  docId: string;
  comment: string;
};

// Represents users currently viewing a document
type ActiveCollaborators = Record<string, { user: User; isTypingComment?: boolean }[]>;


const safeJsonParse = <T,>(key: string, fallback: T): T => {
  if (typeof window !== 'undefined' && window.localStorage) {
    const item = window.localStorage.getItem(key);
    if (item) {
      try {
        return JSON.parse(item);
      } catch (e) {
        console.error(`Error parsing JSON from localStorage key "${key}":`, e);
        return fallback;
      }
    }
  }
  return fallback;
};


const App: React.FC = () => {
  // Global data - in a real app, this would be fetched from a backend
  const [organizations, setOrganizations] = useState<Organization[]>(() => safeJsonParse('engiFlowOrganizations', ORGANIZATIONS));
  const [users, setUsers] = useState<User[]>(() => safeJsonParse('engiFlowUsers', USERS));
  const [documents, setDocuments] = useState<Document[]>(() => safeJsonParse('engiFlowDocuments', INITIAL_DOCUMENTS));
  const [projects, setProjects] = useState<Project[]>(() => safeJsonParse('engiFlowProjects', INITIAL_PROJECTS));
  const [tasks, setTasks] = useState<Task[]>(() => safeJsonParse<Task[]>('engiFlowTasks', []));
  const [notes, setNotes] = useState<Note[]>(() => safeJsonParse<Note[]>('engiFlowNotes', []));
  const [messages, setMessages] = useState<ChatMessage[]>(() => safeJsonParse<ChatMessage[]>('engiFlowMessages', []));
  const [notifications, setNotifications] = useState<Notification[]>(() => safeJsonParse<Notification[]>('engiFlowNotifications', []));

  // Authentication state
  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    const loggedInUserEmail = safeJsonParse('loggedInUserEmail', null);
    if (loggedInUserEmail) {
        const allUsers = safeJsonParse('engiFlowUsers', USERS);
        return allUsers.find(u => u.email === loggedInUserEmail) || null;
    }
    return null;
  });

  // UI State
  const [view, setView] = useState<View>('dashboard');
  const [previousView, setPreviousView] = useState<View>('dashboard');
  const [selectedDocumentId, setSelectedDocumentId] = useState<string | null>(null);
  const [selectedProjectCode, setSelectedProjectCode] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState<boolean>(false);
  const [isEditProjectModalOpen, setIsEditProjectModalOpen] = useState<boolean>(false);
  const [projectToEdit, setProjectToEdit] = useState<Project | null>(null);
  const [isESignModalOpen, setIsESignModalOpen] = useState<boolean>(false);
  const [eSignAction, setESignAction] = useState<ESignAction | null>(null);
  const [activeCall, setActiveCall] = useState<ActiveCall | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [isInviteUserModalOpen, setIsInviteUserModalOpen] = useState(false);
  const [activeCollaborators, setActiveCollaborators] = useState<ActiveCollaborators>({});
  const [lastSyncTime, setLastSyncTime] = useState<number>(Date.now());

  
  const getInitialTheme = (): 'light' | 'dark' => {
    if (typeof window !== 'undefined' && window.localStorage) {
      const storedPrefs = window.localStorage.getItem('theme');
      if (typeof storedPrefs === 'string') {
        return storedPrefs as 'light' | 'dark';
      }
      const userMedia = window.matchMedia('(prefers-color-scheme: dark)');
      if (userMedia.matches) {
        return 'dark';
      }
    }
    return 'light';
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(getInitialTheme);

  // --- Data Persistence ---
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove(theme === 'dark' ? 'light' : 'dark');
    root.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme]);
  
  useEffect(() => { localStorage.setItem('engiFlowOrganizations', JSON.stringify(organizations)); setLastSyncTime(Date.now()); }, [organizations]);
  useEffect(() => { localStorage.setItem('engiFlowDocuments', JSON.stringify(documents)); setLastSyncTime(Date.now()); }, [documents]);
  useEffect(() => { localStorage.setItem('engiFlowProjects', JSON.stringify(projects)); setLastSyncTime(Date.now()); }, [projects]);
  useEffect(() => { localStorage.setItem('engiFlowTasks', JSON.stringify(tasks)); setLastSyncTime(Date.now()); }, [tasks]);
  useEffect(() => { localStorage.setItem('engiFlowUsers', JSON.stringify(users)); setLastSyncTime(Date.now()); }, [users]);
  useEffect(() => { localStorage.setItem('engiFlowNotes', JSON.stringify(notes)); setLastSyncTime(Date.now()); }, [notes]);
  useEffect(() => { localStorage.setItem('engiFlowMessages', JSON.stringify(messages)); setLastSyncTime(Date.now()); }, [messages]);
  useEffect(() => { localStorage.setItem('engiFlowNotifications', JSON.stringify(notifications)); setLastSyncTime(Date.now()); }, [notifications]);

  // --- Real-time Sync Across Tabs ---
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
        if (!event.newValue || !event.key) return;

        try {
            let stateUpdated = false;
            // Handle full state sync
            if (event.key.startsWith('engiFlow')) {
                const updatedValue = JSON.parse(event.newValue);
                switch (event.key) {
                    case 'engiFlowOrganizations': setOrganizations(updatedValue); stateUpdated = true; break;
                    case 'engiFlowUsers': setUsers(updatedValue); stateUpdated = true; break;
                    case 'engiFlowDocuments': setDocuments(updatedValue); stateUpdated = true; break;
                    case 'engiFlowProjects': setProjects(updatedValue); stateUpdated = true; break;
                    case 'engiFlowTasks': setTasks(updatedValue); stateUpdated = true; break;
                    case 'engiFlowNotes': setNotes(updatedValue); stateUpdated = true; break;
                    case 'engiFlowMessages': setMessages(updatedValue); stateUpdated = true; break;
                    case 'engiFlowNotifications': setNotifications(updatedValue); stateUpdated = true; break;
                }
            }
            
            // Handle granular collaboration events
            if (event.key === 'engiFlowCollaborationEvent' && currentUser) {
                const collabEvent = JSON.parse(event.newValue);
                const { type, docId, user, content } = collabEvent;

                // Ignore events triggered by the current user
                if (user.email === currentUser.email) return;

                setActiveCollaborators(prev => {
                    const docCollaborators = prev[docId] || [];
                    let newCollaborators = [...docCollaborators];

                    switch (type) {
                        case 'doc-join':
                            if (!newCollaborators.some(c => c.user.email === user.email)) {
                                newCollaborators.push({ user });
                            }
                            break;
                        case 'doc-leave':
                            newCollaborators = newCollaborators.filter(c => c.user.email !== user.email);
                            break;
                        case 'doc-comment-typing':
                            newCollaborators = newCollaborators.map(c => 
                                c.user.email === user.email ? { ...c, isTypingComment: content.isTyping } : c
                            );
                             if (!newCollaborators.some(c => c.user.email === user.email)) {
                                newCollaborators.push({ user, isTypingComment: content.isTyping });
                            }
                            break;
                    }

                    return { ...prev, [docId]: newCollaborators };
                });
                
                if (type === 'doc-scratchpad-update') {
                  setDocuments(prevDocs => prevDocs.map(doc => 
                      doc.id === docId ? { ...doc, scratchpadContent: content } : doc
                  ));
                }
                stateUpdated = true;
            }

            if(stateUpdated) {
                setLastSyncTime(Date.now());
            }

        } catch (e) {
            console.error(`Error processing storage event for key "${event.key}":`, e);
        }
    };

    window.addEventListener('storage', handleStorageChange);

    return () => {
        window.removeEventListener('storage', handleStorageChange);
    };
  }, [currentUser]);

  const handleRefresh = () => {
    console.log("Forcing state synchronization from localStorage...");
    setOrganizations(safeJsonParse('engiFlowOrganizations', ORGANIZATIONS));
    setUsers(safeJsonParse('engiFlowUsers', USERS));
    setDocuments(safeJsonParse('engiFlowDocuments', INITIAL_DOCUMENTS));
    setProjects(safeJsonParse('engiFlowProjects', INITIAL_PROJECTS));
    setTasks(safeJsonParse<Task[]>('engiFlowTasks', []));
    setNotes(safeJsonParse<Note[]>('engiFlowNotes', []));
    setMessages(safeJsonParse<ChatMessage[]>('engiFlowMessages', []));
    setNotifications(safeJsonParse<Notification[]>('engiFlowNotifications', []));
  };


  // --- Auth Handlers ---
  const handleLogin = (organizationName: string, email: string, password: string): { success: boolean; message: string } => {
    const organization = organizations.find(o => o.name.toLowerCase() === organizationName.toLowerCase().trim());
    if (!organization) {
        return { success: false, message: "Organization not found." };
    }

    const user = users.find(u => 
        u.organizationId === organization.id && 
        u.email.toLowerCase() === email.toLowerCase()
    );

    if (user) {
        if (user.status === 'pending') {
            setCurrentUser(user);
            localStorage.setItem('loggedInUserEmail', JSON.stringify(user.email));
            return { success: true, message: '' };
        }

        if (user.password === password) {
            setCurrentUser(user);
            localStorage.setItem('loggedInUserEmail', JSON.stringify(user.email));
            return { success: true, message: '' };
        }
    }
    
    return { success: false, message: "Invalid email or password for this organization." };
  };

  const handleRegister = (name: string, email: string, password: string, organizationName: string): boolean => {
    if (users.some(u => u.email.toLowerCase() === email.toLowerCase())) {
        alert('Error: A user with this email already exists.');
        return false;
    }
    if (organizations.some(o => o.name.toLowerCase() === organizationName.toLowerCase())) {
        alert('Error: An organization with this name already exists.');
        return false;
    }

    const newOrgId = `org_${Date.now()}`;
    const newOrg: Organization = {
        id: newOrgId,
        name: organizationName,
        subscription: { plan: 'Free', status: 'active', memberLimit: 5 },
    };

    const newUser: User = {
        name,
        email,
        password, // In a real app, this should be hashed and salted.
        role: 'Admin',
        organizationId: newOrgId,
        photoUrl: `https://i.pravatar.cc/150?u=${email}`,
        status: 'active',
    };

    setOrganizations(prev => [...prev, newOrg]);
    setUsers(prev => [...prev, newUser]);
    
    // Automatically log in the new user
    setCurrentUser(newUser);
    localStorage.setItem('loggedInUserEmail', JSON.stringify(newUser.email));
    return true;
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('loggedInUserEmail');
    setView('dashboard'); // Reset view on logout
  };

  const handleSetPassword = (newPassword: string) => {
    if (!currentUser) return;
    
    const updatedUser: User = { ...currentUser, password: newPassword, status: 'active' };
    
    setUsers(prevUsers => 
        prevUsers.map(u => 
            (u.email.toLowerCase() === currentUser.email.toLowerCase() && u.organizationId === currentUser.organizationId) 
            ? updatedUser 
            : u
        )
    );
    
    setCurrentUser(updatedUser);
  };
  
  const handleFindOrganization = (organizationName: string): Organization | undefined => {
    return organizations.find(o => o.name.toLowerCase().trim() === organizationName.toLowerCase().trim());
  };

  const handleFindUserInOrg = (email: string, organizationId: string): User | undefined => {
      return users.find(u => 
          u.organizationId === organizationId && 
          u.email.toLowerCase() === email.toLowerCase().trim()
      );
  };

  // --- Tenant-aware Data Selectors (only run when logged in) ---
  const currentOrganization = useMemo(() => {
    if (!currentUser) return null;
    return organizations.find(org => org.id === currentUser.organizationId);
  }, [organizations, currentUser]);

  const organizationUsers = useMemo(() => {
    if (!currentUser) return [];
    return users.filter(u => u.organizationId === currentUser.organizationId);
  }, [users, currentUser]);
  
  const organizationProjects = useMemo(() => {
    if (!currentUser) return [];
    return projects.filter(p => p.organizationId === currentUser.organizationId);
  }, [projects, currentUser]);

  const organizationDocuments = useMemo(() => {
    if (!currentUser) return [];
    return documents.filter(doc => doc.organizationId === currentUser.organizationId);
  }, [documents, currentUser]);

  const organizationNotifications = useMemo(() => {
    if (!currentUser) return [];
    return notifications.filter(n => n.organizationId === currentUser.organizationId);
  }, [notifications, currentUser]);


  // --- View Logic ---
  const handleViewChange = (newView: View) => {
    if (!currentUser) return;
    // Prevent non-admins from accessing settings
    if (newView === 'settings' && currentUser.role !== 'Admin') {
      alert("You don't have permission to access settings.");
      return;
    }
    setSelectedDocumentId(null);
    if (newView !== 'documents') {
      setSelectedProjectCode(null);
    }
    setView(newView);
  };
  
  const handleSelectProject = (projectCode: string) => {
    setSelectedProjectCode(projectCode);
    setView('documents');
  };

  const handleSelectDocument = (docId: string) => {
    setPreviousView(view);
    setSelectedDocumentId(docId);
    setView('detail');

    // Mark related notifications as read
    setNotifications(prev => prev.map(n => 
        (n.documentId === docId && n.recipientEmail === currentUser?.email && !n.isRead)
        ? { ...n, isRead: true } 
        : n
    ));
  };
  
  const handleBack = () => {
    setSelectedDocumentId(null);
    setView(previousView);
  };

  // --- E-Sign Logic ---
  const handleRequestESign = (action: ESignAction) => {
    if (!currentUser) return;
    if (action.type === 'statusUpdate' && action.status === 'Rejected' && !action.comment.trim()) {
        alert('A comment is required for rejection.');
        return;
    }
     if ((action.type === 'comment' || (action.type === 'statusUpdate' && action.status !== 'Approved')) && !action.comment.trim()) {
      alert('Comment cannot be empty.');
      return;
    }
    setESignAction(action);
    setIsESignModalOpen(true);
  };

  const handleConfirmESign = async (password: string) => {
    if (!eSignAction || !currentUser) return;

    if (password !== currentUser.password) {
      alert('Invalid password. Please try again.');
      return;
    }
    
    let updatedDoc: Document | undefined;

    setDocuments(prevDocs => {
        const docIndex = prevDocs.findIndex(d => d.id === eSignAction.docId);
        if (docIndex === -1) return prevDocs;

        const docToUpdate = { ...prevDocs[docIndex] };
        let newHistoryEntry: HistoryEntry;

        if (eSignAction.type === 'statusUpdate') {
            docToUpdate.status = eSignAction.status;
            newHistoryEntry = {
                status: eSignAction.status,
                date: new Date().toISOString(),
                user: currentUser.name,
                userEmail: currentUser.email,
                comment: `[E-signed] ${eSignAction.comment || 'Status updated.'}`,
                version: docToUpdate.version,
            };
        } else { // 'comment'
            docToUpdate.status = 'Commented';
            newHistoryEntry = {
                status: 'Commented',
                date: new Date().toISOString(),
                user: currentUser.name,
                userEmail: currentUser.email,
                comment: `[E-signed] ${eSignAction.comment}`,
                version: docToUpdate.version,
            };
        }
        
        docToUpdate.history = [newHistoryEntry, ...docToUpdate.history];
        
        const newDocs = [...prevDocs];
        newDocs[docIndex] = docToUpdate;
        updatedDoc = docToUpdate;
        return newDocs;
    });

    // --- Notification Generation ---
    if (updatedDoc) {
        const recipients = [
            updatedDoc.uploadedBy,
            ...updatedDoc.reviewers.map(r => users.find(u => u.email === r.email)).filter((u): u is User => !!u)
        ];

        const uniqueRecipientEmails = Array.from(new Set(recipients.map(u => u.email)))
            .filter(email => email !== currentUser.email); // Don't notify the user who took the action

        // In-App Notifications
        let message = '';
        if (eSignAction.type === 'statusUpdate') {
            message = `${currentUser.name} has set the status of "${updatedDoc.name}" to ${eSignAction.status}.`;
        } else {
            message = `${currentUser.name} has commented on "${updatedDoc.name}".`;
        }
        
        const newNotifications: Notification[] = uniqueRecipientEmails.map(email => ({
            id: `notif-${Date.now()}-${Math.random()}`,
            recipientEmail: email,
            documentId: updatedDoc!.id,
            documentName: updatedDoc!.name,
            message: message,
            timestamp: new Date().toISOString(),
            isRead: false,
            organizationId: currentUser.organizationId,
        }));

        setNotifications(prev => [...prev, ...newNotifications]);

        // Email Notification Generation
        if (uniqueRecipientEmails.length > 0) {
            try {
                const statusForEmail = eSignAction.type === 'statusUpdate' ? eSignAction.status : 'Commented';
                const commentForEmail = eSignAction.comment;

                const emailContent = await generateStatusUpdateEmail(
                    updatedDoc.name,
                    statusForEmail,
                    currentUser.name,
                    commentForEmail,
                    uniqueRecipientEmails
                );

                console.log("--- Suggested Email Notification ---");
                console.log(`To: ${uniqueRecipientEmails.join(', ')}`);
                console.log(emailContent);
                console.log("------------------------------------");
            } catch (error) {
                console.error("Failed to generate status update email:", error);
                alert("The action was successful, but there was an error generating the notification email.");
            }
        }
    }
    
    setIsESignModalOpen(false);
    setESignAction(null);
  };

  const handleMarkNotificationAsRead = (notificationId: string) => {
    setNotifications(prev => prev.map(n => n.id === notificationId ? { ...n, isRead: true } : n));
  };

  const handleMarkAllNotificationsAsRead = () => {
    if(!currentUser) return;
    setNotifications(prev => prev.map(n => (n.recipientEmail === currentUser.email ? { ...n, isRead: true } : n)));
  };

  // --- Data Mutation Handlers (Now Tenant-Aware) ---
  const handleAddDocument = (newDocumentData: Omit<Document, 'id' | 'history' | 'status' | 'version' | 'isLatest' | 'organizationId'>) => {
    if (!currentUser) return;
    const existingDocs = organizationDocuments.filter(
      doc => doc.name === newDocumentData.name && doc.projectCode === newDocumentData.projectCode
    );
    const maxVersion = Math.max(-1, ...existingDocs.map(d => d.version));
    const newVersion = maxVersion + 1;

    const docToAdd: Document = {
      ...newDocumentData,
      id: `doc-${Date.now()}`,
      status: 'In Review',
      history: [{ status: 'In Review', date: new Date().toISOString(), user: newDocumentData.uploadedBy.name, userEmail: newDocumentData.uploadedBy.email, comment: `Document Revision ${newVersion} created and sent for review.`, version: newVersion }],
      version: newVersion,
      isLatest: true,
      organizationId: currentUser.organizationId,
      scratchpadContent: 'Welcome to the collaborative scratchpad! Type your notes here.',
    };
    
    const updatedDocuments = documents.map(doc => {
        if (doc.organizationId === currentUser.organizationId && existingDocs.some(existing => existing.id === doc.id)) {
            return { ...doc, isLatest: false };
        }
        return doc;
    });

    setDocuments([docToAdd, ...updatedDocuments]);
  };
  
  const handleAddProject = (projectData: NewProjectData) => {
    if (!currentUser) return;
    if (organizationProjects.some(p => p.projectCode.toLowerCase() === projectData.projectCode.toLowerCase())) {
        alert('Error: Project Code must be unique within your organization.');
        return;
    }
    const newProject: Project = {
        ...projectData,
        id: `proj-${Date.now()}`,
        lastUpdated: new Date().toISOString(),
        organizationId: currentUser.organizationId,
    };
    setProjects(prevProjects => [newProject, ...prevProjects]);
    setIsAddProjectModalOpen(false);
  };
  
  const handleOpenEditProjectModal = (project: Project) => {
    setProjectToEdit(project);
    setIsEditProjectModalOpen(true);
  };

  const handleUpdateProject = (updatedProject: Project) => {
    setProjects(prev => prev.map(p => p.id === updatedProject.id ? { ...updatedProject, lastUpdated: new Date().toISOString() } : p));
    setIsEditProjectModalOpen(false);
    setProjectToEdit(null);
  };
  
  const handleDeleteProject = (projectCode: string) => {
    if (!currentUser || currentUser.role !== 'Admin') {
      alert("You don't have permission to delete projects.");
      return;
    }
    if (window.confirm(`Are you sure you want to delete project ${projectCode}? This will also delete all associated documents.`)) {
        setProjects(prev => prev.filter(p => !(p.projectCode === projectCode && p.organizationId === currentUser.organizationId)));
        setDocuments(prev => prev.filter(d => !(d.projectCode === projectCode && d.organizationId === currentUser.organizationId)));
        if (selectedProjectCode === projectCode) {
            setSelectedProjectCode(null);
            setView('projects');
        }
    }
  };

  const handleUpdateUser = (updatedUser: User) => {
    if (!currentUser) return;
    const updatedUsers = users.map(u => (u.email === currentUser.email && u.organizationId === currentUser.organizationId) ? updatedUser : u);
    setUsers(updatedUsers);
    setCurrentUser(updatedUser);
    alert('Profile updated successfully!');
  };

  const handleUpdateScratchpad = (docId: string, content: string) => {
      setDocuments(prevDocs => prevDocs.map(doc => 
          doc.id === docId ? { ...doc, scratchpadContent: content } : doc
      ));
      // Broadcast this change to other tabs
      if (currentUser) {
          const event = { type: 'doc-scratchpad-update', docId, user: currentUser, content };
          localStorage.setItem('engiFlowCollaborationEvent', JSON.stringify(event));
      }
  };


  const handleInviteUser = (email: string, role: UserRole) => {
    if (!currentUser) return;
    if (users.some(u => u.email === email && u.organizationId === currentUser.organizationId)) {
      alert('User with this email already exists in your organization.');
      return;
    }
    const newUser: User = {
      name: email.split('@')[0], // Simple name generation
      email,
      role,
      organizationId: currentUser.organizationId,
      photoUrl: `https://i.pravatar.cc/150?u=${email}`,
      status: 'pending',
    };
    setUsers(prev => [...prev, newUser]);
    setIsInviteUserModalOpen(false);
  };

  const handleSubscriptionUpgrade = () => {
    if (!currentOrganization) return;
    if (window.confirm(`Are you sure you want to upgrade ${currentOrganization.name} to the Pro plan?`)) {
        setOrganizations(prevOrgs => prevOrgs.map(org => 
            org.id === currentOrganization.id 
                ? { ...org, subscription: { ...org.subscription, plan: 'Pro' } }
                : org
        ));
        alert('Subscription upgraded successfully!');
    }
  };
  
  const handleAddTask = (title: string, date: string, priority: TaskPriority) => {
    if (!currentUser || !title.trim()) return;
    const newTask: Task = { id: `task-${Date.now()}`, userEmail: currentUser.email, date, title: title.trim(), isCompleted: false, priority, organizationId: currentUser.organizationId };
    setTasks(prev => [...prev, newTask]);
  };
  
  const handleAddNewNote = (): string => {
    if (!currentUser) return '';
    const now = new Date().toISOString();
    const newNote: Note = { id: `note-${Date.now()}`, userEmail: currentUser.email, title: 'Untitled Note', content: '', createdAt: now, updatedAt: now, organizationId: currentUser.organizationId };
    setNotes(prev => [newNote, ...prev]);
    return newNote.id;
  };
  
  const handleSendMessage = (receiverEmail: string, text: string) => {
    if (!currentUser || !text.trim()) return;
    const newMessage: ChatMessage = { id: `msg-${Date.now()}`, senderEmail: currentUser.email, receiverEmail, text: text.trim(), timestamp: new Date().toISOString(), organizationId: currentUser.organizationId };
    setMessages(prev => [...prev, newMessage]);
  };
  
  const handleInitiateCall = (user: User) => {
    setActiveCall({ user, type: 'outgoing' });
    setView('calling');
  };

  const handleEndCall = () => {
    setActiveCall(null);
    setView('chat');
  };

  // --- Derived State (Tenant-Aware) ---
  const userDocuments = useMemo(() => {
    if (!currentUser) return [];
    return organizationDocuments.filter(doc => 
        doc.isLatest && 
        (doc.uploadedBy.email === currentUser.email ||
        doc.reviewers.some(r => r.email === currentUser.email))
    );
  }, [organizationDocuments, currentUser]);

  const documentsForView = useMemo(() => {
    if (selectedProjectCode) {
      return userDocuments.filter(doc => doc.projectCode === selectedProjectCode);
    }
    return userDocuments;
  }, [userDocuments, selectedProjectCode]);

  const handleUpdateStatus = (docId: string, status: DocumentStatus, _user: string, comment: string = '') => {
    handleRequestESign({ type: 'statusUpdate', docId, status, comment });
  };
  
  const handleAddComment = (docId: string, comment: string) => {
    handleRequestESign({ type: 'comment', docId, comment });
  };

  const selectedDocument = useMemo(() => {
    return organizationDocuments.find(doc => doc.id === selectedDocumentId);
  }, [organizationDocuments, selectedDocumentId]);

  const selectedProject = useMemo(() => {
    return organizationProjects.find(p => p.projectCode === selectedProjectCode);
  }, [organizationProjects, selectedProjectCode]);
  
  // --- Auth & Main View Rendering ---
  if (!currentUser) {
    return (
      <AuthLayout 
        onLogin={handleLogin}
        onRegister={handleRegister}
        users={users}
        organizations={organizations}
        onFindOrganization={handleFindOrganization}
        onFindUserInOrg={handleFindUserInOrg}
      />
    );
  }

  if (currentUser.status === 'pending') {
    return <SetPasswordView onSetPassword={handleSetPassword} currentUser={currentUser} />;
  }

  const renderView = () => {
    if (!currentOrganization) {
      return <div className="p-8 text-center">Error: Could not load organization data. Please try logging in again.</div>;
    }

    switch (view) {
      case 'dashboard':
        return <Dashboard documents={userDocuments} onViewDocument={handleSelectDocument} theme={theme} currentUser={currentUser} />;
      case 'projects':
        return <Projects 
                  projects={organizationProjects} 
                  currentUser={currentUser}
                  onSelectProject={handleSelectProject} 
                  onAddNewProject={() => setIsAddProjectModalOpen(true)}
                  onEditProject={handleOpenEditProjectModal}
                  onDeleteProject={handleDeleteProject}
                />;
      case 'documents':
        return (
          <DocumentList
            documents={documentsForView}
            onSelectDocument={handleSelectDocument}
            projectName={selectedProject?.name}
            onBackToProjects={selectedProjectCode ? () => handleViewChange('projects') : undefined}
            currentUser={currentUser}
          />
        );
      case 'detail':
        if (selectedDocument) {
           const documentRevisions = organizationDocuments
            .filter(d => d.name === selectedDocument.name && d.projectCode === selectedDocument.projectCode)
            .sort((a, b) => b.version - a.version);

          return (
            <DocumentDetail
              document={selectedDocument}
              onUpdateStatus={handleUpdateStatus}
              onAddComment={handleAddComment}
              onSetReminder={() => {}} 
              currentUser={currentUser}
              users={organizationUsers}
              revisions={documentRevisions}
              onSelectRevision={handleSelectDocument}
              currentOrganization={currentOrganization}
              activeCollaborators={activeCollaborators[selectedDocument.id] || []}
              onUpdateScratchpad={handleUpdateScratchpad}
            />
          );
        }
        return null;
      case 'profile':
        return <Profile currentUser={currentUser} onUpdateUser={handleUpdateUser} />;
      case 'search':
        return <GlobalSearch documents={organizationDocuments} users={organizationUsers} projects={organizationProjects} onSelectDocument={handleSelectDocument} currentUser={currentUser} />;
      case 'calendar':
        return <CalendarView 
                  documents={userDocuments}
                  tasks={tasks.filter(t => t.userEmail === currentUser.email && t.organizationId === currentUser.organizationId)}
                  holidays={INDIAN_HOLIDAYS}
                  onAddTask={handleAddTask}
                  onToggleTask={(id) => setTasks(prev => prev.map(t => t.id === id ? { ...t, isCompleted: !t.isCompleted } : t))}
                  onDeleteTask={(id) => setTasks(prev => prev.filter(t => t.id !== id))}
                  onViewDocument={handleSelectDocument}
               />;
      case 'notes':
        return <NotesView
                  notes={notes.filter(n => n.userEmail === currentUser.email && n.organizationId === currentUser.organizationId)}
                  onAddNote={handleAddNewNote}
                  onUpdateNote={(id, title, content) => setNotes(prev => prev.map(n => n.id === id ? { ...n, title, content, updatedAt: new Date().toISOString() } : n))}
                  onDeleteNote={(id) => setNotes(prev => prev.filter(n => n.id !== id))}
                />;
      case 'chat':
        return <ChatView
                  currentUser={currentUser}
                  users={organizationUsers}
                  messages={messages.filter(m => m.organizationId === currentUser.organizationId)}
                  onSendMessage={handleSendMessage}
                  onInitiateCall={handleInitiateCall}
                />;
      case 'settings':
        if (currentUser.role === 'Admin') {
            return <SettingsView
                organization={currentOrganization}
                users={organizationUsers}
                onInviteUser={() => setIsInviteUserModalOpen(true)}
                onUpgradeSubscription={handleSubscriptionUpgrade}
            />;
        }
        return null;
      case 'calling':
        return null;
      default:
        return null;
    }
  };

  const getHeaderText = () => {
    if (view === 'detail' && selectedDocument) return 'Document Details';
    if (view === 'documents' && selectedProject) return `Project: ${selectedProject.name}`;
    switch (view) {
      case 'dashboard': return 'Dashboard';
      case 'projects': return 'Projects';
      case 'documents': return 'All Documents';
      case 'profile': return 'User Profile';
      case 'search': return 'Global Search';
      case 'calendar': return 'Calendar';
      case 'notes': return 'Notes';
      case 'chat': return 'Team Chat';
      case 'settings': return 'Organization Settings';
      default: return 'EngiFlow';
    }
  };

  if (view === 'calling' && activeCall) {
    return <CallingView activeCall={activeCall} onEndCall={handleEndCall} />;
  }

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100 font-sans">
      <Sidebar 
        currentView={view} 
        setView={handleViewChange} 
        theme={theme} 
        onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} 
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        currentUser={currentUser}
        organizationName={currentOrganization?.name || 'My Org'}
        onLogout={handleLogout}
      />
      {isSidebarOpen && <div onClick={() => setIsSidebarOpen(false)} className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden" aria-hidden="true"></div>}

      <main className="flex-1 flex flex-col overflow-hidden transition-all duration-300">
        <header className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border-b dark:border-gray-700 shadow-sm">
          <div className="flex items-center">
            <button onClick={() => setIsSidebarOpen(true)} className="md:hidden mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700" aria-label="Open sidebar"><MenuIcon className="w-6 h-6" /></button>
            {view === 'detail' && <button onClick={handleBack} className="mr-4 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"><ArrowLeftIcon className="w-6 h-6" /></button>}
            <h1 className="text-xl md:text-2xl font-semibold text-gray-800 dark:text-white">{getHeaderText()}</h1>
          </div>
          <div className="flex items-center space-x-2 md:space-x-4">
            <button
                onClick={handleRefresh}
                className="p-2 rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Refresh and Sync Data"
                aria-label="Refresh and Sync Data"
            >
              <RefreshIcon className="w-5 h-5" />
            </button>
            <button onClick={() => setIsModalOpen(true)} className="flex items-center bg-blue-600 text-white px-3 md:px-4 py-2 rounded-lg hover:bg-blue-700 transition">
              <PlusIcon className="w-5 h-5 md:mr-2" />
              <span className="hidden md:inline">Upload Document</span>
            </button>
            <Notifications
                notifications={organizationNotifications.filter(n => n.recipientEmail === currentUser.email).sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())}
                onViewDocument={handleSelectDocument}
                onMarkAsRead={handleMarkNotificationAsRead}
                onMarkAllAsRead={handleMarkAllNotificationsAsRead}
            />
             <div className="flex items-center space-x-4">
                <SyncStatusIndicator lastSyncTime={lastSyncTime} />
                <div className="flex items-center space-x-2">
                    <img src={currentUser.photoUrl || `https://i.pravatar.cc/150?u=${currentUser.email}`} alt={currentUser.name} className="w-10 h-10 rounded-full" />
                    <div className="hidden sm:block">
                        <div className="font-semibold">{currentUser.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">{currentUser.email}</div>
                    </div>
                </div>
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-x-hidden overflow-y-auto p-3 sm:p-6">
          {renderView()}
        </div>
      </main>

      {isModalOpen && <UploadModal onClose={() => setIsModalOpen(false)} onAddDocument={handleAddDocument} currentUser={currentUser} projects={organizationProjects} users={organizationUsers} projectCode={selectedProjectCode} />}
      {isAddProjectModalOpen && <AddProjectModal onClose={() => setIsAddProjectModalOpen(false)} onAddProject={handleAddProject} users={organizationUsers} />}
      {isEditProjectModalOpen && projectToEdit && <EditProjectModal onClose={() => setIsEditProjectModalOpen(false)} onUpdateProject={handleUpdateProject} project={projectToEdit} users={organizationUsers} />}
      {isESignModalOpen && eSignAction && <ESignModal isOpen={isESignModalOpen} onClose={() => setIsESignModalOpen(false)} onConfirm={handleConfirmESign} actionType={eSignAction.type === 'statusUpdate' ? `${eSignAction.status}` : 'Comment'} />}
      {isInviteUserModalOpen && <InviteUserModal isOpen={isInviteUserModalOpen} onClose={() => setIsInviteUserModalOpen(false)} onInvite={handleInviteUser} />}
    </div>
  );
};

export default App;