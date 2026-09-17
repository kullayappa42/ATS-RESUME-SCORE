import { GLOBAL_SYNONYMS, CareerProfile } from './careerProfiles';
import { analyzeSections, containsPhrase } from './textUtils';
import { buildRest } from './scorerRest';
import type { CategoryScore } from './scorerRest';
export interface AtsResult {
  total: number; status: 'GOOD' | 'MEDIUM' | 'LOW';
  categories: Record<string, CategoryScore>;
  matchedSkills: string[]; missingSkills: string[];
  keywordsFound: string[]; keywordsMissing: string[];
  sections: { key: string; label: string; found: boolean }[];
  suggestions: { title: string; body: string }[];
  formattingIssues: string[]; charCount: number; disclaimer: string;
}
function aliasesFor(skill: string): string[] {
  const out = new Set<string>([skill]);
  const g = GLOBAL_SYNONYMS[skill];
  if (g) g.forEach((a) => out.add(a));
  const low = skill.toLowerCase();
  if (low === 'rest api') { out.add('rest'); out.add('restful'); out.add('restful api'); }
  if (low === 'node.js') { out.add('node'); out.add('nodejs'); }
  if (low === 'javascript') out.add('js');
  if (low === 'scikit-learn') out.add('sklearn');
  if (low === 'power bi') out.add('powerbi');
  if (low === 'spring boot') out.add('springboot');
  return [...out];
}
function skillPresent(rawLower: string, skill: string): boolean {
  return aliasesFor(skill).some((a) => containsPhrase(rawLower, a));
}
export function scoreStatus(total: number): 'GOOD' | 'MEDIUM' | 'LOW' {
  if (total >= 75) return 'GOOD';
  if (total >= 50) return 'MEDIUM';
  return 'LOW';
}
export function analyzeResume(rawText: string, profile: CareerProfile): AtsResult {
  const rawLower = (rawText || '').toLowerCase();
  // 1. Skills Match (30)
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  for (const s of profile.skills) {
    if (skillPresent(rawLower, s)) matchedSkills.push(s);
    else missingSkills.push(s);
  }
  const skillsRatio = profile.skills.length ? matchedSkills.length / profile.skills.length : 0;
  const skillsScore = Math.round(skillsRatio * 30);
  // 2. Keywords (15) — dedupe, no double counting
  const seen = new Set<string>();
  const keywordsFound: string[] = [];
  const keywordsMissing: string[] = [];
  for (const k of profile.keywords) {
    const key = k.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    if (skillPresent(rawLower, k)) keywordsFound.push(k);
    else keywordsMissing.push(k);
  }
  const kwRatio = profile.keywords.length ? keywordsFound.length / profile.keywords.length : 0;
  const keywordsScore = Math.round(kwRatio * 15);
  // 3. Sections / structure (15)
  const sections = analyzeSections(rawText);
  const foundCount = sections.filter((s) => s.found).length;
  const structureScore = Math.round((foundCount / sections.length) * 15);
  void skillsScore;
  void keywordsScore;
  void structureScore;
  return buildRest(rawText, rawLower, profile, matchedSkills, missingSkills,
    keywordsFound, keywordsMissing, sections,
    { score: skillsScore, max: 30, label: 'Skills Match', detail: `${matchedSkills.length}/${profile.skills.length} role skills found` },
    { score: keywordsScore, max: 15, label: 'Keywords', detail: `${keywordsFound.length}/${profile.keywords.length} role keywords found` },
    { score: structureScore, max: 15, label: 'Resume Structure', detail: `${foundCount}/${sections.length} standard sections found` });
}
