// data.js — the Functional Fit Father 13-week protocol.
// A 13-week block progression built to hit the GBRS Group performance
// standards. Borrows MARSOC assessment-prep structure (bodyweight volume,
// rucking, running under fatigue, grinders) scaled to what someone with a job
// and a family can recover from. The plan is editable by a parent.

export const PROGRAM_WEEKS = 13;

// Week-by-week cue shown on the session screen and in the Briefing.
// Blocks: Baseline (1) · Base (2–5) · Build (6–9) · Peak (10–12) · Retest (13)
export const PROGRESSION = [
  { week: 1,  block: 'Baseline', cue: 'Test, record, rest. No training this week — the seven numbers are the reading.' },
  { week: 2,  block: 'Base',     cue: 'Block 1 · Base — build the tissue. Learn the movements. Show up.' },
  { week: 3,  block: 'Base',     cue: 'Block 1 · Base — add 2.5 kg to the deadlift and bench if all reps were clean.' },
  { week: 4,  block: 'Base',     cue: 'Block 1 · Base — same work, more weight. Pull-ups every training day.' },
  { week: 5,  block: 'Base',     cue: 'Block 1 · Base — last base week. The grinder time should be dropping.' },
  { week: 6,  block: 'Build',    cue: 'Block 2 · Build — add load. Move the numbers.' },
  { week: 7,  block: 'Build',    cue: 'Block 2 · Build — heavier sets, longer carries, longer ruck.' },
  { week: 8,  block: 'Build',    cue: 'Block 2 · Build — three consistent 800m reps beat one fast one.' },
  { week: 9,  block: 'Build',    cue: 'Block 2 · Build — last build week. Keep form the stop signal.' },
  { week: 10, block: 'Peak',     cue: 'Block 3 · Peak — specificity. Train the test.' },
  { week: 11, block: 'Peak',     cue: 'Block 3 · Peak — measure every jump. Record the bodyweight bench set.' },
  { week: 12, block: 'Peak',     cue: 'Block 3 · Peak — final week. Skip the ruck load, walk unloaded.' },
  { week: 13, block: 'Retest',   cue: 'Retest. Same protocol as Week 1 — same order, same rest, same page.' },
];

export const BLOCKS = [
  { id: 'Baseline', name: 'Week 1 · Baseline',    weeks: '1',     purpose: 'Test, record, rest. No training.' },
  { id: 'Base',     name: 'Block 1 · Base',       weeks: '2–5',   purpose: 'Build the tissue. Learn the movements. Establish the habit of showing up.' },
  { id: 'Build',    name: 'Block 2 · Build',      weeks: '6–9',   purpose: 'Add load. Move the numbers.' },
  { id: 'Peak',     name: 'Block 3 · Peak',       weeks: '10–12', purpose: 'Specificity. Train the test.' },
  { id: 'Retest',   name: 'Week 13 · Retest',     weeks: '13',    purpose: 'Same protocol as Week 1. The two columns are the proof.' },
];

