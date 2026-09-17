// Experience, education and formatting signals from extracted resume text.
import { phraseRegex } from './textUtils';
const PROJECT_SIGNALS = [
  'project', 'developed', 'built', 'created', 'implemented', 'designed',
  'deployed', 'github.com', 'live demo', 'demo', 'internship', 'intern',
  'experience', 'worked', 'contributed', 'led', 'managed', 'achieved',
];
export function experienceSignals(rawLower: string): { hits: string[]; hasMetrics: boolean; projectCount: number } {
  const hits = PROJECT_SIGNALS.filter((sig) => {
    try {
      return phraseRegex(sig).test(rawLower);
    } catch {
      return rawLower.includes(sig);
    }
  });
  const hasMetrics = /%|\b\d+\s*(%|\+|x|users|records|requests|ms|times|faster|reduced|improved|increased)/i.test(rawLower);
  const projectCount = (rawLower.match(/\bproject\b/gi) || []).length;
  return { hits, hasMetrics, projectCount };
}
const DEGREE_PATTERNS = [
  /\bb\.?\s?tech\b/i, /\bm\.?\s?tech\b/i, /\bbachelor/i, /\bmaster\b/i,
  /\bmba\b/i, /\bbca\b/i, /\bmca\b/i, /\bb\.?\s?sc\b/i, /\bm\.?\s?sc\b/i,
  /\bph\.?d\b/i, /\bdiploma\b/i, /\bdegree\b/i, /\buniversity\b/i,
  /\bcollege\b/i, /\bcgpa\b/i, /\bgpa\b/i,
];
export function educationSignals(rawText: string): { hits: number; hasDegree: boolean; hasScore: boolean } {
  let hits = 0;
  for (const re of DEGREE_PATTERNS) if (re.test(rawText)) hits += 1;
  const hasDegree = /b\.?\s?tech|m\.?\s?tech|bachelor|master|mba|bca|mca|degree|university|college/i.test(rawText);
  const hasScore = /cgpa|gpa|\d(\.\d+)?\s*\/\s*10|\b\d{2,3}\s*%/.test(rawText);
  return { hits, hasDegree, hasScore };
}
export interface FormattingCheck {
  charCount: number;
  lineCount: number;
  hasHeadings: boolean;
  bulletCount: number;
  tableLikeLines: number;
  issues: string[];
}
export function formattingSignals(rawText: string): FormattingCheck {
  const text = rawText || '';
  const lines = text.split(/\r?\n/);
  const charCount = text.length;
  const lineCount = lines.filter((l) => l.trim().length > 0).length;
  const headingHits = lines.filter((l) =>
    /^[A-Z][A-Z\s&/]{3,40}$/.test(l.trim()) ||
    /^(summary|skills|education|projects?|experience|certifications?|contact)\b/i.test(l.trim())
  ).length;
  const bulletCount = (text.match(/[•\-*▪►]/g) || []).length;
  const tableLikeLines = lines.filter((l) => (l.match(/\|/g) || []).length >= 2).length;
  const unusual = (text.match(/[�□■◆●★☆♠♣♥♦⬛⬜🔹🔸📌📍✅❌]/g) || []).length;
  const issues: string[] = [];
  if (charCount < 500) issues.push('Resume text is very short — it may be missing key sections or failed to extract.');
  if (lineCount < 15) issues.push('Few distinct lines detected — use clear line breaks and standard section headings.');
  if (headingHits < 2) issues.push('Add clear standard headings (Summary, Skills, Education, Projects, Experience).');
  if (tableLikeLines > 6) issues.push('Avoid heavy tables — many ATS parsers misread table layouts.');
  if (unusual > 10) issues.push('Avoid graphics, icons and unusual symbols — prefer plain text bullets.');
  if (bulletCount === 0) issues.push('Use simple bullet points for achievements and responsibilities.');
  return { charCount, lineCount, hasHeadings: headingHits >= 2, bulletCount, tableLikeLines, issues };
}
export function sanitizeExcerpt(text: string, max = 4000): string {
  return (text || '').replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '').slice(0, max);
}
