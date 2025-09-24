import type { User, Project, Document, Organization, UserRole, DocumentDiscipline, DocumentStatus, ReviewerRole } from '../types';

// Sample data pools for realistic generation
const FIRST_NAMES = ['Aarav', 'Vivaan', 'Aditya', 'Vihaan', 'Arjun', 'Sai', 'Reyansh', 'Ayaan', 'Krishna', 'Ishaan', 'Saanvi', 'Aanya', 'Aadhya', 'Aaradhya', 'Ananya', 'Pari', 'Diya', 'Myra', 'Anika', 'Avni'];
const LAST_NAMES = ['Patel', 'Sharma', 'Singh', 'Kumar', 'Gupta', 'Shah', 'Mehta', 'Joshi', 'Verma', 'Khan', 'Reddy', 'Menon', 'Nair', 'Iyer', 'Rao'];
const PROJECT_NOUNS = ['Phoenix', 'Odyssey', 'Stardust', 'Nebula', 'Orion', 'Vanguard', 'Apex', 'Pinnacle', 'Horizon', 'Catalyst'];
const PROJECT_ADJECTIVES = ['Sustainable', 'Next-Gen', 'Advanced', 'Integrated', 'Automated', 'Modular', 'Dynamic', 'Resilient'];
const DOC_TYPES = ['PDF', 'DWG', 'XLSX', 'DOCX'];
const DISCIPLINES: DocumentDiscipline[] = ['Civil', 'Structural', 'Mechanical', 'Electrical', 'Control & Instruments', 'General', 'Contract'];
const STATUSES: DocumentStatus[] = ['Approved', 'Rejected', 'In Review', 'Commented', 'In Progress'];
const REVIEWER_ROLES: ReviewerRole[] = ['Approver', 'Commenter', 'Viewer'];

/**
 * Helper to get a random item from an array.
 * @param arr The array to pick from.
 * @returns A random item from the array.
 */
const getRandom = <T,>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];

/**
 * Generates a large-scale dataset for performance and scalability testing.
 * @param org The organization to generate data for.
 * @param userCount The total number of users to generate.
 * @param projectCount The number of projects to generate.
 * @param docsPerProject The number of documents to generate for each project.
 * @param existingUsers An optional array of users to include, who will not be regenerated.
 * @returns An object containing the generated users, projects, and documents.
 */
export const generateLargeScaleData = (
    org: Organization,
    userCount: number,
    projectCount: number,
    docsPerProject: number,
    existingUsers: User[] = []
) => {
    const users: User[] = [...existingUsers];
    const projects: Project[] = [];
    const documents: Document[] = [];

    // 1. Generate Users
    for (let i = 0; i < userCount - existingUsers.length; i++) {
        const firstName = getRandom(FIRST_NAMES);
        const lastName = getRandom(LAST_NAMES);
        const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${i}@innovatech.com`;
        users.push({
            name: `${firstName} ${lastName}`,
            email,
            password: 'password123',
            photoUrl: `https://i.pravatar.cc/150?u=${email}`,
            role: Math.random() > 0.9 ? 'Admin' : 'Member', // 10% admins
            organizationId: org.id,
            status: Math.random() > 0.1 ? 'pending' : 'active', // 10% pending
        });
    }

    // 2. Generate Projects
    for (let i = 0; i < projectCount; i++) {
        const projectCode = `${getRandom(PROJECT_NOUNS).substring(0, 3).toUpperCase()}-${String(i + 10).padStart(3, '0')}`;
        // Assign a team to the project
        const teamSize = Math.floor(Math.random() * 15) + 5; // 5-20 members
        const team = [...new Array(teamSize)].map(() => getRandom(users).email);
        projects.push({
            id: `proj-gen-${i}`,
            name: `${getRandom(PROJECT_ADJECTIVES)} ${getRandom(PROJECT_NOUNS)}`,
            description: 'A large-scale generated project for performance testing and user scalability, focusing on advanced engineering principles.',
            lastUpdated: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000).toISOString(),
            projectCode,
            organizationId: org.id,
            team: [...new Set(team)], // Ensure unique team members
        });
    }

    // 3. Generate Documents
    projects.forEach(project => {
        for (let i = 0; i < docsPerProject; i++) {
            const uploader = getRandom(users.filter(u => u.status === 'active'));
            const reviewersCount = Math.floor(Math.random() * 5) + 2; // 2-7 reviewers
            const reviewers = [...new Array(reviewersCount)].map(() => ({
                email: getRandom(users.filter(u => u.email !== uploader.email)).email,
                role: getRandom(REVIEWER_ROLES),
            }));
            const uploadDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
            const status = getRandom(STATUSES);

            documents.push({
                id: `doc-gen-${project.projectCode}-${i}`,
                name: `${project.name.replace(/ /g, '_')}_document_${i}.${getRandom(DOC_TYPES).toLowerCase()}`,
                type: getRandom(DOC_TYPES),
                uploadedBy: uploader,
                uploadDate: uploadDate.toISOString(),
                status: status,
                discipline: getRandom(DISCIPLINES),
                reviewers: [...new Map(reviewers.map(item => [item.email, item])).values()], // Ensure unique reviewers
                history: [
                    { status: 'In Review', date: uploadDate.toISOString(), user: uploader.name, userEmail: uploader.email, comment: 'Initial revision uploaded for review.', version: 0 },
                ],
                projectCode: project.projectCode,
                version: 0,
                isLatest: true,
                organizationId: org.id,
                scratchpadContent: `Initial notes for ${project.name.replace(/ /g, '_')}_document_${i}.`
            });
        }
    });

    return { users, projects, documents };
};
