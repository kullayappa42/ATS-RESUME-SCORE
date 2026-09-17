// Optional: Resume vs Job-Description match. Separate from base ATS score.
import { containsPhrase } from './textUtils';

export interface JdMatch {
  matchScore: number;
  matchingKeywords: string[];
  missingKeywords: string[];
  note: string;
}
const STOP = new Set([
  'and', 'the', 'for', 'with', 'you', 'your', 'our', 'are', 'will', 'have', 'has',
  'from', 'that', 'this', 'role', 'job', 'work', 'team', 'ability', 'strong',
  'plus', 'etc', 'including', 'ideal', 'looking', 'seeking', 'must', 'should',
]);
function jdKeywords(jd: string): string[] {
  const words = (jd || '').toLowerCase().replace(/[^a-z0-9+#./\s-]/g, ' ').split(/\s+/);
  const freq = new Map<string, number>();
  for (const w of words) {
    const t = w.trim();
    if (t.length < 3 || STOP.has(t) || /^\d+$/.test(t)) continue;
    freq.set(t, (freq.get(t) || 0) + 1);
  }
  return [...freq.entries()].sort((a, b) => b[1] - a[1]).slice(0, 30).map(([w]) => w);
}
export function matchJobDescription(resumeText: string, jdText: string, roleKeywords: string[] = []): JdMatch {
  const resumeLower = (resumeText || '').toLowerCase();
  const jdTerms = jdKeywords(jdText);
  const pool = [...new Set([...(roleKeywords || []), ...jdTerms])].slice(0, 30);
  const matching: string[] = [];
  const missing: string[] = [];
  for (const term of pool) {
    if (containsPhrase(resumeLower, term)) matching.push(term);
    else missing.push(term);
  }
  const matchScore = pool.length ? Math.round((matching.length / pool.length) * 100) : 0;
  return {
    matchScore, matchingKeywords: matching.slice(0, 20), missingKeywords: missing.slice(0, 20),
    note: 'Job-description match is informational and separate from the base ATS score.',
  };
}
// Improvement snippets rewritten ONLY from resume evidence (no fabrication).
export function improvementPlan(resumeText: string, missingSkills: string[], careerTitle: string) {
  const hasSummary = /(summary|objective|profile)/i.test(resumeText);
  const top = missingSkills.slice(0, 5);
  return {
    summary: hasSummary
      ? `Tighten your existing summary to name ${careerTitle} as your target and your strongest genuine skills. Keep it to 2-3 lines; do not add experience you do not have.`
      : `Add a 2-3 line professional summary targeting ${careerTitle}. Mention only skills and projects already present in your resume.`,
    skills: top.length
      ? `If truthful, add: ${top.join(', ')}. Group them (Languages / Frameworks / Tools) and remove anything you cannot demonstrate.`
      : 'Your skills section already covers the core role skills. Keep it grouped and remove outdated items.',
    projects: 'Rewrite each project as: Action verb + what you built + tools actually used + real outcome. Add numbers only if they are true (users, records, time saved).',
    experience: 'List internships or relevant coursework with dates, your actual role, and 2-3 bullets each. Fresher? Label class projects clearly as Academic Projects.',
    certifications: 'List only earned certifications with issuer and year. Omit "in progress" unless you name the expected completion honestly.',
  };
}
