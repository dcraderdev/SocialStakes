import React, { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Navigation from '../Navigation';
import { getHand, loadHands, GAME_LABELS } from '../../utils/historyStore';
import {
  sha256Hex, verifyCommitment,
  deriveCoinFlip, deriveCard, deriveCards, deriveDeck,
} from '../../utils/provablyFair';

const SUITS = ['♠', '♥', '♦', '♣'];
const RANK_LABELS = { 1: 'A', 11: 'J', 12: 'Q', 13: 'K' };
const rankLabel = (r) => RANK_LABELS[r] || String(r);
const cardFromObj = (c) => `${rankLabel(c.rank)}${SUITS[c.suit]}`;

// Map "Ts" style strings (HoldEm format) to display.
const HOLDEM_RANK_DISP = { T: '10' };
const HOLDEM_SUIT_DISP = { h: '♥', d: '♦', c: '♣', s: '♠' };
function holdemCardLabel(c) {
  if (!c || c.length < 2) return c || '';
  const r = HOLDEM_RANK_DISP[c[0]] || c[0];
  return r + (HOLDEM_SUIT_DISP[c[1]] || c[1]);
}

// Re-derive the outcome for a given hand from its stored seeds. Returns
// { matches: bool, derived: object, expected: object, reason?: string }.
async function rederiveHand(hand) {
  if (!hand?.pf?.serverSeed) {
    return { matches: false, reason: 'serverSeed not yet revealed for this session' };
  }
  const { serverSeed, clientSeed, nonce } = hand.pf;

  if (hand.game === 'coinflip') {
    const derived = await deriveCoinFlip(serverSeed, clientSeed, nonce);
    return {
      matches: derived === hand.detail.outcome,
      derived: { outcome: derived },
      expected: { outcome: hand.detail.outcome },
    };
  }

  if (hand.game === 'hilo') {
    const card = await deriveCard(serverSeed, clientSeed, nonce);
    const expected = hand.detail.to;
    return {
      matches: card.rank === expected.rank && card.suit === expected.suit,
      derived: { card: cardFromObj(card) },
      expected: { card: cardFromObj(expected) },
    };
  }

  if (hand.game === 'acey') {
    const [m] = await deriveCards(serverSeed, clientSeed, nonce, 1);
    const expected = hand.detail.middle;
    return {
      matches: m.rank === expected.rank && m.suit === expected.suit,
      derived: { middle: cardFromObj(m) },
      expected: { middle: cardFromObj(expected) },
    };
  }

  if (hand.game === 'holdem') {
    const deckIdx = await deriveDeck(serverSeed, clientSeed, nonce);
    // Map idx -> 'rs' string the same way HoldEm did
    const RANKS = ['2','3','4','5','6','7','8','9','T','J','Q','K','A'];
    const PF_SUITS = ['s', 'h', 'd', 'c'];
    const derivedDeck = deckIdx.map((idx) => RANKS[idx % 13] + PF_SUITS[Math.floor(idx / 13)]);
    const expectedDeck = hand.detail.deck || [];
    const matches = derivedDeck.length === expectedDeck.length &&
      derivedDeck.every((c, i) => c === expectedDeck[i]);
    return {
      matches,
      derived: { deck: derivedDeck },
      expected: { deck: expectedDeck },
    };
  }

  return { matches: false, reason: `unknown game type: ${hand.game}` };
}

function VerifyHandPage() {
  const { id } = useParams();
  const allHands = useMemo(loadHands, []);
  const hand = useMemo(() => id ? getHand(id) : (allHands[0] || null), [id, allHands]);

  const [commitmentOk, setCommitmentOk] = useState(null);
  const [verification, setVerification] = useState({ status: 'idle' });

  // Run on mount: check commitment + re-derive outcome
  useEffect(() => {
    if (!hand || !hand.pf) return;
    let cancelled = false;
    (async () => {
      if (hand.pf.serverSeed && hand.pf.commitment) {
        const ok = await verifyCommitment(hand.pf.serverSeed, hand.pf.commitment);
        if (!cancelled) setCommitmentOk(ok);
      } else {
        if (!cancelled) setCommitmentOk(null);
      }
      setVerification({ status: 'pending' });
      try {
        const result = await rederiveHand(hand);
        if (!cancelled) setVerification({ status: 'done', ...result });
      } catch (e) {
        if (!cancelled) setVerification({ status: 'error', error: e.message });
      }
    })();
    return () => { cancelled = true; };
  }, [hand]);

  if (!hand) {
    return (
      <>
        <Navigation />
        <div className="ss-page">
          <h1 className="ss-h1">Verify a hand</h1>
          <p className="ss-sub">
            No hand selected. <Link to="/history" style={{ color: 'var(--ss-gold)' }}>Pick one from history</Link> or
            play a round to generate one.
          </p>
        </div>
      </>
    );
  }

  const { pf } = hand;
  const verifyVerdict = verification.status === 'done' ? verification.matches : null;

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div style={{ fontSize: 12, color: 'var(--ss-text-muted)', marginBottom: 8, letterSpacing: '0.04em' }}>
          <Link to="/history" style={{ color: 'var(--ss-text-muted)' }}>History</Link>
          {' / '}{GAME_LABELS[hand.game] || hand.game}{' / '}Hand #{hand.id} / Verify
        </div>
        <h1 className="ss-h1">Verify Hand #{hand.id} · provably fair</h1>
        <p className="ss-sub" style={{ maxWidth: 780 }}>
          Every outcome on Social Stakes is the SHA-256 hash of a server seed (committed before any bets),
          a client seed, and a per-hand nonce. Re-running the same inputs here must yield the same outcome —
          or the deal was tampered with.
        </p>

        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginBottom: 20 }}>
          <Verdict ok={commitmentOk} pendingLabel="Commitment unrevealed (rotate seed in the game to reveal)"
            okLabel="✓ Commitment matches revealed seed"
            badLabel="✗ Commitment does NOT match — tampered" />
          <Verdict ok={verifyVerdict} pendingLabel={verification.status === 'pending' ? 'Re-deriving…' : 'Awaiting reveal'}
            okLabel="✓ Outcome reproduces from seeds"
            badLabel="✗ Outcome does not match" testId="verify-result-pill" />
        </div>

        <div className="ss-side-grid" style={{ marginBottom: 18 }}>
          <Section number="01" title="Seed inputs">
            <KV k="Game" v={GAME_LABELS[hand.game] || hand.game} />
            <KV k="Stake" v={<span className="ss-mono">${hand.stake}</span>} />
            <KV k="Result" v={
              <span style={{ color: hand.delta > 0 ? 'var(--ss-green)' : hand.delta < 0 ? 'var(--ss-red)' : 'var(--ss-text-dim)' }}>
                {hand.result} ({hand.delta > 0 ? '+' : ''}${hand.delta})
              </span>
            } />
            <KV k="Recorded" v={new Date(hand.ts).toLocaleString()} />
            <KV k="Commitment" v={
              <span className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 11, wordBreak: 'break-all' }} data-testid="verify-commitment">
                {pf?.commitment || '—'}
              </span>
            } />
            <KV k="Server seed" v={
              pf?.serverSeed ? (
                <span className="ss-mono" style={{ fontSize: 11, color: 'var(--ss-text-dim)', wordBreak: 'break-all' }} data-testid="verify-server-seed">
                  {pf.serverSeed}
                </span>
              ) : <span style={{ color: 'var(--ss-text-muted)' }}>not yet revealed</span>
            } />
            <KV k="Client seed" v={<span className="ss-mono" style={{ fontSize: 11 }}>{pf?.clientSeed}</span>} />
            <KV k="Nonce" v={<span className="ss-mono">{pf?.nonce}</span>} />
          </Section>

          <Section number="02" title="Re-derive">
            <p style={{ fontSize: 13, color: 'var(--ss-text-dim)', marginTop: 0, lineHeight: 1.5 }}>
              We pipe <code className="ss-mono">serverSeed:clientSeed:nonce</code> into SHA-256 (chained),
              then map the byte stream to game outcomes. Everything below was computed live in your browser.
            </p>
            <DerivationDetail hand={hand} verification={verification} />
          </Section>
        </div>

        <div className="ss-card" style={{ padding: 22, marginBottom: 18 }}>
          <NumberLabel n="03" title="What this proves" />
          <ul style={{ marginTop: 12, marginBottom: 0, paddingLeft: 18, color: 'var(--ss-text-dim)', fontSize: 13, lineHeight: 1.7 }}>
            <li><strong style={{ color: 'var(--ss-text)' }}>Commitment</strong> — SHA-256 of the server seed was published before any bet. If the revealed seed hashes to the same commitment, the seed wasn't swapped after the fact.</li>
            <li><strong style={{ color: 'var(--ss-text)' }}>Re-derivation</strong> — Given the seed, anyone can recompute the same deck/flip/draw. Outcomes can't be invented by the house.</li>
            <li><strong style={{ color: 'var(--ss-text)' }}>Nonce</strong> — Ties this specific hand to its slot in the seed chain. Without the nonce you can't tell which bet a card belonged to.</li>
          </ul>
        </div>

        <div className="ss-card" style={{ padding: 22 }}>
          <NumberLabel n="04" title="Reproduce externally" />
          <p style={{ fontSize: 13, color: 'var(--ss-text-dim)', marginTop: 10 }}>
            You don't have to trust this page. Copy the inputs and re-run in any environment:
          </p>
          <pre className="ss-mono" style={{
            background: 'var(--ss-bg)', padding: 14, borderRadius: 8,
            border: '1px solid var(--ss-border-soft)', fontSize: 12, overflow: 'auto', marginTop: 8,
          }}>
{`# Node.js
const crypto = require('crypto');
const h = crypto.createHash('sha256')
  .update('${pf?.serverSeed || '<server seed>'}:${pf?.clientSeed}:${pf?.nonce}:0')
  .digest('hex');
console.log(h);   // first 8 bytes → first uint32 of the stream`}
          </pre>
          <CommitmentReproduction pf={pf} />
        </div>
      </div>
    </>
  );
}

