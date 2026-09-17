'use client';
import { useEffect, useState } from 'react';
import StageProgress from './StageProgress';
import ResultsDashboard from './ResultsDashboard';
import { AnalyzingStage, UploadStage } from './stages';
import { analyzeResume, fetchCareers } from './atsApi';
import type { AtsAnalysisResult, Career, Stage } from './types';

const LEVELS = ['Fresher', '0-1 Years', '1-3 Years', '3+ Years'];

export default function AtsPage() {
  const [stage, setStage] = useState<Stage>(1);
  const [careers, setCareers] = useState<Career[]>([]);
  const [fullName, setFullName] = useState('');
  const [level, setLevel] = useState('');
  const [careerId, setCareerId] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [jd, setJd] = useState('');
  const [consent, setConsent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<AtsAnalysisResult | null>(null);

  useEffect(() => {
    fetchCareers().then(setCareers).catch(() => setCareers([]));
  }, []);
  const goBack = (s: Stage) => { setError(null); setStage(s); };
  const submitDetails = () => {
    if (!fullName.trim()) { setError('Full name is required.'); return; }
    if (!LEVELS.includes(level)) { setError('Please select your experience level.'); return; }
    setError(null);
    setStage(2);
  };
  const submitCareer = () => {
    if (!careerId) { setError('Please select one career path to continue.'); return; }
    setError(null);
    setStage(3);
  };
  const runAnalysis = async () => {
    if (!file) { setError('No file uploaded. Please upload a PDF or DOCX resume.'); return; }
    setError(null);
    setAnalyzing(true);
    setStage(4);
    try {
      const r = await analyzeResume({
        fullName, experienceLevel: level,
        careerId, jobDescription: jd, consentStore: consent, file,
      });
      setResult(r);
      setStage(5);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Analysis failed.');
      setStage(3);
    } finally {
      setAnalyzing(false);
    }
  };
  const restart = () => {
    setResult(null); setFile(null); setJd('');
    setError(null); setStage(1);
  };
  return (
    <div style={{ minHeight: '100vh', padding: '2rem 1rem', background: 'radial-gradient(circle at center, #1e1b4b 0%, #0f172a 100%)' }}>
      <div style={{ maxWidth: '880px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <h1 className="gradient-text" style={{ fontSize: '2.2rem', fontWeight: 800, margin: '0.5rem 0' }}>
            ATS Resume Score Analyzer
          </h1>
          <p style={{ color: '#94a3b8' }}>Transparent 100-point scoring for freshers and job seekers.</p>
        </div>
        <StageProgress stage={stage} onBack={goBack} />
        {error && stage !== 3 && (
          <div style={{ marginBottom: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.88rem' }}>
            Warning: {error}
          </div>
        )}
        {stage === 1 && (
          <div className="glass animate-fade-in" style={{ borderRadius: '1rem', padding: '2rem' }}>
            <h2 style={{ marginBottom: '0.25rem' }}>Tell Us About Yourself</h2>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Stage 1 of 5.</p>
            <label className="form-label">Full Name *</label>
            <input className="input-field" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="e.g. Priya Sharma" style={{ marginBottom: '1rem' }} />
            <label className="form-label">Experience Level *</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(150px,1fr))', gap: '0.6rem', marginBottom: '1.5rem' }}>
              {LEVELS.map((l) => (
                <button
                  key={l} type="button" onClick={() => setLevel(l)}
                  style={{
                    padding: '0.75rem', borderRadius: '0.6rem', cursor: 'pointer', fontWeight: 600, fontSize: '0.88rem',
                    background: level === l ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : 'rgba(255,255,255,0.04)',
                    border: level === l ? '1px solid #3b82f6' : '1px solid var(--border)',
                    color: level === l ? '#fff' : '#cbd5e1',
                  }}
                >
                  {l}
                </button>
              ))}
            </div>
            <button className="btn-primary" onClick={submitDetails} style={{ width: '100%' }}>Continue</button>
          </div>
        )}
        {stage === 2 && (
          <div className="animate-fade-in">
            <div className="glass" style={{ borderRadius: '1rem', padding: '2rem', marginBottom: '1.25rem' }}>
              <h2 style={{ marginBottom: '0.25rem' }}>Choose Your Target Career</h2>
              <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.5rem' }}>Stage 2 of 5 - scoring is tailored to this path.</p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: '1rem' }}>
                {careers.map((c) => (
                  <button
                    key={c.id} type="button" onClick={() => { setCareerId(c.id); setError(null); }}
                    style={{
                      textAlign: 'left', padding: '1.25rem', borderRadius: '0.8rem', cursor: 'pointer',
                      background: careerId === c.id ? 'rgba(59,130,246,0.12)' : 'rgba(255,255,255,0.03)',
                      border: careerId === c.id ? '2px solid #3b82f6' : '1px solid var(--border)',
                      color: '#e2e8f0',
                    }}
                  >
                    <div style={{ fontSize: '1.8rem' }}>{c.icon}</div>
                    <div style={{ fontWeight: 700, margin: '0.4rem 0' }}>{c.title}</div>
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8', marginBottom: '0.6rem' }}>{c.tagline}</div>
                    <div>
                      {c.skills.map((s) => (
                        <span key={s} className="badge" style={{ background: 'rgba(255,255,255,0.06)', color: '#cbd5e1', marginRight: '0.3rem', marginBottom: '0.3rem' }}>{s}</span>
                      ))}
                    </div>
                    {careerId === c.id && <div style={{ color: '#3b82f6', fontWeight: 700, marginTop: '0.5rem' }}>Selected</div>}
                  </button>
                ))}
              </div>
              {careers.length === 0 && <p style={{ color: '#94a3b8' }}>Loading career paths...</p>}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
              <button className="btn-secondary" onClick={() => goBack(1)}>Back</button>
              <button className="btn-primary" onClick={submitCareer}>Continue to Resume Upload</button>
            </div>
          </div>
        )}
        {stage === 3 && (
          <UploadStage
            file={file} onFile={setFile}
            jobDescription={jd} onJd={setJd}
            consent={consent} onConsent={setConsent}
            error={error} onError={setError}
            analyzing={analyzing} onAnalyze={runAnalysis}
            onBack={() => goBack(2)}
          />
        )}
        {stage === 4 && <AnalyzingStage />}
        {stage === 5 && result && <ResultsDashboard result={result} onRestart={restart} />}
      </div>
    </div>
  );
}
