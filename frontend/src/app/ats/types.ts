// Shared ATS types between the wizard page and result components.
export type Stage = 1 | 2 | 3 | 4 | 5;
export interface Career {
  id: string; title: string; icon: string; tagline: string; skills: string[];
}
export interface CategoryScore { score: number; max: number; label: string; detail: string; }
export interface AtsAnalysisResult {
  id: string | null;
  candidate: { fullName: string; experienceLevel: string };
  career: { id: string; title: string; icon: string };
  file: { name: string; size: number };
  total: number; status: 'GOOD' | 'MEDIUM' | 'LOW';
  categories: Record<string, CategoryScore>;
  matchedSkills: string[]; missingSkills: string[];
  keywordsFound: string[]; keywordsMissing: string[];
  sections: { key: string; label: string; found: boolean }[];
  suggestions: { title: string; body: string }[];
  formattingIssues: string[]; charCount: number; disclaimer: string;
  jdMatch: { matchScore: number; matchingKeywords: string[]; missingKeywords: string[]; note: string } | null;
  improvementPlan: { summary: string; skills: string; projects: string; experience: string; certifications: string } | null;
}
export const STAGE_LABELS = ['Details', 'Career', 'Resume', 'Analysis', 'Results'];