function Verdict({ ok, pendingLabel, okLabel, badLabel, testId }) {
  const cls = ok === true ? 'ss-pill-green' : ok === false ? 'ss-pill-red' : '';
  const label = ok === true ? okLabel : ok === false ? badLabel : pendingLabel;
  return (
    <span className={`ss-pill ${cls}`} style={{ fontSize: 12 }} data-testid={testId}>
      {label}
    </span>
  );
}

function DerivationDetail({ hand, verification }) {
  if (verification.status !== 'done') {
    return <div style={{ fontSize: 12, color: 'var(--ss-text-muted)' }}>{verification.reason || 'Re-deriving…'}</div>;
  }
  if (verification.reason) {
    return <div style={{ fontSize: 12, color: 'var(--ss-text-muted)' }}>{verification.reason}</div>;
  }

  if (hand.game === 'coinflip') {
    return (
      <KV k="Derived flip" v={
        <span className="ss-mono" style={{ color: verification.matches ? 'var(--ss-green)' : 'var(--ss-red)' }}>
          {verification.derived.outcome.toUpperCase()} (called {hand.detail.call.toUpperCase()})
        </span>
      } />
    );
  }

  if (hand.game === 'hilo') {
    return (
      <>
        <KV k="From card" v={<span className="ss-mono">{cardFromObj(hand.detail.from)}</span>} />
        <KV k="Derived next" v={
          <span className="ss-mono" style={{ color: verification.matches ? 'var(--ss-green)' : 'var(--ss-red)' }}>
            {verification.derived.card}
          </span>
        } />
        <KV k="Called" v={hand.detail.direction} />
      </>
    );
  }

  if (hand.game === 'acey') {
    return (
      <>
        <KV k="Posts" v={
          <span className="ss-mono">
            {cardFromObj(hand.detail.posts[0])} _ {cardFromObj(hand.detail.posts[1])}
          </span>
        } />
        <KV k="Derived middle" v={
          <span className="ss-mono" style={{ color: verification.matches ? 'var(--ss-green)' : 'var(--ss-red)' }}>
            {verification.derived.middle}
          </span>
        } />
      </>
    );
  }

  if (hand.game === 'holdem') {
    const expected = verification.expected.deck;
    const derived = verification.derived.deck;
    return (
      <>
        <KV k="Player hole" v={
          <span className="ss-mono">{hand.detail.playerHole?.map(holdemCardLabel).join(' ')}</span>
        } />
        <KV k="Bot hole" v={
          <span className="ss-mono">{hand.detail.botHole?.map(holdemCardLabel).join(' ')}</span>
        } />
        {hand.detail.community?.length > 0 && (
          <KV k="Community" v={
            <span className="ss-mono">{hand.detail.community.map(holdemCardLabel).join(' ')}</span>
          } />
        )}
        <KV k="Deck match" v={
          <span style={{ color: verification.matches ? 'var(--ss-green)' : 'var(--ss-red)' }}>
            {verification.matches ? `✓ all 52 cards match (${derived.length}/${expected.length})` : '✗ deck mismatch'}
          </span>
        } />
        <div style={{ marginTop: 8 }}>
          <div className="ss-stat-label" style={{ marginBottom: 6 }}>Derived deck (top → bottom)</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 4 }}>
            {derived.slice(0, 52).map((c, i) => (
              <div key={i} className="ss-mono" style={{
                padding: '4px 0', textAlign: 'center', fontSize: 11,
                background: i < 4 ? 'rgba(199,158,82,0.15)' : 'rgba(255,255,255,0.04)',
                borderRadius: 4,
              }}>{holdemCardLabel(c)}</div>
            ))}
          </div>
          <div style={{ fontSize: 10, color: 'var(--ss-text-muted)', marginTop: 6 }}>
            (highlighted cards were dealt to the players & community)
          </div>
        </div>
      </>
    );
  }

  return null;
}

