'use client';
import { STAGE_LABELS, Stage } from './types';

export default function StageProgress({ stage, onBack }: { stage: Stage; onBack: (s: Stage) => void }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '1.75rem' }}>
      {STAGE_LABELS.map((label, i) => {
        const n = (i + 1) as Stage;
        const active = n === stage;
        const done = n < stage;
        return (
          <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <button
              type="button"
              disabled={n >= stage}
              onClick={() => onBack(n)}
              title={done ? `Back to ${label}` : label}
              style={{
                display: 'flex', alignItems: 'center', gap: '0.45rem',
                background: active ? 'linear-gradient(135deg,#3b82f6,#6366f1)' : done ? 'rgba(16,185,129,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${active ? '#3b82f6' : done ? '#10b981' : 'var(--border)'}`,
                color: active || done ? '#fff' : '#94a3b8',
                borderRadius: '999px', padding: '0.4rem 0.9rem', fontSize: '0.8rem', fontWeight: 600,
                cursor: done ? 'pointer' : 'default',
              }}
            >
              <span style={{
                width: '1.35rem', height: '1.35rem', borderRadius: '50%',
                background: active ? 'rgba(255,255,255,0.25)' : done ? '#10b981' : 'rgba(255,255,255,0.08)',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem',
              }}>
                {done ? '✓' : n}
              </span>
              {n}. {label}
            </button>
            {i < STAGE_LABELS.length - 1 && <span style={{ color: '#475569' }}>↓</span>}
          </div>
        );
      })}
    </div>
  );
}
