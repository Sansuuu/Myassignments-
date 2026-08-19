import { Assignment } from '../types';

export function buildAssignmentPrompt(assignment: Assignment): string {
  const lines: string[] = [
    `I am a 1st Year BTech CSE student studying ${assignment.subjectName} (${assignment.subjectCode}).`,
    ``,
    `Here is my class assignment details:`,
    `• Title: ${assignment.title}`,
    `• Subject: ${assignment.subjectName} [${assignment.subjectCode}]`,
    `• Deadline: ${assignment.dueDate} ${assignment.dueTime ? `at ${assignment.dueTime}` : ''}`,
    assignment.teacher ? `• Faculty: ${assignment.teacher}` : '',
    ``,
    `Problem Statement / Task:`,
    assignment.description || 'No description provided.',
    ``,
    assignment.instructions ? `Submission Guidelines / Instructions:\n${assignment.instructions}\n` : '',
    `Please assist me with:`,
    `1. Comprehensive step-by-step conceptual explanation and intuition.`,
    `2. Clear algorithm / pseudocode and production-quality, well-commented code solution (in C/C++/Python/Java as appropriate).`,
    `3. Key edge cases, time/space complexity analysis (Big-O), and common viva/exam questions on this topic.`,
  ];

  return lines.filter((l) => l !== '').join('\n');
}

export function buildCustomCSEPrompt(subject: string, topic: string, question: string, templateType?: string): string {
  let instructions = 'Provide a structured, step-by-step academic explanation with code/diagrams as needed.';

  if (templateType === 'debug') {
    instructions = 'Analyze this code snippet, point out the exact syntax/logic/memory bugs, and provide the fixed code with explanations.';
  } else if (templateType === 'math') {
    instructions = 'Provide a rigorous, step-by-step proof, truth tables/derivation, and intuitive real-world CSE applications.';
  } else if (templateType === 'notes') {
    instructions = 'Generate concise, high-yield exam revision notes, key definitions, formulas, and 3 high-probability university exam questions.';
  }

  return [
    `Context: BTech Computer Science & Engineering - ${subject || 'Computer Science'}.`,
    topic ? `Topic: ${topic}` : '',
    ``,
    `Question / Problem:`,
    question,
    ``,
    `Guidance Request:`,
    instructions,
  ].filter(Boolean).join('\n');
}

export async function copyTextToClipboard(text: string): Promise<boolean> {
  try {
    if (navigator?.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    const successful = document.execCommand('copy');
    document.body.removeChild(textarea);
    return successful;
  } catch (err) {
    console.warn('Clipboard copy failed:', err);
    return false;
  }
}

export async function launchInChatGPT(prompt: string, onNotify?: (msg: string, type?: 'success' | 'info') => void) {
  await copyTextToClipboard(prompt);
  if (onNotify) {
    onNotify('Prompt copied to clipboard! Opening ChatGPT...', 'success');
  }
  
  // ChatGPT supports ?q= parameter for direct pre-filling
  // If prompt is too long, it opens base chat with prompt copied in clipboard
  const url = prompt.length < 1500 
    ? `https://chatgpt.com/?q=${encodeURIComponent(prompt)}`
    : `https://chatgpt.com`;

  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function launchInGemini(prompt: string, onNotify?: (msg: string, type?: 'success' | 'info') => void) {
  await copyTextToClipboard(prompt);
  if (onNotify) {
    onNotify('Prompt copied to clipboard! Paste directly into Gemini (Ctrl+V)', 'success');
  }
  
  // Opens Google Gemini app
  window.open('https://gemini.google.com/app', '_blank', 'noopener,noreferrer');
}

export async function launchInClaude(prompt: string, onNotify?: (msg: string, type?: 'success' | 'info') => void) {
  await copyTextToClipboard(prompt);
  if (onNotify) {
    onNotify('Prompt copied! Opening Claude.ai (paste with Ctrl+V)...', 'info');
  }
  window.open('https://claude.ai/new', '_blank', 'noopener,noreferrer');
}

export async function launchInPerplexity(prompt: string, onNotify?: (msg: string, type?: 'success' | 'info') => void) {
  await copyTextToClipboard(prompt);
  if (onNotify) {
    onNotify('Opening Perplexity AI Search...', 'info');
  }
  const url = `https://www.perplexity.ai/search?q=${encodeURIComponent(prompt.slice(0, 500))}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}
