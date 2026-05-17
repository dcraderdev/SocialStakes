// Cross-game hand history, persisted to localStorage.
// Every game records each completed wager via `recordHand`; HistoryPage
// reads via `loadHands` and VerifyHandPage looks up a single record via
// `getHand`.

const KEY = 'ss_history_v1';
const MAX = 500;

function safeRead() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function safeWrite(arr) {
  try {
    localStorage.setItem(KEY, JSON.stringify(arr.slice(0, MAX)));
  } catch {
    // out of quota; silently drop
  }
}

function nextId(arr) {
  if (!arr.length) return 1;
  return (arr[0]?.id || 0) + 1;
}

// hand: {
//   game: 'coinflip' | 'hilo' | 'acey' | 'holdem',
//   stake: number,        // amount wagered
//   delta: number,        // profit/loss, signed
//   result: 'WIN' | 'LOSE' | 'PUSH' | 'BLACKJACK',
//   summary: string,      // short human-readable result
//   detail: object,       // game-specific (cards, deck, etc.)
//   pf: { commitment, serverSeed, clientSeed, nonce } | null,
// }
export function recordHand(hand) {
  const arr = safeRead();
  const record = {
    id: nextId(arr),
    ts: Date.now(),
    ...hand,
  };
  arr.unshift(record);
  safeWrite(arr);
  return record;
}

export function loadHands() {
  return safeRead();
}

export function getHand(id) {
  const arr = safeRead();
  return arr.find((h) => String(h.id) === String(id)) || null;
}

export function clearHistory() {
  safeWrite([]);
}

// --- Filtering / aggregates -------------------------------------------------

export function filterHands(hands, { game, outcome, fromTs, toTs } = {}) {
  return hands.filter((h) => {
    if (game && game !== 'all' && h.game !== game) return false;
    if (outcome === 'wins' && h.delta <= 0) return false;
    if (outcome === 'losses' && h.delta >= 0) return false;
    if (outcome === 'pushes' && h.delta !== 0) return false;
    if (fromTs && h.ts < fromTs) return false;
    if (toTs && h.ts > toTs) return false;
    return true;
  });
}

export function aggregateHands(hands) {
  const handsPlayed = hands.length;
  const wagered = hands.reduce((s, h) => s + Math.abs(h.stake || 0), 0);
  const netPL = hands.reduce((s, h) => s + (h.delta || 0), 0);
  const wins = hands.filter((h) => h.delta > 0).length;
  const winRate = handsPlayed ? (wins / handsPlayed) * 100 : 0;
  const pls = hands.map((h) => h.delta || 0);
  const biggestWin = pls.length ? Math.max(0, ...pls) : 0;
  const biggestLoss = pls.length ? Math.min(0, ...pls) : 0;
  return { handsPlayed, wagered, netPL, winRate, biggestWin, biggestLoss };
}

// --- CSV export -------------------------------------------------------------

function csvEscape(v) {
  if (v === null || v === undefined) return '';
  const s = String(v);
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

export function handsToCsv(hands) {
  const head = [
    'id', 'timestamp', 'game', 'result', 'stake', 'delta',
    'summary', 'commitment', 'serverSeed', 'clientSeed', 'nonce',
  ];
  const rows = hands.map((h) => [
    h.id,
    new Date(h.ts).toISOString(),
    h.game,
    h.result,
    h.stake,
    h.delta,
    h.summary,
    h.pf?.commitment || '',
    h.pf?.serverSeed || '',
    h.pf?.clientSeed || '',
    h.pf?.nonce ?? '',
  ].map(csvEscape).join(','));
  return [head.join(','), ...rows].join('\n');
}

export function downloadCsv(hands, filename = 'social-stakes-history.csv') {
  const csv = handsToCsv(hands);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

// --- Display helpers --------------------------------------------------------

export const GAME_LABELS = {
  coinflip: 'Coin Flip',
  hilo: 'Hi-Lo',
  acey: 'Acey-Duecey',
  holdem: "Hold'em",
};
