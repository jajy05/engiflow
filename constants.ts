import type { Document, User, Project, DocumentDiscipline, Organization } from './types';
import { CivilIcon } from './components/icons/CivilIcon';
import { StructuralIcon } from './components/icons/StructuralIcon';
import { MechanicalIcon } from './components/icons/MechanicalIcon';
import { ElectricalIcon } from './components/icons/ElectricalIcon';
import { ControlInstrumentsIcon } from './components/icons/ControlInstrumentsIcon';
import { GeneralIcon } from './components/icons/GeneralIcon';
import { ContractIcon } from './components/icons/ContractIcon';
import { generateLargeScaleData } from './services/dataGenerator';

export const APP_NAME = "EngiFlow";

export const DOCUMENT_DISCIPLINES: { id: DocumentDiscipline; name: string; icon: React.FC<React.SVGProps<SVGSVGElement>> }[] = [
    { id: 'Civil', name: 'Civil Engineering', icon: CivilIcon },
    { id: 'Structural', name: 'Structural Drawings', icon: StructuralIcon },
    { id: 'Mechanical', name: 'Mechanical Drawings', icon: MechanicalIcon },
    { id: 'Electrical', name: 'Electrical', icon: ElectricalIcon },
    { id: 'Control & Instruments', name: 'Control & Instruments', icon: ControlInstrumentsIcon },
    { id: 'Contract', name: 'Contract Documents', icon: ContractIcon },
    { id: 'General', name: 'General Documents', icon: GeneralIcon },
];

// --- Multi-Tenant SaaS Data ---
export const ORG_ALPHA: Organization = {
  id: 'org_alpha_123',
  name: 'Innovatech Engineering',
  subscription: { plan: 'Pro', status: 'active', memberLimit: 1000 },
};

export const ORG_BETA: Organization = {
  id: 'org_beta_456',
  name: 'Apex Structural Solutions',
  subscription: { plan: 'Free', status: 'active', memberLimit: 5 },
};

export const ORGANIZATIONS: Organization[] = [ORG_ALPHA, ORG_BETA];


// --- SEED USERS ---
// These users will be included in the generated data for ORG_ALPHA
export const USER_ALICE: User = { name: 'Alice Johnson', email: 'alice.johnson@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=alice.johnson@example.com', role: 'Admin', organizationId: ORG_ALPHA.id, status: 'active' };
export const USER_BOB: User = { name: 'Bob Manager', email: 'bob.manager@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=bob.manager@example.com', role: 'Member', organizationId: ORG_ALPHA.id, status: 'active' };
export const USER_CHARLIE: User = { name: 'Charlie Lead', email: 'charlie.lead@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=charlie.lead@example.com', role: 'Member', organizationId: ORG_ALPHA.id, status: 'active' };
export const USER_DIANA: User = { name: 'Diana Prince', email: 'diana.prince@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=diana.prince@example.com', role: 'Member', organizationId: ORG_ALPHA.id, status: 'active' };
export const USER_FRANK: User = { name: 'Frank Castle', email: 'frank.castle@example.com', role: 'Member', organizationId: ORG_ALPHA.id, status: 'pending' };

// Static users for the second organization (ORG_BETA)
export const USER_DAVID: User = { name: 'David Chen', email: 'david.chen@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=david.chen@example.com', role: 'Admin', organizationId: ORG_BETA.id, status: 'active' };
export const USER_EVE: User = { name: 'Eve Williams', email: 'eve.williams@example.com', password: 'password123', photoUrl: 'https://i.pravatar.cc/150?u=eve.williams@example.com', role: 'Member', organizationId: ORG_BETA.id, status: 'active' };


// --- GENERATE LARGE SCALE DATA for ORG_ALPHA ---
const {
    users: generatedUsers,
    projects: generatedProjects,
    documents: generatedDocuments
} = generateLargeScaleData(ORG_ALPHA, 1000, 50, 20, [USER_ALICE, USER_BOB, USER_CHARLIE, USER_DIANA, USER_FRANK]);

export const USERS: User[] = [
  ...generatedUsers,
  USER_DAVID, 
  USER_EVE
];


// --- Indian Holidays (Global) ---
export const INDIAN_HOLIDAYS: { date: string, name: string }[] = [
  { date: '2024-01-26', name: 'Republic Day' },
  { date: '2024-03-25', name: 'Holi' },
  { date: '2024-08-15', name: 'Independence Day' },
  { date: '2024-10-02', name: 'Gandhi Jayanti' },
  { date: '2024-11-01', name: 'Diwali' },
  { date: '2025-01-26', name: 'Republic Day' },
  { date: '2025-03-14', name: 'Holi' },
  { date: '2025-08-15', name: 'Independence Day' },
  { date: '2025-10-02', name: 'Gandhi Jayanti' },
  { date: '2025-10-21', name: 'Diwali' },
];

// --- Projects ---
// Static projects for ORG_BETA
const ORG_BETA_PROJECTS: Project[] = [
   {
    id: 'proj-3',
    name: 'Downtown Tower',
    description: 'Structural integrity assessment for the new downtown high-rise.',
    lastUpdated: '2023-10-29T09:05:00Z',
    projectCode: 'DTT-001',
    organizationId: ORG_BETA.id,
    team: [USER_DAVID.email, USER_EVE.email],
  },
];

export const INITIAL_PROJECTS: Project[] = [
  ...generatedProjects,
  ...ORG_BETA_PROJECTS,
];

// --- Documents ---
// Static documents for ORG_BETA
const ORG_BETA_DOCUMENTS: Document[] = [
  {
    id: 'doc-3',
    name: 'Foundation_Plan_Rev2.pdf',
    type: 'PDF',
    uploadedBy: USER_DAVID,
    uploadDate: '2023-10-29T09:00:00Z',
    status: 'Rejected',
    discipline: 'Civil',
    reviewers: [
        { email: USER_EVE.email, role: 'Approver' }
    ],
    password: 'password789',
    history: [
       { status: 'In Review', date: '2023-10-29T09:05:00Z', user: USER_DAVID.name, userEmail: USER_DAVID.email, comment: 'Final check before submission.', version: 0 },
       { status: 'Rejected', date: '2023-10-29T16:45:00Z', user: USER_EVE.name, userEmail: USER_EVE.email, comment: 'Load calculations on page 5 are incorrect. Please revise.', version: 0 },
    ],
    projectCode: 'DTT-001',
    version: 0,
    isLatest: true,
    organizationId: ORG_BETA.id,
    scratchpadContent: 'This is a shared scratchpad for the foundation plan.',
  },
];

export const INITIAL_DOCUMENTS: Document[] = [
  ...generatedDocuments,
  ...ORG_BETA_DOCUMENTS,
];
