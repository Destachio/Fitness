// store.js — all persistence (localStorage) + app state + actions.
import { DEFAULT_PLAN, PROGRAM_WEEKS, targetFor } from './data.js';

const KEYS = {
  plan: 'fit.plan.v1',
  logs: 'fit.logs.v1',
  settings: 'fit.settings.v1',
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
};

export function getSettings() {
  return { ...DEFAULT_SETTINGS, ...read(KEYS.settings, {}) };
}
export function saveSettings(patch) {
  const next = { ...getSettings(), ...patch };
  write(KEYS.settings, next);
  return next;
}

// ---- Plan ----
export function getPlan() {
  let plan = read(KEYS.plan, null);
  if (!plan) {
    plan = structuredClone(DEFAULT_PLAN);
    plan.createdAt = new Date().toISOString();
    write(KEYS.plan, plan);
    // Anchor the program start to today on first run.
    if (!getSettings().startDate) {
      saveSettings({ startDate: new Date().toISOString().slice(0, 10) });
    }
  }
  return plan;
}
export function savePlan(plan) {
  write(KEYS.plan, plan);
  return plan;
}
export function resetPlanToDefault() {
  const plan = structuredClone(DEFAULT_PLAN);
  plan.createdAt = new Date().toISOString();
  write(KEYS.plan, plan);
  return plan;
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
    if (e.type === 'time') continue;
    for (const s of e.sets) {
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (s.done) vol += w * r;
    }
  }
  return Math.round(vol);
}

// Best (heaviest) working set weight for an exercise across all logs, in time order.
export function exerciseHistory(exerciseId) {
  const points = [];
  for (const log of getLogs()) {
    if (!log.completed) continue;
    const entry = log.entries.find((e) => e.exerciseId === exerciseId);
    if (!entry) continue;
    let best = 0;
    let bestReps = 0;
    for (const s of entry.sets) {
      if (!s.done) continue;
      const w = parseFloat(s.weight) || 0;
      const r = parseInt(s.reps, 10) || 0;
      if (w > best || (w === best && r > bestReps)) { best = w; bestReps = r; }
    }
    if (best > 0 || entry.type === 'time') {
      points.push({ date: log.date, value: entry.type === 'time' ? maxReps(entry) : best, reps: bestReps });
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
    exportedAt: new Date().toISOString(),
  }, null, 2);
}
export function importData(json) {
  const data = JSON.parse(json);
  if (data.plan) write(KEYS.plan, data.plan);
  if (data.logs) write(KEYS.logs, data.logs);
  if (data.settings) write(KEYS.settings, data.settings);
}
