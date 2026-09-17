// Client helpers: API calls + PDF report download for the ATS wizard.
import type { AtsAnalysisResult, Career } from './types';

export async function fetchCareers(): Promise<Career[]> {
  const res = await fetch('/api/ats/careers', { cache: 'no-store' });
  if (!res.ok) throw new Error('Could not load career paths.');
  const data = await res.json();
  return data.careers as Career[];
}

export interface AnalyzePayload {
  fullName: string; experienceLevel: string;
  careerId: string; jobDescription: string; consentStore: boolean; file: File;
}

export async function analyzeResume(payload: AnalyzePayload): Promise<AtsAnalysisResult> {
  const form = new FormData();
  form.append('resume', payload.file);
  form.append('fullName', payload.fullName);
  form.append('experienceLevel', payload.experienceLevel);
  form.append('careerId', payload.careerId);
  form.append('jobDescription', payload.jobDescription);
  form.append('consentStore', payload.consentStore ? 'true' : 'false');
  const res = await fetch('/api/ats/analyze', { method: 'POST', body: form });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || 'Analysis failed. Please try again.');
  return data as AtsAnalysisResult;
}

export function formatBytes(bytes: number): string {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB'];
  let v = bytes; let i = 0;
  while (v >= 1024 && i < units.length - 1) { v /= 1024; i += 1; }
  return `${v.toFixed(i === 0 ? 0 : 1)} ${units[i]}`;
}

// Build a printable report window (no dependency — uses browser print-to-PDF).
const esc = (s: string) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
export function downloadReport(result: AtsAnalysisResult): void {
  const rows = Object.values(result.categories)
    .map((c) => `<tr><td>${esc(c.label)}</td><td>${c.score} / ${c.max}</td><td>${esc(c.detail)}</td></tr>`)
    .join('');
  const li = (items: string[]) => items.map((s) => `<li>${esc(s)}</li>`).join('');
  const plan = result.improvementPlan
    ? `<h2>Improve My Resume (uses only your resume evidence)</h2><ul>${Object.entries(result.improvementPlan).map(([k, v]) => `<li><strong>${esc(k)}:</strong> ${esc(v)}</li>`).join('')}</ul>`
    : '';
  const html = `<!doctype html><html><head><meta charset="utf-8"><title>ATS Resume Analysis Report</title>
<style>body{font-family:Arial,sans-serif;color:#111;padding:32px;max-width:800px;margin:auto}
h1{font-size:24px}h2{font-size:16px;margin-top:24px;border-bottom:1px solid #ddd;padding-bottom:4px}
table{width:100%;border-collapse:collapse;font-size:13px}td,th{border:1px solid #ddd;padding:6px 8px;text-align:left}
.badge{display:inline-block;padding:4px 12px;border-radius:999px;font-weight:bold}
ul{font-size:13px}</style></head><body>
<h1>ATS Resume Analysis Report</h1>
<p><strong>Candidate:</strong> ${esc(result.candidate.fullName)}<br>
<strong>Experience:</strong> ${esc(result.candidate.experienceLevel)}<br>
<strong>Selected Career:</strong> ${esc(result.career.icon)} ${esc(result.career.title)}<br>
<strong>Resume File:</strong> ${esc(result.file.name)}</p>
<h2>Overall ATS Score: ${result.total} / 100 — ${result.status}</h2>
<table><tr><th>Category</th><th>Score</th><th>Detail</th></tr>${rows}</table>
<h2>Matched Skills</h2><ul>${li(result.matchedSkills)}</ul>
<h2>Missing / Recommended Skills</h2><ul>${li(result.missingSkills)}</ul>
<h2>Resume Section Analysis</h2><ul>${result.sections.map((s) => `<li>${s.found ? 'PASS' : 'MISSING'} - ${esc(s.label)}</li>`).join('')}</ul>
<h2>Keyword Analysis</h2><p><strong>Found:</strong> ${esc(result.keywordsFound.join(', ')) || '-'}</p>
<p><strong>To consider:</strong> ${esc(result.keywordsMissing.join(', ')) || '-'}</p>
<h2>Improvement Suggestions</h2><ul>${result.suggestions.map((s) => `<li><strong>${esc(s.title)}:</strong> ${esc(s.body)}</li>`).join('')}</ul>
${plan}
${result.jdMatch ? `<h2>Job Description Match: ${result.jdMatch.matchScore}%</h2><p><strong>Matching:</strong> ${esc(result.jdMatch.matchingKeywords.join(', '))}</p><p><strong>Missing:</strong> ${esc(result.jdMatch.missingKeywords.join(', '))}</p>` : ''}
<p style="font-size:11px;color:#555;margin-top:24px">${esc(result.disclaimer)}</p>
</body></html>`;
  const w = window.open('', '_blank', 'width=900,height=700');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 400);
}
