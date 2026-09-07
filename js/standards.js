// standards.js — performance benchmarks + tier scoring for the radar.
// Tiers per benchmark: The Standard (1) · Elite (2) · Be a Pro (3).
// Each metric maps a raw result to a 0–3 score via 4 breakpoints B:
//   B = [zero, standard, elite, pro]  (monotonic in the "better" direction)
// kind: how the input is parsed/shown — 'int', 'dec', or 'time' (mm:ss).

export const METRICS = [
  { key: 'bench',    label: 'Bench Press',       short: 'Bench',      unit: 'reps @ BW',       kind: 'int',  B: [0, 10, 15, 20],        tiers: ['10', '15', '20+'],   hint: 'Reps pressing your bodyweight' },
  { key: 'deadlift', label: 'Trap Bar Deadlift', short: 'Deadlift',   unit: '× BW (5 reps)',   kind: 'dec',  B: [1, 1.5, 1.75, 2],      tiers: ['1.5×', '1.75×', '2×'], hint: 'Weight for 5 reps as a multiple of bodyweight' },
  { key: 'run800',   label: '800 m Run',         short: '800m',       unit: 'time',            kind: 'time', B: [240, 195, 180, 165],   tiers: ['3:15', '3:00', '2:45'], hint: '800 metre run time (lower is better)' },
  { key: 'broad',    label: 'Broad Jump',        short: 'Broad Jump', unit: 'in past height',  kind: 'int',  B: [-12, 0, 12, 24],       tiers: ['Hght', '+12', '+24'], hint: 'Jump distance past your own height, in inches' },
  { key: 'farmer',   label: "Farmer's Carry",    short: 'Carry',      unit: 'ft @ BW',         kind: 'int',  B: [0, 175, 225, 250],     tiers: ['175', '225', '250+'], hint: 'Feet carried holding your bodyweight' },
  { key: 'pullups',  label: 'Pull-ups',          short: 'Pull-ups',   unit: 'reps',            kind: 'int',  B: [0, 10, 15, 20],        tiers: ['10', '15', '20+'],   hint: 'Strict pull-up reps' },
  { key: 'plank',    label: 'Plank',             short: 'Plank',      unit: 'time',            kind: 'time', B: [0, 120, 150, 180],     tiers: ['2:00', '2:30', '3:00'], hint: 'Plank hold time (higher is better)' },
];

export const TIER_LABELS = ['The Standard', 'Elite', 'Be a Pro'];

// Raw value -> 0..3 score (piecewise linear between breakpoints; clamped 0..3).
export function scoreOf(v, B) {
  if (v == null || Number.isNaN(v)) return 0;
  const asc = B[3] >= B[0];
  const better = (a, b) => (asc ? a - b : b - a); // >0 when a is "better" than b
  if (better(v, B[0]) <= 0) return 0;
  if (better(v, B[3]) >= 0) return 3;
  for (let i = 0; i < 3; i++) {
    const lo = B[i], hi = B[i + 1];
    const inSeg = asc ? (v >= lo && v <= hi) : (v <= lo && v >= hi);
    if (inSeg) return i + (v - lo) / (hi - lo);
  }
  return 0;
}

export function tierName(score) {
  if (score >= 3) return 'Be a Pro';
  if (score >= 2) return 'Elite';
  if (score >= 1) return 'The Standard';
  return '—';
}

// ---- value parsing / formatting ----
export function parseTime(str) {
  const s = String(str).trim();
  if (s === '') return null;
  if (s.includes(':')) {
    const [m, sec] = s.split(':');
    const mins = parseInt(m, 10) || 0;
    const secs = parseInt(sec, 10) || 0;
    return mins * 60 + secs;
  }
  const n = parseFloat(s);
  return Number.isNaN(n) ? null : n;
}
export function fmtTime(sec) {
  if (sec == null || Number.isNaN(sec)) return '–';
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}
export function parseValue(kind, str) {
  if (str === '' || str == null) return null;
  if (kind === 'time') return parseTime(str);
  if (kind === 'dec') { const n = parseFloat(str); return Number.isNaN(n) ? null : n; }
  const n = parseInt(str, 10); return Number.isNaN(n) ? null : n;
}
export function fmtValue(kind, v) {
  if (v == null || Number.isNaN(v)) return '–';
  if (kind === 'time') return fmtTime(v);
  if (kind === 'dec') return String(v);
  return String(v);
}