// type: 'reps' = weight + reps · 'time' = seconds · 'cardio' = minutes
// weeks: which program weeks this session runs in.
export const FFF_PLAN = {
  name: 'Functional Fit Father',
  program: 'fff',
  version: 1,
  createdAt: null,
  days: [
    // ---------- Week 1 baseline / Week 13 retest ----------
    {
      id: 't1', block: 'Baseline', weeks: [1, 13], name: 'Test 1 · Jump / Bench / Pull',
      exercises: [
        { id: 't1a', name: 'Broad Jump',            type: 'reps', sets: 3, reps: 1,   rest: 120, note: 'Best of 3, full rest. Measure against your own height. Record it on the Standards screen.' },
        { id: 't1b', name: 'Bench Press @ Bodyweight', type: 'reps', sets: 1, reps: 10, rest: 0,  note: 'Bodyweight on the bar, reps to failure. Spotter or safeties. Zero is a reading — record it on Standards.' },
        { id: 't1c', name: 'Pull-ups (max)',        type: 'reps', sets: 1, reps: 10,  rest: 0,   note: 'One set. Strict, dead hang to chin over the bar. Record it on Standards.' },
      ],
    },
    {
      id: 't2', block: 'Baseline', weeks: [1, 13], name: 'Test 2 · Deadlift / Plank',
      exercises: [
        { id: 't2a', name: 'Trap Bar Deadlift (heavy 5)', type: 'reps', sets: 1, reps: 5,   rest: 0, note: 'Work up to a heavy 5 with good form. Stop when form breaks, not when it gets hard. Record weight ÷ bodyweight on Standards.' },
        { id: 't2b', name: 'Plank (to failure)',    type: 'time', sets: 1, reps: 120, rest: 0, note: 'Hold to failure and time it. Record it on Standards.' },
      ],
    },
    {
      id: 't3', block: 'Baseline', weeks: [1, 13], name: 'Test 3 · Carry / 800m',
      exercises: [
        { id: 't3a', name: "Farmer's Carry (max distance)", type: 'reps', sets: 1, reps: 175, rest: 0, note: 'Two handles totalling your bodyweight. Walk until you set them down. Reps = feet carried. Record on Standards.' },
        { id: 't3b', name: '800m Run',              type: 'time', sets: 1, reps: 195, rest: 0, note: 'Rest fully first, then full effort on a track or measured route. Record on Standards.' },
      ],
    },

    // ---------- Block 1: Base (weeks 2–5) ----------
    {
      id: 'b1mon', block: 'Base', weeks: [2, 3, 4, 5], name: 'Mon · Lower + Jump',
      exercises: [
        { id: 'b1m1', name: 'Broad Jump',           type: 'reps', sets: 3, reps: 3,  rest: 120, note: 'Full rest between sets. Stick the landing. Stop the moment you get slower — jumps are practice, not conditioning.' },
        { id: 'b1m2', name: 'Trap Bar Deadlift',    type: 'reps', sets: 5, reps: 5,  rest: 150, note: '70–75% of your Week 1 heavy 5. Add 2.5 kg per week if all reps are clean.' },
        { id: 'b1m3', name: 'Bulgarian Split Squat',type: 'reps', sets: 3, reps: 8,  rest: 90,  note: '8 per leg. Bodyweight or light dumbbells.' },
        { id: 'b1m4', name: 'Hardstyle Plank',      type: 'time', sets: 5, reps: 20, rest: 45,  note: 'Squeeze everything — fists, quads, glutes, abs. Not a passive hold.' },
        { id: 'b1m5', name: 'Pull-ups',             type: 'reps', sets: 3, reps: 6,  rest: 120, note: 'Stop 2 reps short of failure. Never to failure except on test day.' },
      ],
    },
    {
      id: 'b1tue', block: 'Base', weeks: [2, 3, 4, 5], name: 'Tue · Upper + Carry',
      exercises: [
        { id: 'b1t1', name: 'Bench Press',          type: 'reps', sets: 5, reps: 5,  rest: 150, note: '70–75% of bodyweight. Add 2.5 kg per week.' },
        { id: 'b1t2', name: 'Pull-ups',             type: 'reps', sets: 5, reps: 6,  rest: 120, note: 'Stop 2 short of failure. Under 5 reps? Use a band or negatives (3–5 second lower).' },
        { id: 'b1t3', name: 'Dumbbell Row',         type: 'reps', sets: 3, reps: 10, rest: 90,  note: '10 per side. Heavy.' },
        { id: 'b1t4', name: "Farmer's Carry",       type: 'reps', sets: 4, reps: 20, rest: 90,  note: '4 trips of 20 m at 60% bodyweight total. Reps = metres per trip. Chalk allowed, straps are not.' },
        { id: 'b1t5', name: 'Push-ups',             type: 'reps', sets: 3, reps: 12, rest: 60,  note: 'Stop 2 short of failure.' },
      ],
    },
    {
      id: 'b1thu', block: 'Base', weeks: [2, 3, 4, 5], name: 'Thu · Run + Grinder',
      exercises: [
        { id: 'b1h1', name: 'Warm-up Jog',          type: 'cardio', sets: 1, reps: 10, rest: 0,  note: '10 minutes easy.' },
        { id: 'b1h2', name: '400m Repeats',         type: 'time', sets: 4, reps: 100, rest: 120, note: '4 × 400m at a pace you can hold for all four. Rest 2 min. Target ≈ half your Week 1 800m time + 5s. Log each rep in seconds.' },
        { id: 'b1h3', name: 'Grinder (3 rounds)',   type: 'time', sets: 1, reps: 900, rest: 0,   note: '3 rounds for time, no rest between movements: 10 pull-ups (or max under 10) · 20 push-ups · 30 air squats · 40 flutter kicks · 10 burpees. Log total seconds — it should drop every week.' },
      ],
    },
    {
      id: 'b1sat', block: 'Base', weeks: [2, 3, 4, 5], name: 'Sat · Full Body + Ruck',
      exercises: [
        { id: 'b1s1', name: 'Kettlebell Swings',    type: 'reps', sets: 5, reps: 15, rest: 60, note: 'Hips, not arms. Snap to the top.' },
        { id: 'b1s2', name: 'Goblet Squat',         type: 'reps', sets: 3, reps: 10, rest: 60, note: 'Chest up, sit between the hips.' },
        { id: 'b1s3', name: 'Pull-ups',             type: 'reps', sets: 3, reps: 5,  rest: 90, note: '3 easy sets. Volume wins here.' },
        { id: 'b1s4', name: 'Plank',                type: 'time', sets: 3, reps: 30, rest: 45, note: 'Straight line, tight core.' },
        { id: 'b1s5', name: 'Ruck',                 type: 'cardio', sets: 1, reps: 45, rest: 0, note: '45 minutes with 10 kg. Brisk walk. Do not run with a pack.' },
      ],
    },

    // ---------- Block 2: Build (weeks 6–9) ----------
    {
      id: 'b2mon', block: 'Build', weeks: [6, 7, 8, 9], name: 'Mon · Lower + Jump',
      exercises: [
        { id: 'b2m1', name: 'Broad Jump',           type: 'reps', sets: 4, reps: 3,  rest: 120, note: 'Add a 5 kg weight vest for the first 2 sets, then take it off — you will feel faster.' },
        { id: 'b2m2', name: 'Trap Bar Deadlift',    type: 'reps', sets: 4, reps: 4,  rest: 180, note: '80–85%. Then one extra set of 5 at 75%.' },
        { id: 'b2m3', name: 'Rear-Foot-Elevated Split Squat', type: 'reps', sets: 3, reps: 6, rest: 90, note: '6 per leg. Loaded.' },
        { id: 'b2m4', name: 'Hardstyle Plank',      type: 'time', sets: 4, reps: 40, rest: 45,  note: 'Full-body tension for the whole 40 seconds.' },
        { id: 'b2m5', name: 'Pull-ups',             type: 'reps', sets: 3, reps: 8,  rest: 120, note: 'Add weight if you exceed 10 clean reps.' },
      ],
    },
    {
      id: 'b2tue', block: 'Build', weeks: [6, 7, 8, 9], name: 'Tue · Upper + Carry',
      exercises: [
        { id: 'b2t1', name: 'Bench Press',          type: 'reps', sets: 4, reps: 4,  rest: 180, note: '80–85% bodyweight. Then one set of 8 at 70% — the 8-rep set is building your standard.' },
        { id: 'b2t2', name: 'Pull-ups',             type: 'reps', sets: 6, reps: 6,  rest: 120, note: '6 sets. Stop 1 short of failure.' },
        { id: 'b2t3', name: 'Barbell Row',          type: 'reps', sets: 4, reps: 6,  rest: 90,  note: 'Barbell or heavy dumbbell.' },
        { id: 'b2t4', name: "Farmer's Carry",       type: 'reps', sets: 5, reps: 25, rest: 90,  note: '5 trips of 25 m at 80% bodyweight total. Reps = metres per trip.' },
        { id: 'b2t5', name: 'Dips',                 type: 'reps', sets: 3, reps: 10, rest: 90,  note: 'Dips or close-grip push-ups, 8–12 reps.' },
      ],
    },
    {
      id: 'b2thu', block: 'Build', weeks: [6, 7, 8, 9], name: 'Thu · Run + Grinder',
      exercises: [
        { id: 'b2h1', name: 'Warm-up Jog',          type: 'cardio', sets: 1, reps: 10, rest: 0,  note: '10 minutes easy.' },
        { id: 'b2h2', name: '800m Repeats',         type: 'time', sets: 3, reps: 205, rest: 180, note: '3 × 800m, rest 3 min. Each rep at your Week 1 time + 10s. The goal is three consistent reps, not one fast one.' },
        { id: 'b2h3', name: 'Grinder (4 rounds)',   type: 'time', sets: 1, reps: 1200, rest: 0,  note: '4 rounds, same movements: 10 pull-ups · 20 push-ups · 30 air squats · 40 flutter kicks · 10 burpees. Add 10 kg in a backpack for the air squats.' },
      ],
    },
    {
      id: 'b2sat', block: 'Build', weeks: [6, 7, 8, 9], name: 'Sat · Full Body + Ruck',
      exercises: [
        { id: 'b2s1', name: 'Kettlebell Swings',    type: 'reps', sets: 5, reps: 20, rest: 60, note: 'Hips, not arms.' },
        { id: 'b2s2', name: 'Sandbag Bear-Hug Carry', type: 'reps', sets: 4, reps: 30, rest: 90, note: '4 × 30 m, bear hug. Reps = metres per trip.' },
        { id: 'b2s3', name: 'Pull-ups',             type: 'reps', sets: 3, reps: 6,  rest: 90, note: '3 sets.' },
        { id: 'b2s4', name: 'Hollow Body Hold',     type: 'time', sets: 3, reps: 30, rest: 45, note: 'Lower back pinned to the floor.' },
        { id: 'b2s5', name: 'Ruck',                 type: 'cardio', sets: 1, reps: 60, rest: 0, note: '60 minutes with 15 kg. Brisk walk.' },
      ],
    },

    // ---------- Block 3: Peak (weeks 10–12) ----------
    {
      id: 'b3mon', block: 'Peak', weeks: [10, 11, 12], name: 'Mon · Lower + Jump',
      exercises: [
        { id: 'b3m1', name: 'Broad Jump',           type: 'reps', sets: 5, reps: 2,  rest: 120, note: 'Measure every jump. Put tape on the floor.' },
        { id: 'b3m2', name: 'Trap Bar Deadlift',    type: 'reps', sets: 3, reps: 3,  rest: 180, note: '85–90%. Then 1 × 5 at the weight you intend to hit at retest (1.5× bodyweight, or your target).' },
        { id: 'b3m3', name: 'Hardstyle Plank',      type: 'time', sets: 3, reps: 60, rest: 60,  note: '60 seconds of full tension.' },
        { id: 'b3m4', name: 'Pull-ups',             type: 'reps', sets: 2, reps: 4,  rest: 150, note: '2 sets, weighted, low reps.' },
      ],
    },
    {
      id: 'b3tue', block: 'Peak', weeks: [10, 11, 12], name: 'Tue · Upper + Carry',
      exercises: [
        { id: 'b3t1', name: 'Bench Press',          type: 'reps', sets: 3, reps: 3,  rest: 180, note: '90% bodyweight. Then 1 set at bodyweight for as many clean reps as possible — record it.' },
        { id: 'b3t2', name: 'Pull-ups',             type: 'reps', sets: 5, reps: 5,  rest: 120, note: '1 max set, then 4 sets at half that number.' },
        { id: 'b3t3', name: "Farmer's Carry",       type: 'reps', sets: 3, reps: 30, rest: 120, note: '3 trips at 100% bodyweight total. Measure distance on the third trip. Reps = metres.' },
        { id: 'b3t4', name: 'Rows',                 type: 'reps', sets: 3, reps: 8,  rest: 90,  note: 'Barbell or dumbbell.' },
      ],
    },
    {
      id: 'b3thu', block: 'Peak', weeks: [10, 11, 12], name: 'Thu · Run + Grinder',
      exercises: [
        { id: 'b3h1', name: 'Warm-up Jog',          type: 'cardio', sets: 1, reps: 10, rest: 0,  note: '10 minutes easy.' },
        { id: 'b3h2', name: '800m at Target Pace',  type: 'time', sets: 2, reps: 195, rest: 300, note: '2 × 800m at target pace (3:15 or your goal). Rest 5 min. If you hit both, you are ready.' },
        { id: 'b3h3', name: 'Grinder (2 rounds)',   type: 'time', sets: 1, reps: 600, rest: 0,   note: '2 rounds only. Fast.' },
      ],
    },
    {
      id: 'b3sat', block: 'Peak', weeks: [10, 11, 12], name: 'Sat · Full Body + Ruck',
      exercises: [
        { id: 'b3s1', name: 'Kettlebell Swings',    type: 'reps', sets: 3, reps: 15, rest: 60, note: 'Crisp and light.' },
        { id: 'b3s2', name: 'Light Full Body Circuit', type: 'cardio', sets: 1, reps: 20, rest: 0, note: '20 minutes, easy pace. Nothing heavy.' },
        { id: 'b3s3', name: 'Ruck',                 type: 'cardio', sets: 1, reps: 45, rest: 0, note: '45 minutes with 15 kg. Week 12: skip the load and walk unloaded.' },
      ],
    },
  ],
};

