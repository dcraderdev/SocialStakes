import React from 'react';
import Navigation from '../Navigation';

const SUITS_RED = ['♥', '♦'];
const SAMPLE_DECK = [
  'K♥', '7♣', 'A♠', '8♣', 'Q♣', '5♣', '9♣', '9♥', 'J♥', '3♠', 'A♣', 'K♦',
  '4♣', '2♥', '6♠', '10♦', '8♠', '5♥', 'J♣', 'Q♣', 'A♥', 'A♦', '7♥', '3♠', '8♥',
  'K♠', '2♣', '2♦', '5♠', '6♥', 'Q♥', 'J♦', 'J♠', '4♥', '4♥', '9♣', '8♣', '10♥',
  '10♥', '9♦', '3♥', '3♠', '6♥', '7♣', '5♦', 'K♣', '4♦', 'Q♠', '7♦', '8♦',
];

/**
 * Static demo of the provably-fair verify-a-hand surface from
 * 03-verify.jpg. Real interactive re-derivation isn't wired up yet — the
 * backend has all the data (server seeds chained via SHA-256, Bitcoin
 * block hashes from blockchain.info, client nonces in the Hands table),
 * but there is no public endpoint exposing it. This page demonstrates the
 * concept.
 */
function VerifyHandPage() {
  return (
    <>
      <Navigation />
      <div className="ss-page">
        <div style={{ fontSize: 12, color: 'var(--ss-text-muted)', marginBottom: 12, letterSpacing: '0.04em' }}>
          History / Table #4 · High Tide / Hand 142 / Verify
        </div>
        <h1 className="ss-h1">Verify Hand #142 · provably fair</h1>
        <p className="ss-sub" style={{ maxWidth: 780 }}>
          Every shuffle on Social Stakes is seeded by the hash of a Bitcoin block we hadn't seen yet
          when bets were placed. You can re-run the deal yourself: anyone who agrees on the block hash
          and the client-side nonces will arrive at the same deck. No backdoor, no possible house edge.
        </p>

        <div className="ss-pill ss-pill-green" style={{ marginBottom: 28 }}>
          ✓ Deal verified · shuffle matches published seed
        </div>

        <div className="ss-side-grid" style={{ marginBottom: 18 }}>
          <Section number="01" title="Seed inputs">
            <KV k="Bitcoin block" v={<span className="ss-mono">932,481</span>} />
            <KV k="Block hash" v={<span className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 11, wordBreak: 'break-all' }}>
              000000000000000000023f4c8a91d2e7b4a90fc3e0a8d61c2f5b9a73e88
            </span>} />
            <KV k="Block time" v={<span className="ss-mono">2026-05-12 14:33:18 UTC</span>} />
            <KV k="Server nonce" v={<span className="ss-mono">srv-2026-05-12-9f3a</span>} />
            <KV k="Client nonces" v={<span style={{ color: 'var(--ss-text-dim)' }}>6 players · combined sha256</span>} />
          </Section>

          <Section number="02" title="Combined seed">
            <div style={{ background: 'var(--ss-bg)', border: '1px solid var(--ss-border-soft)', borderRadius: 10, padding: 14 }}>
              <div className="ss-mono" style={{ color: 'var(--ss-gold)', fontSize: 13, lineHeight: 1.5, wordBreak: 'break-all' }}>
                f3a91e2c7b48d5e0a91c<br />
                4d8b3f7e2901c4a6b9f8<br />
                e5d2c0741f9a6b3e8d52<br />
                0291e7c4ab8d6f3e9012
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12 }}>
              <span style={{ color: 'var(--ss-text-muted)' }} className="ss-mono">
                sha256( block_hash · srv_nonce · client_nonces )
              </span>
              <button className="ss-btn" style={{ height: 28, fontSize: 12 }}>Copy</button>
            </div>
          </Section>
        </div>

        <div className="ss-card" style={{ padding: 22, marginBottom: 18 }}>
          <NumberLabel n="03" title="Hash chain" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 14, alignItems: 'center' }}>
            <ChainStep label="Block" value={<span className="ss-mono">000…23f4c8a9</span>} />
            <Arrow />
            <ChainStep label="Server nonce" value={<span className="ss-mono">srv-2026-05-12-9f3a</span>} />
            <Arrow />
            <ChainStep label="Players" value={<span style={{ color: 'var(--ss-text-dim)' }}>6 nonces · merged</span>} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 12, marginTop: 14, alignItems: 'center' }}>
            <ChainStep label="Seed" value={<span className="ss-mono" style={{ color: 'var(--ss-gold)' }}>f3a91e2c…0291e7c4</span>} />
            <Arrow />
            <ChainStep label="Deck order" value={<span style={{ color: 'var(--ss-text-dim)' }}>52 cards (below)</span>} />
            <div />
            <div />
          </div>
        </div>

        <div className="ss-card" style={{ padding: 22 }}>
          <NumberLabel n="04" title="Deck order (top → bottom)" />
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(13, 1fr)', gap: 6, marginTop: 16 }}>
            {SAMPLE_DECK.slice(0, 52).map((c, i) => (
              <div key={i} style={{
                aspectRatio: '0.72', borderRadius: 6,
                background: i < 12 ? 'rgba(255,255,255,0.04)' : '#fafaf6',
                border: '1px solid rgba(0,0,0,0.06)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontWeight: 700, fontSize: 13,
                color: i < 12 ? 'var(--ss-text-dim)' : (SUITS_RED.some(s => c.includes(s)) ? '#d63a3a' : '#111'),
                opacity: i < 12 ? 0.6 : 1,
              }}>
                {c}
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
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

export default VerifyHandPage;
