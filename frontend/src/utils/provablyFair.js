// Provably-fair RNG, fully reproducible from (serverSeed, clientSeed, nonce).
//
// Scheme (commit-reveal):
//   1. At session start we generate a 256-bit serverSeed and publish only
//      its SHA-256 hash (the "commitment"). The user can copy it before
//      placing any bets.
//   2. Each round increments `nonce`. Outcomes are derived from
//      HMAC-style chained hashes of (serverSeed | clientSeed | nonce | cursor).
//   3. When the user starts a new session (or asks for a reveal) we expose
//      the full serverSeed. Anyone can SHA-256 it and confirm it matches
//      the original commitment — proof we couldn't change the seed
//      after seeing bets.
//
// The implementation uses only the Web Crypto API (no deps).

const enc = new TextEncoder();

function bytesToHex(bytes) {
  let out = '';
  for (let i = 0; i < bytes.length; i++) {
    out += bytes[i].toString(16).padStart(2, '0');
  }
  return out;
}

export async function sha256Hex(input) {
  const data = typeof input === 'string' ? enc.encode(input) : input;
  const digest = await crypto.subtle.digest('SHA-256', data);
  return bytesToHex(new Uint8Array(digest));
}

// Generate 32 cryptographically-random bytes, returned as hex.
export function randomSeed() {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return bytesToHex(bytes);
}

// Produce a stream of 32-bit unsigned integers from the chained hash of
// (serverSeed:clientSeed:nonce:cursor). Cursor advances every 8 bytes
// of digest consumed — i.e. one SHA-256 call yields 8 uint32 outputs.
async function* uint32Stream(serverSeed, clientSeed, nonce) {
  let cursor = 0;
  while (true) {
    const hex = await sha256Hex(
      `${serverSeed}:${clientSeed}:${nonce}:${cursor}`
    );
    // 8 four-byte words per digest
    for (let i = 0; i < 8; i++) {
      const slice = hex.slice(i * 8, i * 8 + 8);
      yield parseInt(slice, 16) >>> 0;
    }
    cursor += 1;
  }
}

// Float in [0, 1), drawn deterministically from the seed stream.
async function nextFloat(stream) {
  const { value } = await stream.next();
  return value / 0x100000000;
}

// Integer in [0, n).
async function nextInt(stream, n) {
  if (n <= 0) return 0;
  const f = await nextFloat(stream);
  return Math.floor(f * n);
}

// --- Per-game derivations ----------------------------------------------------

// Single uniform 32-bit int.
export async function deriveUint32(serverSeed, clientSeed, nonce) {
  const stream = uint32Stream(serverSeed, clientSeed, nonce);
  const { value } = await stream.next();
  return value;
}

// Coin flip: 'heads' or 'tails'.
export async function deriveCoinFlip(serverSeed, clientSeed, nonce) {
  const u = await deriveUint32(serverSeed, clientSeed, nonce);
  return u % 2 === 0 ? 'heads' : 'tails';
}

// Single playing card 0..51. rank 1..13, suit 0..3 (0=♠,1=♥,2=♦,3=♣).
export async function deriveCard(serverSeed, clientSeed, nonce) {
  const stream = uint32Stream(serverSeed, clientSeed, nonce);
  const idx = await nextInt(stream, 52);
  return { rank: (idx % 13) + 1, suit: Math.floor(idx / 13), _idx: idx };
}

// Draw N independent cards from one nonce, advancing the cursor between them.
export async function deriveCards(serverSeed, clientSeed, nonce, count) {
  const stream = uint32Stream(serverSeed, clientSeed, nonce);
  const out = [];
  for (let i = 0; i < count; i++) {
    const idx = await nextInt(stream, 52);
    out.push({ rank: (idx % 13) + 1, suit: Math.floor(idx / 13), _idx: idx });
  }
  return out;
}

// Fisher-Yates shuffle of a 52-card deck, deterministic from seed.
// Returns array of 52 indices (0..51) — the games decide how to render.
export async function deriveDeck(serverSeed, clientSeed, nonce) {
  const stream = uint32Stream(serverSeed, clientSeed, nonce);
  const deck = Array.from({ length: 52 }, (_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = await nextInt(stream, i + 1);
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// --- Session storage --------------------------------------------------------

// We persist the (committed-but-unrevealed) server seed for the current
// session so the page can survive reloads without leaking the seed to
// other tabs. The history record snapshots seeds at the moment of reveal.

const SESSION_KEY = 'ss_pf_session_v1';

export async function getOrCreateSession() {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.serverSeed && parsed.commitment && parsed.clientSeed) {
        return parsed;
      }
    }
  } catch {}
  return rotateSession();
}

export async function rotateSession(clientSeed) {
  const serverSeed = randomSeed();
  const newClient = clientSeed || randomSeed().slice(0, 16);
  const commitment = await sha256Hex(serverSeed);
  const session = {
    serverSeed,
    clientSeed: newClient,
    commitment,
    nonce: 0,
    createdAt: Date.now(),
  };
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function consumeNonce() {
  const raw = sessionStorage.getItem(SESSION_KEY);
  if (!raw) return null;
  const parsed = JSON.parse(raw);
  parsed.nonce = (parsed.nonce || 0) + 1;
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(parsed));
  return parsed;
}

// Used by VerifyHandPage to confirm a stored hash matches a revealed seed.
export async function verifyCommitment(serverSeed, commitment) {
  if (!serverSeed || !commitment) return false;
  const h = await sha256Hex(serverSeed);
  return h === commitment;
}
