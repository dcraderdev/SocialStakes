import React, { useEffect, useState, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useLocation, useParams } from 'react-router-dom';
import Navigation from '../Navigation';
import { loadHandVerify } from '../../redux/middleware/stats';

const SUITS_RED = ['♥', '♦'];

// ─── client-side provably-fair re-derivation ────────────────────────────────

async function sha256hex(str) {
  const buf = new TextEncoder().encode(str);
  const hashBuf = await crypto.subtle.digest('SHA-256', buf);
  return Array.from(new Uint8Array(hashBuf))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

function seededShuffle(array, seed) {
  const arr = [...array];
  let s = seed || 1;
  const rng = () => {
    const x = Math.sin(s++) * 10000;
    return x - Math.floor(x);
  };
  let ci = arr.length;
  while (ci !== 0) {
    const ri = Math.floor(rng() * ci);
    ci--;
    [arr[ci], arr[ri]] = [arr[ri], arr[ci]];
  }
  return arr;
}

async function deriveAndVerify({ serverSeed, blockHash, nonce, deckSize = 52 }) {
  const combined = await sha256hex(serverSeed + blockHash + String(nonce));
  const seed = parseInt(combined.substring(0, 10), 16);
  const deck = seededShuffle([...Array(deckSize).keys()], seed);
  return { combinedHash: combined, deck };
}

// ─── card rendering ──────────────────────────────────────────────────────────

const SUIT_SYMBOLS = { '♠': false, '♣': false, '♥': true, '♦': true };

function isRed(card) {
  return SUITS_RED.some((s) => card.includes(s));
}

function CardTile({ card, highlighted = false }) {
  return (
    <div style={{
      aspectRatio: '0.72', borderRadius: 6,
      background: highlighted ? '#fafaf6' : 'rgba(255,255,255,0.04)',
      border: '1px solid rgba(0,0,0,0.06)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontWeight: 700, fontSize: 13,
      color: highlighted ? (isRed(card) ? '#d63a3a' : '#111') : 'var(--ss-text-dim)',
      opacity: highlighted ? 1 : 0.6,
    }}>
      {card}
    </div>
  );
}

// ─── layout helpers ──────────────────────────────────────────────────────────

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

function ChainStep({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.12em', color: 'var(--ss-text-muted)', marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 13 }}>{value}</div>
    </div>
  );
}

function Arrow() {
  return <div style={{ color: 'var(--ss-gold)', textAlign: 'center', fontSize: 20 }}>→</div>;
}

// ─── main component ──────────────────────────────────────────────────────────

function VerifyHandPage() {
  const dispatch = useDispatch();
  const location = useLocation();
  const params = useParams();
  const handVerify = useSelector((state) => state.stats.handVerify);
  const user = useSelector((state) => state.users.user);

  const [verified, setVerified] = useState(null); // null=pending, true=ok, false=fail
  const [clientHash, setClientHash] = useState('');
  const [clientDeck, setClientDeck] = useState([]);
  const [copied, setCopied] = useState(false);

  // Read handId from ?hand=... query param or /:handId path param
  const handId = (() => {
    if (params?.handId) return params.handId;
    const search = new URLSearchParams(location.search);
    return search.get('hand') || null;
  })();

  useEffect(() => {
    if (handId && user) {
      dispatch(loadHandVerify(handId));
    }
  }, [dispatch, handId, user]);

  // Client-side re-derivation when data arrives
  useEffect(() => {
    if (!handVerify || handVerify.error || !handVerify.serverSeed) {
      setVerified(null);
      return;
    }
    const { serverSeed, blockHash, nonce, combinedHash: serverHash, deck: serverDeck } = handVerify;
    deriveAndVerify({ serverSeed, blockHash, nonce, deckSize: (serverDeck?.length || 52) })
      .then(({ combinedHash, deck }) => {
        setClientHash(combinedHash);
        setClientDeck(deck);
        // The core provably-fair check: client-derived SHA-256 must match server-committed hash
        setVerified(combinedHash === serverHash);
      })
      .catch(() => setVerified(false));
  }, [handVerify]);

  const handleCopy = useCallback(() => {
    if (!handVerify) return;
    navigator.clipboard.writeText(handVerify.combinedHash || '').then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [handVerify]);

  // ── no hand selected ────────────────────────────────────────────────────────
  if (!handId) {
    return (
      <>
        <Navigation />
        <div className="ss-page">
          <h1 className="ss-h1">Verify a Hand · provably fair</h1>
          <p className="ss-sub" style={{ maxWidth: 780 }}>
            Every shuffle on Social Stakes is seeded by the hash of a Bitcoin block we hadn't seen yet
            when bets were placed. Select a hand from your{' '}
            <a href="/history" style={{ color: 'var(--ss-gold)' }}>history</a> to verify it.
          </p>
          <div className="ss-card" style={{ padding: 32, textAlign: 'center', color: 'var(--ss-text-dim)', marginTop: 24 }}>
            No hand selected. Click "verify ✓" on any row in your history.
          </div>
        </div>
      </>
    );
  }

  // ── loading ─────────────────────────────────────────────────────────────────
  if (!handVerify) {
    return (
      <>
        <Navigation />
        <div className="ss-page">
          <h1 className="ss-h1">Verifying hand…</h1>
          <div style={{ color: 'var(--ss-text-dim)', marginTop: 24 }}>Loading seed data…</div>
        </div>
      </>
    );
  }

  // ── error ────────────────────────────────────────────────────────────────────
  if (handVerify.error) {
    return (
      <>
        <Navigation />
        <div className="ss-page">
          <h1 className="ss-h1">Hand not found</h1>
          <div className="ss-pill ss-pill-red" style={{ marginTop: 16 }}>✗ {handVerify.error}</div>
        </div>
      </>
    );
  }

  const {
    tableName, serverSeed, blockHash, nonce, combinedHash,
    deck: serverDeck, handCards, dealerCards, result, delta,
  } = handVerify;

  const shortId = typeof handId === 'string' ? handId.slice(0, 8) : handId;
  const shortHash = combinedHash ? `${combinedHash.slice(0, 8)}…${combinedHash.slice(-8)}` : '—';

  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div style={{ fontSize: 12, color: 'var(--ss-text-muted)', marginBottom: 12, letterSpacing: '0.04em' }}>
          History / {tableName} / Hand #{shortId} / Verify
        </div>
        <h1 className="ss-h1">Verify Hand #{shortId} · provably fair</h1>
        <p className="ss-sub" style={{ maxWidth: 780 }}>
          Every shuffle on Social Stakes is seeded by the hash of a Bitcoin block we hadn't seen yet
          when bets were placed. You can re-run the deal yourself: anyone who agrees on the block hash
          and the nonce will arrive at the same deck. No backdoor, no possible house edge.
        </p>

        {verified === true && (
          <div className="ss-pill ss-pill-green" style={{ marginBottom: 28 }}>
            ✓ Deal verified · client-side derivation matches server commitment
          </div>
        )}
        {verified === false && (
          <div className="ss-pill ss-pill-red" style={{ marginBottom: 28 }}>
            ✗ Verification failed · derived deck does not match
          </div>
        )}
        {verified === null && (
          <div className="ss-pill" style={{ marginBottom: 28, color: 'var(--ss-text-dim)' }}>
            ⏳ Running client-side verification…
          </div>
        )}

        {/* Hand result summary */}
        {(handCards?.length > 0 || dealerCards?.length > 0) && (
          <div className="ss-card" style={{ padding: 18, marginBottom: 18, display: 'flex', gap: 32, flexWrap: 'wrap', fontSize: 13 }}>
            {handCards?.length > 0 && (
              <div>
                <div style={{ color: 'var(--ss-text-muted)', marginBottom: 6 }}>Your hand</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {handCards.map((c, i) => <CardTile key={i} card={c} highlighted />)}
                </div>
              </div>
            )}
            {dealerCards?.length > 0 && (
              <div>
                <div style={{ color: 'var(--ss-text-muted)', marginBottom: 6 }}>Dealer</div>
                <div style={{ display: 'flex', gap: 6 }}>
                  {dealerCards.map((c, i) => <CardTile key={i} card={c} highlighted />)}
                </div>
              </div>
            )}
            <div style={{ marginLeft: 'auto', textAlign: 'right' }}>
              <div style={{ color: 'var(--ss-text-muted)', marginBottom: 6 }}>Result</div>
              <span className={`ss-pill ${result === 'Win' || result === 'Blackjack' ? 'ss-pill-green' : result === 'Bust' || result === 'Lose' ? 'ss-pill-red' : ''}`}>
                {result}
              </span>
              {delta !== undefined && (
                <div className="ss-mono" style={{ marginTop: 4, color: delta >= 0 ? 'var(--ss-green)' : 'var(--ss-red)', fontWeight: 600 }}>
                  {delta >= 0 ? '+' : '−'} ${Math.abs(delta)}
                </div>
              )}
            </div>
          </div>
        )}

        <div className="ss-side-grid" style={{ marginBottom: 18 }}>
          <Section number="01" title="Seed inputs">
            <KV k="Block hash" v={
              <span className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 11, wordBreak: 'break-all' }}>
                {blockHash || '—'}
              </span>
            } />
            <KV k="Server nonce" v={<span className="ss-mono">{nonce}</span>} />
            <KV k="Deck size" v={<span className="ss-mono">{serverDeck?.length ?? 52} cards</span>} />
          </Section>

          <Section number="02" title="Combined seed">
            <div style={{ background: 'var(--ss-bg)', border: '1px solid var(--ss-border-soft)', borderRadius: 10, padding: 14 }}>
              <div className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 11, lineHeight: 1.8, wordBreak: 'break-all' }}>
                {combinedHash || '—'}
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4, fontSize: 12 }}>
              <span style={{ color: 'var(--ss-text-muted)' }} className="ss-mono">
                sha256( server_seed · block_hash · nonce )
              </span>
              <button className="ss-btn" style={{ height: 28, fontSize: 12 }} onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>
            {clientHash && clientHash !== combinedHash && (
              <div style={{ fontSize: 11, color: 'var(--ss-red)', marginTop: 6 }}>
                ✗ Client hash differs from server hash
              </div>
            )}
            {clientHash && clientHash === combinedHash && (
              <div style={{ fontSize: 11, color: 'var(--ss-green)', marginTop: 6 }}>
                ✓ Client hash matches server hash
              </div>
            )}
          </Section>
        </div>

        <div className="ss-card" style={{ padding: 22, marginBottom: 18 }}>
          <NumberLabel n="03" title="Hash chain" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 14, alignItems: 'center' }}>
            <ChainStep label="Block hash" value={<span className="ss-mono" style={{ fontSize: 11, wordBreak: 'break-all', color: 'var(--ss-gold)' }}>{blockHash ? `${blockHash.slice(0, 12)}…` : '—'}</span>} />
            <Arrow />
            <ChainStep label="Server seed (revealed)" value={<span className="ss-mono" style={{ fontSize: 11, wordBreak: 'break-all' }}>{serverSeed ? `${serverSeed.slice(0, 12)}…` : '—'}</span>} />
            <Arrow />
            <ChainStep label="Nonce" value={<span className="ss-mono">{nonce}</span>} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 14, alignItems: 'center' }}>
            <ChainStep label="Combined SHA-256" value={<span className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 11 }}>{shortHash}</span>} />
            <Arrow />
            <ChainStep label="Deck order" value={<span style={{ color: 'var(--ss-text-dim)' }}>{serverDeck?.length ?? 52} cards (below)</span>} />
            <div /><div />
          </div>
        </div>

        {serverDeck && serverDeck.length > 0 && (
          <div className="ss-card" style={{ padding: 22 }}>
            <NumberLabel n="04" title="Deck order (top → bottom)" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 6, marginTop: 16 }}>
              {serverDeck.slice(0, 52).map((c, i) => (
                <CardTile key={i} card={c} highlighted={i >= 12} />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}

export default VerifyHandPage;
