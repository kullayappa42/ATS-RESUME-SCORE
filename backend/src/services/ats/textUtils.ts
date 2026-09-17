// Text normalization + section/signal detection for ATS scoring.
export function normalizeText(input: string): string {
  return (input || '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}+#./\s-]/gu, ' ')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}
function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
/** Word-boundary regex for a skill/alias phrase (case-insensitive). */
export function phraseRegex(phrase: string): RegExp {
  const tokens = phrase.trim().split(/\s+/).map(escapeRegExp);
  const pattern = tokens.join('[\\s._/\\-]*');
  return new RegExp(`(?<![\\p{L}\\p{N}+#])${pattern}(?![\\p{L}\\p{N}+#])`, 'iu');
}
export function containsPhrase(rawLower: string, phrase: string): boolean {
  try {
    return phraseRegex(phrase).test(rawLower);
  } catch {
    return rawLower.includes(phrase.toLowerCase());
  }
}
export interface SectionCheck {
  key: string;
  label: string;
  found: boolean;
}
const SECTION_PATTERNS: { key: string; label: string; patterns: RegExp[] }[] = [
  { key: 'contact', label: 'Contact Information', patterns: [/[\w.+-]+@[\w-]+\.[\w.]+/, /(\+?\d[\d\s-]{7,}\d)/] },
  { key: 'summary', label: 'Professional Summary', patterns: [/\b(summary|objective|profile|about me|career objective)\b/i] },
  { key: 'education', label: 'Education', patterns: [/\b(education|academic|university|college|b\.?tech|bachelor|master|m\.?tech|bca|mca|degree|cgpa|gpa)\b/i] },
  { key: 'skills', label: 'Technical Skills', patterns: [/\b(skills|technical skills|tech stack|technologies|core competencies)\b/i] },
  { key: 'projects', label: 'Projects', patterns: [/\b(projects?|personal projects?|academic projects?)\b/i] },
  { key: 'experience', label: 'Experience', patterns: [/\b(experience|work experience|employment|internship|internships|work history)\b/i] },
  { key: 'certifications', label: 'Certifications', patterns: [/\b(certifications?|certified|certificate|coursera|udemy|credentials)\b/i] },
];
export function analyzeSections(rawText: string): SectionCheck[] {
  return SECTION_PATTERNS.map((s) => ({
    key: s.key,
    label: s.label,
    found: s.patterns.some((re) => re.test(rawText)),
  }));
}
