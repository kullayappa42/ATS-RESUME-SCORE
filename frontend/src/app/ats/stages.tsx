'use client';
import { useState } from 'react';
import { formatBytes } from './atsApi';

interface UploadProps {
  file: File | null;
  onFile: (f: File | null) => void;
  jobDescription: string;
  onJd: (v: string) => void;
  consent: boolean;
  onConsent: (v: boolean) => void;
  error: string | null;
  onError: (msg: string | null) => void;
  analyzing: boolean;
  onAnalyze: () => void;
  onBack: () => void;
}

export function AnalyzingStage() {
  const steps = [
    'Extracting resume text',
    'Analyzing sections',
    'Analyzing skills',
    'Analyzing keywords',
    'Calculating ATS score',
  ];
  return (
    <div className="glass animate-fade-in" style={{ borderRadius: '1rem', padding: '2.5rem', textAlign: 'center' }}>
      <div className="spinner" style={{ width: '3rem', height: '3rem', margin: '0 auto 1.25rem', borderRadius: '50%', border: '4px solid rgba(255,255,255,0.1)', borderTopColor: '#3b82f6' }} />
      <h3 style={{ marginBottom: '1.25rem' }}>Analyzing your resume...</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', maxWidth: '340px', margin: '0 auto', textAlign: 'left' }}>
        {steps.map((label, i) => (
          <div key={label} style={{ fontSize: '0.9rem', color: '#94a3b8' }}>
            {i + 1}. {label}...
          </div>
        ))}
      </div>
    </div>
  );
}

export function UploadStage(props: UploadProps) {
  const [drag, setDrag] = useState(false);
  const pick = (f: File | null | undefined) => {
    if (!f) return;
    const okType = /\.pdf$/i.test(f.name) || /\.docx$/i.test(f.name);
    if (!okType) {
      props.onError('Unsupported file type. Please upload a PDF or DOCX file.');
      props.onFile(null);
      return;
    }
    if (f.size > 5 * 1024 * 1024) {
      props.onError('File is too large. Maximum size is 5 MB.');
      props.onFile(null);
      return;
    }
    props.onError(null);
    props.onFile(f);
  };
  return (
    <div className="animate-fade-in" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
        <h2 style={{ marginBottom: '0.25rem' }}>Upload Your Resume</h2>
        <p style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1.25rem' }}>
          PDF or DOCX, up to 5 MB. Parsed in memory, never stored without consent.
        </p>
        <label
          onDragOver={(e) => { e.preventDefault(); setDrag(true); }}
          onDragLeave={() => setDrag(false)}
          onDrop={(e) => { e.preventDefault(); setDrag(false); pick(e.dataTransfer.files?.[0]); }}
          style={{
            display: 'block',
            border: '2px dashed ' + (drag ? '#3b82f6' : 'var(--border)'),
            borderRadius: '1rem',
            padding: '2.5rem 1.5rem',
            textAlign: 'center',
            cursor: 'pointer',
            background: drag ? 'rgba(59,130,246,0.08)' : 'rgba(255,255,255,0.02)',
          }}
        >
          <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>📄</div>
          <div style={{ fontWeight: 700, fontSize: '1.1rem', marginBottom: '0.4rem' }}>Upload Your Resume</div>
          <div style={{ color: '#94a3b8', fontSize: '0.9rem', marginBottom: '1rem' }}>Drag and Drop your resume here<br />OR</div>
          <span className="btn-primary">[ Choose File ]</span>
          <div style={{ color: '#64748b', fontSize: '0.8rem', marginTop: '1rem' }}>PDF / DOCX supported</div>
          <input
            type="file" accept=".pdf,.docx" hidden
            onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ''; }}
          />
        </label>
        {props.file && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem', background: 'rgba(16,185,129,0.08)', border: '1px solid #10b981', borderRadius: '0.6rem', padding: '0.75rem 1rem' }}>
            <span style={{ fontSize: '1.4rem' }}>📑</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{props.file.name}</div>
              <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>{formatBytes(props.file.size)} - Upload status: ready</div>
            </div>
            <button className="copy-btn" onClick={() => props.onFile(null)}>Remove file</button>
          </div>
        )}
        {props.error && (
          <div style={{ marginTop: '1rem', background: 'rgba(239,68,68,0.1)', border: '1px solid #ef4444', borderRadius: '0.6rem', padding: '0.75rem 1rem', fontSize: '0.88rem' }}>
            Warning: {props.error}
          </div>
        )}
      </div>
      <div className="glass" style={{ borderRadius: '1rem', padding: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.25rem' }}>Paste Job Description <span style={{ color: '#64748b', fontWeight: 400, fontSize: '0.8rem' }}>(optional)</span></h3>
        <textarea
          className="input-field" rows={5} value={props.jobDescription}
          onChange={(e) => props.onJd(e.target.value)}
          placeholder="Paste the job posting here..."
          style={{ resize: 'vertical' }}
        />
        <label style={{ display: 'flex', gap: '0.5rem', marginTop: '0.9rem', fontSize: '0.82rem', color: '#94a3b8' }}>
          <input type="checkbox" checked={props.consent} onChange={(e) => props.onConsent(e.target.checked)} />
          I agree to store my resume excerpt and analysis for history (optional).
        </label>
      </div>
      <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'space-between', flexWrap: 'wrap' }}>
        <button className="btn-secondary" onClick={props.onBack}>Back</button>
        <button className="btn-primary" disabled={!props.file || props.analyzing} onClick={props.onAnalyze} style={{ opacity: !props.file ? 0.5 : 1 }}>
          {props.analyzing ? 'Analyzing...' : 'Analyze Resume'}
        </button>
      </div>
    </div>
  );
}
