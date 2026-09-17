// Part 2 - experience, education, formatting, suggestions.
import { CareerProfile } from './careerProfiles';
import { educationSignals, experienceSignals, formattingSignals } from './signals';

export interface CategoryScore { score: number; max: number; label: string; detail: string; }

export function buildRest(
  rawText: string, rawLower: string, profile: CareerProfile,
  matchedSkills: string[], missingSkills: string[],
  keywordsFound: string[], keywordsMissing: string[],
  sections: { key: string; label: string; found: boolean }[],
  skillsCat: CategoryScore, keywordsCat: CategoryScore, structureCat: CategoryScore,
) {
  const exp = experienceSignals(rawLower);
  const hasProjects = sections.find((s) => s.key === 'projects')?.found;
  const hasExperience = sections.find((s) => s.key === 'experience')?.found;
  let expScore = 0;
  const expNotes: string[] = [];
  if (hasProjects) { expScore += 8; expNotes.push('projects section present'); }
  if (hasExperience) { expScore += 6; expNotes.push('experience/internship section present'); }
  if (exp.hits.length >= 4) { expScore += 3; expNotes.push('strong action verbs'); }
  else if (exp.hits.length >= 2) { expScore += 2; expNotes.push('some project language'); }
  if (exp.hasMetrics) { expScore += 3; expNotes.push('quantified results'); }
  expScore = Math.min(20, expScore);
  const edu = educationSignals(rawText);
  const hasEduSection = sections.find((s) => s.key === 'education')?.found;
  let eduScore = 0;
  if (hasEduSection) eduScore += 4;
  if (edu.hasDegree) eduScore += 4;
  if (edu.hasScore) eduScore += 2;
  eduScore = Math.min(10, eduScore);
  const fmt = formattingSignals(rawText);
  let fmtScore = 10;
  for (const issue of fmt.issues) {
    if (issue.startsWith('Resume text is very short')) fmtScore -= 4;
    else fmtScore -= 2;
  }
  fmtScore = Math.max(0, Math.min(10, fmtScore));
  const categories: Record<string, CategoryScore> = {
    skills: skillsCat,
    experience: { score: expScore, max: 20, label: 'Experience & Projects', detail: expNotes.join(', ') || 'add projects/internships with measurable outcomes' },
    structure: structureCat,
    keywords: keywordsCat,
    education: { score: eduScore, max: 10, label: 'Education', detail: hasEduSection ? 'education section with degree info' : 'add an education section with degree and scores' },
    formatting: { score: fmtScore, max: 10, label: 'ATS Formatting', detail: fmt.issues.length ? (fmt.issues[0] as string) : 'clean, parseable formatting' },
  };
  const total = skillsCat.score + expScore + structureCat.score + keywordsCat.score + eduScore + fmtScore;
  const status = total >= 75 ? 'GOOD' as const : total >= 50 ? 'MEDIUM' as const : 'LOW' as const;
  const suggestions = buildSuggestions(profile, missingSkills, sections, exp, fmt, keywordsMissing);
  return {
    total, status, categories,
    matchedSkills, missingSkills, keywordsFound,
    keywordsMissing: keywordsMissing.slice(0, 8),
    sections, suggestions, formattingIssues: fmt.issues,
    charCount: rawText.length,
    disclaimer: 'ATS Score is an estimate based on scoring criteria.',
  };
}

function buildSuggestions(
  profile: CareerProfile, missingSkills: string[],
  sections: { key: string; label: string; found: boolean }[],
  exp: { hits: string[]; hasMetrics: boolean; projectCount: number },
  fmt: { issues: string[] },
  keywordsMissing: string[],
) {
  const out: { title: string; body: string }[] = [];
  const missing = sections.filter((s) => !s.found);
  const topMissing = missingSkills.slice(0, 3);
  if (topMissing.length) {
    out.push({
      title: 'Improve Skills Section',
      body: `Add relevant technologies such as ${topMissing.join(', ')} if you have genuinely used them in coursework, projects or internships. Only list skills you can demonstrate - never invent proficiency.`,
    });
  }
  if (!exp.hasMetrics) {
    out.push({
      title: 'Improve Projects',
      body: 'Add measurable results to your project descriptions. Instead of "Created an employee management system", write "Developed an employee management system using Python and MySQL to manage employee records and reduce manual data handling." Only describe work you actually did.',
    });
  }
  for (const m of missing.slice(0, 3)) {
    if (m.key === 'summary') out.push({ title: 'Add a Professional Summary', body: `Add a 2-3 line summary targeting ${profile.title} that names your strongest genuine skills and what you are seeking. Do not invent experience or metrics.` });
    else if (m.key === 'experience') out.push({ title: 'Add Experience / Internships', body: 'List internships, freelance work or significant coursework with bullet points. If you are a fresher, class projects and open-source contributions count - describe your real role.' });
    else if (m.key === 'certifications') out.push({ title: 'Add Certifications', body: 'List only certifications you have actually earned, with issuer and year.' });
    else out.push({ title: `Add: ${m.label}`, body: `Your resume appears to be missing a ${m.label} section. Add one using a standard heading so ATS parsers can find it.` });
  }
  if (fmt.issues.length) {
    out.push({ title: 'Fix ATS Formatting', body: `${fmt.issues[0]} Use a single-column layout, standard fonts, plain bullets and text-based PDF/DOCX.` });
  }
  if (keywordsMissing.length) {
    out.push({ title: 'Add Role Keywords Naturally', body: `Consider weaving in role keywords where truthful: ${keywordsMissing.slice(0, 4).join(', ')}. Recommendations depend on the selected career path and are not guarantees of ATS behavior.` });
  }
  return out.slice(0, 7);
}
