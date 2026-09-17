'use client';
import type { AtsAnalysisResult } from './types';
import { downloadReport } from './atsApi';

function statusColor(s: string) {
  if (s === 'GOOD') return '#10b981';
  if (s === 'MEDIUM') return '#f59e0b';
  return '#ef4444';
}
function Bar({ value, max, color }: { value: number; max: number; color: string }) {
  const pct = max ? Math.round((value / max) * 100) : 0;
  return (
    <div style={{ height: '0.55rem', background: 'rgba(255,255,255,0.08)', borderRadius: '999px', overflow: 'hidden' }}>
      <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '999px' }} />
    </div>
  );
}
function ScoreRing({ total, status }: { total: number; status: string }) {
  const color = statusColor(status);
  const r = 64; const c = 2 * Math.PI * r;
  const off = c - (total / 100) * c;
  const icon = status === 'GOOD' ? '🟢 GOOD' : status === 'MEDIUM' ? '🟠 MEDIUM' : '🔴 LOW';
  return (
    <div style={{ position: 'relative', width: '190px', height: '190px', margin: '0 auto' }}>
      <svg width="190" height="190" viewBox="0 0 190 190">
        <circle cx="95" cy="95" r={r} fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="14" />
        <circle cx="95" cy="95" r={r} fill="none" stroke={color} strokeWidth="14" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={off} transform="rotate(-90 95 95)" />
      </svg>
      <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.25rem' }}>
        <div style={{ fontSize: '0.7rem', letterSpacing: '0.15em', color: '#94a3b8', fontWeight: 700 }}>ATS SCORE</div>
        <div style={{ fontSize: '2.2rem', fontWeight: 800 }}>{total}<span style={{ fontSize: '1rem', color: '#94a3b8' }}> / 100</span></div>
        <div className="badge" style={{ background: `${color}22`, color, border: `1px solid ${color}` }}>{icon}</div>
      </div>
    </div>
  );
}
export default function ResultsDashboard({ result, onRestart }: { result: AtsAnalysisResult; onRestart: () => void }) {
  const color = statusColor(result.status);
  const cats = Object.entries(result.categories);
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass" style={{ borderRadius: '1rem', padding: '2rem', textAlign: 'center' }}>
        <div style={{ fontSize: '0.75rem', letterSpacing: '0.2em', color: '#94a3b8', fontWeight: 700, marginBottom: '1rem' }}>ATS RESUME SCORE</div>
        <ScoreRing total={result.total} status={result.status} />
        <p style={{ color: '#94a3b8', fontSize: '0.8rem', marginTop: '1rem' }}>{result.disclaimer}</p>
        <p style={{ color: '#64748b', fontSize: '0.8rem' }}>{result.candidate.fullName} • {result.career.icon} {result.career.title} • {result.file.name}</p>
      </div>
      <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Category Breakdown</h3>
        {cats.map(([key, c]) => (
          <div key={key} style={{ marginBottom: '0.9rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.3rem' }}>
              <span style={{ fontWeight: 600 }}>{c.label}</span>
              <span style={{ color: '#94a3b8' }}>{c.score}/{c.max}</span>
            </div>
            <Bar value={c.score} max={c.max} color={color} />
            <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.2rem' }}>{c.detail}</div>
          </div>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: '1.25rem' }}>
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
          <h4 style={{ color: '#6ee7b7', marginBottom: '0.6rem' }}>✓ Matched Skills</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {result.matchedSkills.map((s) => (<span key={s} className="badge badge-success">✓ {s}</span>))}
            {result.matchedSkills.length === 0 && <span style={{ color: '#94a3b8', fontSize: '0.85rem' }}>None detected yet.</span>}
          </div>
          <h4 style={{ color: '#fcd34d', margin: '1rem 0 0.6rem' }}>⚠ Missing / Recommended</h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
            {result.missingSkills.map((s) => (<span key={s} className="badge badge-warning">⚠ {s}</span>))}
          </div>
        </div>
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.25rem' }}>
          <h4 style={{ marginBottom: '0.6rem' }}>Resume Section Analysis</h4>
          {result.sections.map((s) => (
            <div key={s.key} style={{ display: 'flex', gap: '0.5rem', fontSize: '0.9rem', color: s.found ? '#e2e8f0' : '#94a3b8' }}>
              <span style={{ color: s.found ? '#10b981' : '#ef4444', fontWeight: 700 }}>{s.found ? '✓' : '✗'}</span>{s.label}
            </div>
          ))}
          <h4 style={{ margin: '1rem 0 0.5rem' }}>Keywords Found</h4>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{result.keywordsFound.join(', ') || '—'}</p>
          <h4 style={{ margin: '0.75rem 0 0.5rem' }}>Keywords to Consider</h4>
          <p style={{ fontSize: '0.82rem', color: '#cbd5e1' }}>{result.keywordsMissing.join(', ') || '—'}</p>
        </div>
      </div>
      <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>Improvement Suggestions</h3>
        {result.suggestions.map((s, i) => (
          <div key={i} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid var(--border)', borderRadius: '0.6rem', padding: '0.85rem 1rem', marginBottom: '0.6rem' }}>
            <div style={{ fontWeight: 700, fontSize: '0.9rem' }}>{s.title}</div>
            <div style={{ fontSize: '0.85rem', color: '#cbd5e1', lineHeight: 1.6 }}>{s.body}</div>
          </div>
        ))}
      </div>
      {result.improvementPlan && (
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.25rem' }}>Improve My Resume</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.9rem' }}>
            Rewritten only from information already present in your resume. Nothing is fabricated.
          </p>
          {Object.entries(result.improvementPlan).map(([k, v]) => (
            <div key={k} style={{ marginBottom: '0.7rem', fontSize: '0.87rem' }}>
              <strong style={{ textTransform: 'capitalize' }}>{k}: </strong>
              <span style={{ color: '#cbd5e1' }}>{v as string}</span>
            </div>
          ))}
        </div>
      )}
      {result.jdMatch && (
        <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
          <h3>Resume vs Job Description Match: {result.jdMatch.matchScore}%</h3>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8' }}>{result.jdMatch.note}</p>
          <p style={{ fontSize: '0.85rem', marginTop: '0.5rem' }}><strong>Matching:</strong> {result.jdMatch.matchingKeywords.join(', ') || '—'}</p>
          <p style={{ fontSize: '0.85rem' }}><strong>Missing:</strong> {result.jdMatch.missingKeywords.join(', ') || '—'}</p>
        </div>
      )}
      <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', justifyContent: 'center' }}>
        <button className="btn-primary" onClick={() => downloadReport(result)}>⬇ Download ATS Report</button>
        <button className="btn-secondary" onClick={onRestart}>Analyze Another Resume</button>
      </div>
    </div>
  );
}