// Recovery days and the standing rules, shown in the Briefing.
export const PROGRAM_RULES = [
  'Pull-ups every training day. Even Thursday. Volume wins here.',
  'Wed / Fri / Sun: walk, stretch, sleep. Recovery is a session.',
  'Sleep is a training variable. Under 6 hours, cut the session to the first two exercises and go home.',
  'Nothing gets added to the program. If you want to add, remove something first.',
  'Missed session: skip it. Do not double up. Four good sessions beat five bad ones.',
  'Pain in a joint: stop the movement, keep the session. Pain in a muscle: keep going.',
  'The only progress metric is the retest page. Not the mirror.',
];

export const DEFAULT_PLAN = FFF_PLAN;

// ---- Program library ----
export const PROGRAMS = [
  { id: 'fff', name: 'Functional Fit Father', desc: '13-week protocol to hit the GBRS Group performance standards.', plan: FFF_PLAN },
];
export function programById(id) {
  return PROGRAMS.find((p) => p.id === id) || PROGRAMS[0];
}

// Which sessions run in a given program week.
export function daysForWeek(plan, week) {
  return (plan.days || []).filter((d) => !d.weeks || d.weeks.includes(week));
}

// Targets are written explicitly per block, so there is no automatic ramp —
// load progression lives in each exercise's note ("add 2.5 kg per week").
export function targetFor(exercise) {
  return { sets: exercise.sets, reps: exercise.reps };
}
