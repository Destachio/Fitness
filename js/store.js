// store.js — all persistence (localStorage) + app state + actions.
import { DEFAULT_PLAN, PROGRAM_WEEKS, targetFor, PROGRAMS, programById } from './data.js';

const KEYS = {
  plan: 'fit.plan.v1',
  logs: 'fit.logs.v1',
  settings: 'fit.settings.v1',
  bodyweight: 'fit.bodyweight.v1',
  water: 'fit.water.v1',
};

function read(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function write(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// ---- Settings ----
const DEFAULT_SETTINGS = {
  athleteName: 'Athlete',
  startDate: null,        // ISO date string of program day 1
  pinHash: null,          // parent PIN (lightweight child-lock, not real security)
  weightUnit: 'kg',
  waterGoal: 8,           // glasses per day (~250 ml each)
  activeProgram: 'foundation',
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  write(KEYS.settings, next);
  return next;
}

// ---- Plan / programs ----
export function activeProgramId() { return getSettings().activeProgram || 'foundation'; }
export const PROGRAM_LIST = PROGRAMS.map((p) => ({ id: p.id, name: p.name, desc: p.desc }));

function seedPlan(programId) {
  const plan = structuredClone(programById(programId).plan);
  plan.createdAt = new Date().toISOString();
  write(KEYS.plan, plan);
  return plan;
}

export function getPlan() {
  let plan = read(KEYS.plan, null);
  if (!plan) {
    plan = seedPlan(activeProgramId());
    if (!getSettings().startDate) {
      saveSettings({ startDate: new Date().toISOString().slice(0, 10) });
    }
  } else {
    plan = migratePlan(plan);
  }
  return plan;
}

// Switch the active program, replacing the plan with that program's template.
export function loadProgram(programId) {
  saveSettings({ activeProgram: programId });
  return seedPlan(programId);
}

// Additively bring a Foundation plan up to the current default version — drop
// in any new default exercises (warm-up, cardio finishers) at their proper
// position — without wiping the user's edits. Only applies to Foundation.
function migratePlan(plan) {
  const prog = plan.program || 'foundation';
  if (prog !== 'foundation') return plan;
  if (plan.version === DEFAULT_PLAN.version) return plan;
  for (const defDay of DEFAULT_PLAN.days) {
    const day = plan.days.find((d) => d.id === defDay.id);
    if (!day) continue;
    defDay.exercises.forEach((defEx, defIdx) => {
      if (day.exercises.some((e) => e.id === defEx.id)) return;
      const at = Math.min(defIdx, day.exercises.length);
      day.exercises.splice(at, 0, structuredClone(defEx));
    });
  }
  plan.version = DEFAULT_PLAN.version;
  plan.program = 'foundation';
  write(KEYS.plan, plan);
  return plan;
}
export function savePlan(plan) {
  write(KEYS.plan, plan);
  return plan;
}
// Reset the plan to the active program's template.
export function resetPlanToDefault() {
  return seedPlan(activeProgramId());
}

export function getDay(dayId) {
  return getPlan().days.find((d) => d.id === dayId) || null;
}

// ---- Logs ----
// A log entry = one completed-or-in-progress session.
export function getLogs() {
  return read(KEYS.logs, []);
}
export function saveLog(log) {
  const logs = getLogs();
  const idx = logs.findIndex((l) => l.id === log.id);
  if (idx >= 0) logs[idx] = log;
  else logs.push(log);
  logs.sort((a, b) => new Date(a.date) - new Date(b.date));
  write(KEYS.logs, logs);
  return log;
}
export function deleteLog(id) {
  write(KEYS.logs, getLogs().filter((l) => l.id !== id));
}
export function getLog(id) {
  return getLogs().find((l) => l.id === id) || null;
}

// Build a fresh in-memory session for a given day + week (not yet saved).
export function newSession(dayId, week) {
  const day = getDay(dayId);
  if (!day) return null;
  return {
    id: 'sess_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
    date: new Date().toISOString(),
    week,
    dayId,
    dayName: day.name,
    completed: false,
    notes: '',
    entries: day.exercises.map((ex) => {
      const t = targetFor(ex, week);
      return {
        exerciseId: ex.id,
        name: ex.name,
        type: ex.type,
        note: ex.note,
        rest: ex.rest,
        targetSets: t.sets,
        targetReps: t.reps,
        sets: Array.from({ length: t.sets }, () => ({ weight: '', reps: '', done: false })),
      };
    }),
  };
}

// ---- Program scheduling / progress ----
// The default schedule is 3 sessions/week (A, B, C) across 4 weeks = 12 sessions.
export const SESSIONS_PER_WEEK = 3;
export const TOTAL_SESSIONS = PROGRAM_WEEKS * SESSIONS_PER_WEEK;

// Ordered list of {week, dayId} for the whole program.
export function programSchedule() {
  const plan = getPlan();
  const order = [];
  for (let w = 1; w <= PROGRAM_WEEKS; w++) {
    for (const day of plan.days) order.push({ week: w, dayId: day.id, dayName: day.name });
  }
  return order;
}

// How many planned sessions are completed.
export function completedCount() {
  return getLogs().filter((l) => l.completed).length;
}

// The next scheduled session the athlete should do.
export function nextScheduled() {
  const schedule = programSchedule();
  const done = completedCount();
  if (done >= schedule.length) return null; // program finished
  return schedule[done];
}

// ---- Stats for dashboard ----
export function sessionVolume(log) {
  let vol = 0;
  for (const e of log.entries) {
    if (e.type !== 'reps') continue; // weighted lifts only (skip time/cardio)
    for (const s of e.sets) {
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (s.done) vol += w * r;
    }
  }
  return Math.round(vol);
}

// Per-session progress for an exercise, in time order. For weighted lifts this
// is the heaviest working set; for time/cardio it's the best minutes/seconds.
export function exerciseHistory(exerciseId) {
  const points = [];
  for (const log of getLogs()) {
    if (!log.completed) continue;
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    if (entry.type === 'reps') {
      let best = 0, bestReps = 0;
      for (const s of entry.sets) {
        if (!s.done) continue;
        const w = parseFloat(s.weight) || 0;
        const r = parseInt(s.reps, 10) || 0;
        if (w > best || (w === best && r > bestReps)) { best = w; bestReps = r; }
      }
      if (best > 0) points.push({ date: log.date, value: best, reps: bestReps });
    } else {
      const v = maxReps(entry); // seconds (time) or minutes (cardio)
      if (v > 0) points.push({ date: log.date, value: v, reps: v });
    }
  }
  return points;
}
function maxReps(entry) {
  return entry.sets.reduce((m, s) => Math.max(m, s.done ? (parseInt(s.reps, 10) || 0) : 0), 0);
}

// All exercises that currently exist in the plan (for the progress picker).
export function planExercises() {
  const out = [];
  for (const d of getPlan().days) {
    for (const e of d.exercises) out.push({ id: e.id, name: e.name, day: d.name, type: e.type });
  }
  return out;
}

// Consecutive-day-ish streak based on distinct calendar days trained.
export function trainingStreak() {
  const days = [...new Set(getLogs().filter((l) => l.completed).map((l) => l.date.slice(0, 10)))].sort();
  if (!days.length) return 0;
  // Count back from the most recent trained day, allowing up to 3-day gaps
  // (so a normal 3x/week cadence keeps a streak alive).
  let streak = 1;
  for (let i = days.length - 1; i > 0; i--) {
    const gap = (new Date(days[i]) - new Date(days[i - 1])) / 86400000;
    if (gap <= 3) streak++;
    else break;
  }
  return streak;
}

// ---- Body weight ----
export function getBodyweights() {
  return read(KEYS.bodyweight, []).slice().sort((a, b) => a.date.localeCompare(b.date));
}
export function addBodyweight(weight, date) {
  const w = parseFloat(weight);
  if (!w || w <= 0) return null;
  const d = (date || new Date().toISOString().slice(0, 10));
  const list = read(KEYS.bodyweight, []);
  // One entry per day — replace if the same date already exists.
  const idx = list.findIndex((e) => e.date === d);
  const entry = { id: idx >= 0 ? list[idx].id : 'bw_' + Date.now().toString(36), date: d, weight: Math.round(w * 10) / 10 };
  if (idx >= 0) list[idx] = entry; else list.push(entry);
  write(KEYS.bodyweight, list);
  return entry;
}
export function deleteBodyweight(id) {
  write(KEYS.bodyweight, read(KEYS.bodyweight, []).filter((e) => e.id !== id));
}

// ---- Hydration (daily water counter, resets each calendar day) ----
function todayKey() { return new Date().toISOString().slice(0, 10); }
export function getWaterGoal() { return getSettings().waterGoal || 8; }
export function getWaterCount(date) {
  return read(KEYS.water, {})[date || todayKey()] || 0;
}
export function setWaterCount(count, date) {
  const map = read(KEYS.water, {});
  const d = date || todayKey();
  const n = Math.max(0, Math.min(50, Math.round(count)));
  if (n === 0) delete map[d]; else map[d] = n;
  write(KEYS.water, map);
  return n;
}
export function addWater(delta = 1, date) {
  return setWaterCount(getWaterCount(date) + delta, date);
}
// Number of distinct days the hydration goal was met (for badges).
export function waterGoalDaysHit() {
  const goal = getWaterGoal();
  return Object.values(read(KEYS.water, {})).filter((c) => c >= goal).length;
}

// ---- Personal bests ----
// Best working set inside one logged exercise entry. Cardio is excluded from
// personal bests (it's tracked as a chart, not a "beat your record" lift).
function bestEntryValue(entry) {
  if (entry.type === 'cardio') return { value: 0, reps: 0 };
  let value = 0, reps = 0;
  for (const s of entry.sets) {
    if (!s.done) continue;
    if (entry.type === 'time') {
      const sec = parseInt(s.reps, 10) || 0;
      if (sec > value) { value = sec; reps = sec; }
    } else {
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (w > value || (w === value && r > reps)) { value = w; reps = r; }
    }
  }
  return { value, reps };
}

// Best ever value for an exercise across completed logs (optionally excluding one).
export function exerciseBest(exerciseId, { excludeLogId = null } = {}) {
  let best = null;
  for (const log of getLogs()) {
    if (!log.completed || log.id === excludeLogId) continue;
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    const v = bestEntryValue(entry);
    if (v.value > 0 && (!best || v.value > best.value)) best = { ...v, date: log.date };
  }
  return best;
}

// PB list for the dashboard, one per current plan exercise that has history.
export function personalBests() {
  return planExercises()
    .map((ex) => ({ ...ex, best: exerciseBest(ex.id) }))
    .filter((x) => x.best);
}

// Given a (just-completed) log, which exercises set a NEW personal best?
export function detectNewPBs(log) {
  const out = [];
  for (const entry of log.entries) {
    const cur = bestEntryValue(entry);
    if (cur.value <= 0) continue;
    const prior = exerciseBest(entry.exerciseId, { excludeLogId: log.id });
    if (!prior || cur.value > prior.value) {
      out.push({ exerciseId: entry.exerciseId, name: entry.name, type: entry.type, value: cur.value, reps: cur.reps, prev: prior ? prior.value : null });
    }
  }
  return out;
}

// Is this PB's date the most recent completed-session date? (used to flag "NEW")
export function latestSessionDate() {
  const done = getLogs().filter((l) => l.completed);
  return done.length ? done[done.length - 1].date.slice(0, 10) : null;
}

// ---- PIN (lightweight, obfuscated child-lock — NOT cryptographic) ----
export function hashPin(pin) {
  let h = 2166136261;
  for (let i = 0; i < pin.length; i++) {
    h ^= pin.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return (h >>> 0).toString(16);
}
export function hasPin() {
  return !!getSettings().pinHash;
}
export function setPin(pin) {
  saveSettings({ pinHash: hashPin(String(pin)) });
}
export function checkPin(pin) {
  return getSettings().pinHash === hashPin(String(pin));
}

// Parent unlock lives in-memory for the tab session only.
let parentUnlocked = false;
export function isParentUnlocked() { return parentUnlocked || !hasPin(); }
export function unlockParent() { parentUnlocked = true; }
export function lockParent() { parentUnlocked = false; }

// ---- Export / import (backup) ----
export function exportData() {
  return JSON.stringify({
    plan: getPlan(),
    logs: getLogs(),
    settings: getSettings(),
    bodyweight: getBodyweights(),
    water: read(KEYS.water, {}),
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
export function importData(json) {
  const data = JSON.parse(json);
  if (data.plan) write(KEYS.plan, data.plan);
  if (data.logs) write(KEYS.logs, data.logs);
  if (data.settings) write(KEYS.settings, data.settings);
  if (data.bodyweight) write(KEYS.bodyweight, data.bodyweight);
  if (data.water) write(KEYS.water, data.water);
}
