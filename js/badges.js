// badges.js — progression achievements, earned live from stored progress.
import * as S from './store.js';
import { METRICS, scoreOf } from './standards.js';

// Each badge: { id, name, desc, icon (emoji), test(ctx) -> bool }.
// ctx is a snapshot of the athlete's stats, computed once per evaluation.
const DEFS = [
  { id: 'first-mission', name: 'First Mission',  icon: '🎯', desc: 'Complete your first session',        test: (c) => c.sessions >= 1 },
  { id: 'boot-camp',     name: 'Boot Camp',      icon: '🥾', desc: 'Complete 3 sessions',                test: (c) => c.sessions >= 3 },
  { id: 'rifleman',      name: 'Rifleman',       icon: '🎖️', desc: 'Complete 5 sessions',               test: (c) => c.sessions >= 5 },
  { id: 'operator',      name: 'Operator',       icon: '🏅', desc: 'Complete 10 sessions',               test: (c) => c.sessions >= 10 },
  { id: 'mission-done',  name: 'Protocol Complete',icon: '🏆', desc: 'Finish all 13 weeks',                test: (c) => c.sessions >= c.programTotal },
  { id: 'veteran',       name: 'Veteran',        icon: '⭐', desc: 'Complete 25 sessions',               test: (c) => c.sessions >= 25 },
  { id: 'warrior',       name: 'Warrior',        icon: '👑', desc: 'Complete 50 sessions',               test: (c) => c.sessions >= 50 },
  { id: 'first-blood',   name: 'First Blood',    icon: '💪', desc: 'Set your first personal best',        test: (c) => c.pbs >= 1 },
  { id: 'record-breaker',name: 'Record Breaker', icon: '📈', desc: 'Hold PBs in 5 exercises',            test: (c) => c.pbs >= 5 },
  { id: 'on-a-roll',     name: 'On a Roll',      icon: '🔥', desc: 'Reach a 3-session streak',           test: (c) => c.streak >= 3 },
  { id: 'relentless',    name: 'Relentless',     icon: '⚡', desc: 'Reach a 6-session streak',           test: (c) => c.streak >= 6 },
  { id: 'checkpoint',    name: 'Checkpoint',     icon: '⚖️', desc: 'Log your body weight',               test: (c) => c.weighIns >= 1 },
  { id: 'hydrated',      name: 'Hydrated',       icon: '💧', desc: 'Hit your water goal for a day',       test: (c) => c.waterDays >= 1 },
  { id: 'water-disc',    name: 'Water Discipline',icon: '🌊', desc: 'Hit your water goal on 5 days',      test: (c) => c.waterDays >= 5 },
  { id: 'benchmarked',   name: 'Benchmarked',    icon: '🎯', desc: 'Log a performance standards test',    test: (c) => c.benchmarks >= 1 },
  { id: 'baseline-set',  name: 'Baseline Set',   icon: '📋', desc: 'Record all 7 standards — the reading', test: (c) => c.benchmarks >= 7 },
  { id: 'standard',      name: 'The Standard',   icon: '🛡️', desc: 'Reach The Standard on any test',      test: (c) => c.standardHits >= 1 },
  { id: 'elite',         name: 'Elite',          icon: '💠', desc: 'Reach Elite on any test',             test: (c) => c.eliteHits >= 1 },
];

function snapshot() {
  const std = S.getStandards();
  const scores = METRICS.map((m) => (std[m.key] != null ? scoreOf(std[m.key], m.B) : 0));
  return {
    sessions: S.completedCount(),
    programTotal: S.totalSessions(),
    pbs: S.personalBests().length,
    streak: S.trainingStreak(),
    weighIns: S.getBodyweights().length,
    waterDays: S.waterGoalDaysHit(),
    benchmarks: Object.keys(std).length,
    standardHits: scores.filter((s) => s >= 1).length,
    eliteHits: scores.filter((s) => s >= 2).length,
  };
}

// All badges with a live `earned` flag, in display order.
export function allBadges() {
  const c = snapshot();
  return DEFS.map((b) => ({ id: b.id, name: b.name, icon: b.icon, desc: b.desc, earned: b.test(c) }));
}

export function earnedBadges() { return allBadges().filter((b) => b.earned); }
export function earnedBadgeIdSet() { return new Set(earnedBadges().map((b) => b.id)); }
export function badgeCounts() {
  const all = allBadges();
  return { earned: all.filter((b) => b.earned).length, total: all.length };
}
