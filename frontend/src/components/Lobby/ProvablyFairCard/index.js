import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';
import './ProvablyFairCard.css';

const DEMO_HAND = { shortId: '#8d4f9e', id: '8d4f9e', timeAgo: '2m ago' };

// Rotate through plausible Bitcoin block hashes every 12 s to simulate live blocks
const DEMO_HASHES = [
  '000000000000000000035a8f1e2c7b4d9e6f3a21c5b8d0e4f7a2c9b6e3d1f80',
  '00000000000000000002f7c4b9e1a3d6f8c2b5e0d4a7f1c3e9b6d2a8f4c7b30',
  '0000000000000000000148d3f9c2a7e5b4d6f1c8a2e7b3d9f5c1a4e8b2d6f090',
  '00000000000000000001e8b2c5a9d4f7e0c3b6a1d8f5e2c9b4a7d0e3f6c1b890',
];

function shortHash(full) {
  return full.slice(0, 8) + '…' + full.slice(-8);
}

export default function ProvablyFairCard() {
  const [hashIdx, setHashIdx] = useState(0);
  const [fading,  setFading]  = useState(false);
  const latestHand            = DEMO_HAND;

  useEffect(() => {
    // Track mounted state to avoid setState after unmount
    let mounted = true;

    const tick = setInterval(() => {
      setFading(true);
      // After 300 ms fade-out, swap the hash and fade back in
      const t = setTimeout(() => {
        if (!mounted) return;
        setHashIdx((i) => (i + 1) % DEMO_HASHES.length);
        setFading(false);
      }, 300);
      return t; // unused but explicit
    }, 12_000);

    return () => {
      mounted = false;
      clearInterval(tick);
    };
  }, []);

  return (
    <div className="pfc-card ss-card">

      {/* ── Header ── */}
      <div className="pfc-header">
        <span className="pfc-shield">🔐</span>
        <div className="pfc-header-text">
          <div className="pfc-title">Provably fair</div>
          <div className="pfc-subtitle">BTC block hash</div>
        </div>
        <span className="pfc-live-pill">
          <span className="pfc-live-dot" />
          live
        </span>
      </div>

      {/* ── Description ── */}
      <p className="pfc-desc">
        Every deck is shuffled using the next Bitcoin block hash.{' '}
        Verify any hand yourself.
      </p>

      {/* ── Rolling block hash ── */}
      <div className="pfc-hash-row">
        <span className="pfc-hash-label">Current block</span>
        <span className={`pfc-hash ss-mono${fading ? ' pfc-hash--fade' : ''}`}>
          {shortHash(DEMO_HASHES[hashIdx])}
        </span>
      </div>

      {/* ── Latest verified hand ── */}
      <div className="pfc-latest">
        <div className="pfc-latest-label">Latest verified hand</div>
        <div className="pfc-latest-row">
          <span className="pfc-hand-id ss-mono">{latestHand.shortId}</span>
          <span className="pfc-time">{latestHand.timeAgo}</span>
          <NavLink to="/verify" className="pfc-verify-link">
            verify ✓
          </NavLink>
        </div>
      </div>
    </div>
  );
}
