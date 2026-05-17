import React, { useEffect, useState } from 'react';
import { getOrCreateSession, rotateSession } from '../utils/provablyFair';

// A compact "Provably Fair" status card the demo games show next to the
// bet controls. Surfaces the SHA-256 commitment of the active server
// seed *before* outcomes are revealed, plus a "rotate" action that
// reveals the current seed and starts a fresh one.

export default function ProvablyFairPanel({ session, onRotate, revealed }) {
  const [showRevealed, setShowRevealed] = useState(false);

  if (!session) {
    return (
      <div className="ss-card" style={{ padding: 16, fontSize: 12, color: 'var(--ss-text-muted)' }}>
        Initializing provably-fair seed…
      </div>
    );
  }

  return (
    <div className="ss-card" style={{ padding: 16 }} data-testid="pf-panel">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
        <span className="ss-stat-label" style={{ margin: 0 }}>Provably fair · this session</span>
        <span className="ss-pill ss-pill-green" style={{ fontSize: 10 }}>SHA-256 committed</span>
      </div>

      <Row label="Commitment" mono>
        <span
          className="ss-mono"
          style={{ color: 'var(--ss-gold)', fontSize: 11, wordBreak: 'break-all' }}
          data-testid="pf-commitment"
        >
          {session.commitment}
        </span>
      </Row>
      <Row label="Client seed" mono>
        <span className="ss-mono" style={{ fontSize: 11, color: 'var(--ss-text-dim)' }}>
          {session.clientSeed}
        </span>
      </Row>
      <Row label="Nonce" mono>
        <span className="ss-mono" style={{ fontSize: 12 }}>{session.nonce}</span>
      </Row>

      {revealed && (
        <div style={{ marginTop: 10, padding: 10, background: 'var(--ss-bg)', borderRadius: 8, border: '1px solid var(--ss-border-soft)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: 'var(--ss-text-muted)' }}>Last revealed seed (rotate above)</span>
            <button
              type="button"
              onClick={() => setShowRevealed((v) => !v)}
              className="ss-btn"
              style={{ height: 22, fontSize: 11, padding: '0 8px' }}
            >
              {showRevealed ? 'Hide' : 'Show'}
            </button>
          </div>
          {showRevealed && (
            <div className="ss-mono" style={{ fontSize: 10, color: 'var(--ss-text-dim)', wordBreak: 'break-all', marginTop: 6 }}>
              {revealed.serverSeed}
            </div>
          )}
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="ss-btn"
          style={{ flex: 1, height: 30, fontSize: 12 }}
          onClick={onRotate}
          data-testid="pf-rotate"
        >
          Reveal & rotate seed
        </button>
      </div>

      <div style={{ marginTop: 8, fontSize: 10, color: 'var(--ss-text-muted)', lineHeight: 1.5 }}>
        Outcomes are SHA-256(serverSeed : clientSeed : nonce). The hash above
        was published before any bets — proof we can't change the seed mid-session.
      </div>
    </div>
  );
}

function Row({ label, children }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '110px 1fr', gap: 10, alignItems: 'flex-start', fontSize: 12, marginBottom: 6 }}>
      <div style={{ color: 'var(--ss-text-muted)' }}>{label}</div>
      <div>{children}</div>
    </div>
  );
}

// Convenience hook: wires up session lifecycle + reveals into local state.
export function useProvablyFairSession() {
  const [session, setSession] = useState(null);
  const [revealed, setRevealed] = useState(null);

  useEffect(() => {
    let cancelled = false;
    getOrCreateSession().then((s) => {
      if (!cancelled) setSession(s);
    });
    return () => { cancelled = true; };
  }, []);

  // Caller calls this after each outcome so the panel reflects the
  // advanced nonce.
  const refresh = (next) => setSession(next);

  const rotate = async () => {
    setRevealed(session ? { serverSeed: session.serverSeed, commitment: session.commitment } : null);
    const next = await rotateSession();
    setSession(next);
  };

  return { session, revealed, refresh, rotate, setSession };
}