function CommitmentReproduction({ pf }) {
  const [computed, setComputed] = useState(null);
  useEffect(() => {
    if (!pf?.serverSeed) return;
    sha256Hex(pf.serverSeed).then(setComputed);
  }, [pf?.serverSeed]);

  if (!pf?.serverSeed) return null;

  const ok = computed && computed === pf.commitment;
  return (
    <div style={{ marginTop: 14, fontSize: 12 }}>
      <div className="ss-stat-label" style={{ marginBottom: 6 }}>SHA-256 of revealed seed (computed live)</div>
      <div className="ss-mono" style={{ wordBreak: 'break-all', color: ok ? 'var(--ss-green)' : 'var(--ss-red)' }} data-testid="verify-recomputed-hash">
        {computed || '…'}
      </div>
      <div style={{ marginTop: 4, color: 'var(--ss-text-muted)' }}>
        {ok ? '↑ matches the commitment shown above' : 'expected to match the commitment'}
      </div>
    </div>
  );
}

function Section({ number, title, children }) {
  return (
    <div className="ss-card" style={{ padding: 22 }}>
      <NumberLabel n={number} title={title} />
      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 10 }}>
        {children}
      </div>
    </div>
  );
}

function NumberLabel({ n, title }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{
        border: '1px solid var(--ss-gold-line)', borderRadius: 4,
        padding: '2px 8px', fontSize: 11, color: 'var(--ss-gold)',
        fontFamily: 'var(--ss-mono)', fontWeight: 600,
      }}>{n}</span>
      <span style={{
        textTransform: 'uppercase', letterSpacing: '0.12em',
        fontSize: 11, color: 'var(--ss-text-muted)', fontWeight: 600,
      }}>{title}</span>
    </div>
  );
}

function KV({ k, v }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: '140px 1fr', gap: 12, alignItems: 'flex-start', fontSize: 13 }}>
      <div style={{ color: 'var(--ss-text-muted)' }}>{k}</div>
      <div>{v}</div>
    </div>
  );
}

export default VerifyHandPage;
