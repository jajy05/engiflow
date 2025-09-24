import { GoogleGenAI } from "@google/genai";
import type { Reviewer, DocumentStatus, HistoryEntry } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * Generates a professional email notifying reviewers about a new document using the Gemini API.
 * 
 * @param documentName The name of the document to be reviewed.
 * @param reviewers A list of reviewer objects with email and role.
 * @param projectName An optional project name for context.
 * @returns A promise that resolves to a formatted email string.
 */
export const generateReviewEmail = async (
  documentName: string,
  reviewers: Reviewer[],
  projectName?: string
): Promise<string> => {
  const reviewerDetails = reviewers.map(r => `- ${r.email} (Role: ${r.role})`).join('\n');
  const projectLine = projectName ? `Project: ${projectName}` : '';
  
  const prompt = `Generate a professional email to notify a team about a new document for review.
The document is named "${documentName}".
${projectLine ? `It's part of the project: "${projectName}".` : ''}
The reviewers are:
${reviewerDetails}

The email should have a clear subject line.
The body should inform them the document requires their attention on the EngiFlow platform and state their roles.
Keep it professional and concise. Sign off as "EngiFlow System".
Output only the full email content, including a subject line like "Subject: ...".`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

/**
 * Generates an email notifying all participants about a status change on a document using the Gemini API.
 * 
 * @param documentName The name of the document.
 * @param status The new status of the document.
 * @param updatedBy The name of the user who made the change.
 * @param comment An optional comment with the status change.
 * @param participants A list of email addresses of participants (for context).
 * @returns A promise that resolves to a formatted email string.
 */
export const generateStatusUpdateEmail = async (
  documentName: string,
  status: DocumentStatus,
  updatedBy: string,
  comment: string | undefined,
  participants: string[]
): Promise<string> => {
    const prompt = `Generate a professional email to notify participants about a status update for a document.
Document Name: "${documentName}"
New Status: ${status}
Updated By: ${updatedBy}
Date: ${new Date().toLocaleString()}
Comment: ${comment || 'No comment was provided.'}

The email should have a clear subject line indicating the document and its new status.
The body should summarize the update details.
Sign off as "The EngiFlow System".
Output only the full email content, including a subject line like "Subject: ...".`;

    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
};

/**
 * Generates a summary of a document based on its name and history using the Gemini API.
 *
 * @param documentName The name of the document.
 * @param history The review history of the document.
 * @returns A promise that resolves to a summary string.
 */
export const generateDocumentSummary = async (
  documentName: string,
  history: HistoryEntry[]
): Promise<string> => {
  const prompt = `Summarize the following document's activity. The document is named "${documentName}".
Its review history is: ${JSON.stringify(history, null, 2)}.
Provide a brief, professional summary of the document's journey, key activities, and its current state based on the history.
Focus on the flow of statuses, who performed the actions, and any significant comments. Keep it to a few sentences.`;
  
  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};

/**
 * Converts note content from HTML to a specified format using the Gemini API.
 *
 * @param title The title of the note.
 * @param htmlContent The HTML content of the note.
 * @param targetFormat The desired output format (e.g., 'markdown', 'plaintext').
 * @returns A promise that resolves to the converted content string.
 */
export const convertNoteContent = async (
  title: string,
  htmlContent: string,
  targetFormat: 'markdown' | 'plaintext'
): Promise<string> => {
  const formatDescription = {
    markdown: 'GitHub Flavored Markdown. Preserve formatting like headings (if any), bold, italics, and lists.',
    plaintext: 'Plain text. Remove all HTML tags and formatting, preserving line breaks for readability.',
  };

  const prompt = `Convert the following note content from HTML to ${targetFormat}.
Note Title: "${title}"
HTML Content:
\`\`\`html
${htmlContent}
\`\`\`

Instructions:
- The output should be only the converted content, without any explanations or surrounding text.
- Convert the content into ${formatDescription[targetFormat]}`;

  const response = await ai.models.generateContent({
    model: 'gemini-2.5-flash',
    contents: prompt,
  });

  return response.text;
};
