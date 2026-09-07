// data.js — default 4-week program + exercise notes.
// The plan is editable by a parent; this is just the seed/default.

export const PROGRAM_WEEKS = 4;

// Progression scheme applied automatically on top of each exercise's base
// sets/reps, so a parent only edits the base day and the 4 weeks ramp up.
//  - addSets:  extra sets added this week
//  - addReps:  extra reps added to the target this week
//  - cue:      short coaching note shown for the week
export const PROGRESSION = [
  { week: 1, addSets: 0, addReps: 0, cue: 'Learn the movements. Keep it light and focus on clean form.' },
  { week: 2, addSets: 0, addReps: 0, cue: 'Same reps — add a small amount of weight if last week felt easy.' },
  { week: 3, addSets: 0, addReps: 2, cue: 'Push the reps up. Last 2 reps should feel challenging.' },
  { week: 4, addSets: 1, addReps: 0, cue: 'Extra set this week. Beat your earlier numbers where you can.' },
];

// type: 'reps' = weight + reps;  'time' = seconds held;  'cardio' = minutes (conditioning)
// fixed: true  = skip the weekly progression ramp (e.g. a constant warm-up)
export const DEFAULT_PLAN = {
  name: '4-Week Foundation',
  program: 'foundation',
  version: 3, // bump to push additive plan updates to existing devices
  createdAt: null, // set when seeded
  days: [
    {
      id: 'dayA',
      name: 'Day A · Full Body',
      exercises: [
        { id: 'warmup', name: 'Incline Walk (Warm-up)', type: 'cardio', sets: 1, reps: 10, rest: 0, fixed: true, note: '10 min · treadmill level 5 · 10° incline. Get the blood flowing before lifting.' },
        { id: 'a1', name: 'Goblet Squat',          type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Hold one dumbbell at your chest. Sit back, chest up, knees out.' },
        { id: 'a2', name: 'Machine Chest Press',    type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Push smoothly. Don’t slam the lockout.' },
        { id: 'a3', name: 'Lat Pulldown',           type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Pull the bar to your upper chest, squeeze your back.' },
        { id: 'a4', name: 'Seated Cable Row',       type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Squeeze shoulder blades together, don’t lean back too far.' },
        { id: 'a5', name: 'Dumbbell Shoulder Press',type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Sit tall, press overhead, control the way down.' },
        { id: 'a6', name: 'Plank',                  type: 'time', sets: 3, reps: 30, rest: 60, note: 'Straight line from head to heels. Tight core.' },
        { id: 'a7', name: 'Rowing Machine',         type: 'cardio', sets: 1, reps: 10, rest: 0, note: 'Steady-pace finisher — 10 min. Drive with the legs, then pull.' },
      ],
    },
    {
      id: 'dayB',
      name: 'Day B · Full Body',
      exercises: [
        { id: 'warmup', name: 'Incline Walk (Warm-up)', type: 'cardio', sets: 1, reps: 10, rest: 0, fixed: true, note: '10 min · treadmill level 5 · 10° incline. Get the blood flowing before lifting.' },
        { id: 'b1', name: 'Leg Press',                  type: 'reps', sets: 3, reps: 12, rest: 90, note: 'Feet shoulder width. Don’t lock the knees hard.' },
        { id: 'b2', name: 'Incline Dumbbell Press',     type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Slight incline. Lower under control.' },
        { id: 'b3', name: 'Assisted Pull-up',           type: 'reps', sets: 3, reps: 8,  rest: 90, note: 'Use the assist pad. Pull chest toward the bar.' },
        { id: 'b4', name: 'Dumbbell Romanian Deadlift', type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Light weight. Hinge at the hips, slight knee bend, flat back.' },
        { id: 'b5', name: 'Dumbbell Lateral Raise',     type: 'reps', sets: 3, reps: 12, rest: 60, note: 'Light dumbbells. Raise to shoulder height, lead with elbows.' },
        { id: 'b6', name: 'Cable Crunch',               type: 'reps', sets: 3, reps: 12, rest: 60, note: 'Crunch with your abs, not your arms.' },
        { id: 'b7', name: 'Incline Treadmill Walk',     type: 'cardio', sets: 1, reps: 12, rest: 0, note: '12 min, brisk pace on an incline. Hands off the rails.' },
      ],
    },
    {
      id: 'dayC',
      name: 'Day C · Full Body',
      exercises: [
        { id: 'warmup', name: 'Incline Walk (Warm-up)', type: 'cardio', sets: 1, reps: 10, rest: 0, fixed: true, note: '10 min · treadmill level 5 · 10° incline. Get the blood flowing before lifting.' },
        { id: 'c1', name: 'Dumbbell Lunge',     type: 'reps', sets: 3, reps: 10, rest: 90, note: '10 reps each leg. Step out, knee tracks over the foot.' },
        { id: 'c2', name: 'Chest Fly (Pec Deck)',type: 'reps', sets: 3, reps: 12, rest: 60, note: 'Squeeze chest at the middle, slow on the way back.' },
        { id: 'c3', name: 'Machine Row',        type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Drive elbows back, chest against the pad.' },
        { id: 'c4', name: 'Face Pull',          type: 'reps', sets: 3, reps: 15, rest: 60, note: 'Light. Pull the rope to your face, elbows high. Great for posture.' },
        { id: 'c5', name: 'Dumbbell Bicep Curl',type: 'reps', sets: 3, reps: 12, rest: 60, note: 'No swinging — let the arms do the work.' },
        { id: 'c6', name: 'Tricep Pushdown',    type: 'reps', sets: 3, reps: 12, rest: 60, note: 'Keep elbows pinned to your sides.' },
        { id: 'c7', name: 'Bike Intervals',     type: 'cardio', sets: 1, reps: 10, rest: 0, note: '10 min: 30s hard / 90s easy, repeat. Big conditioning hit.' },
      ],
    },
  ],
};

// Shared warm-up used at the front of every day.
const WARMUP = { id: 'warmup', name: 'Incline Walk (Warm-up)', type: 'cardio', sets: 1, reps: 10, rest: 0, fixed: true, note: '10 min · treadmill level 5 · 10° incline. Get the blood flowing before training.' };

// ---- MARSOC-style PT program ----
// Inspired by Marine Raider (MARSOC) Assessment & Selection prep: strength,
// endurance/rucking, and calisthenics/grit. Scaled for a teen beginner — keep
// loads light, form first. (Farmer's Carry logs weight held; "reps" = metres.)
export const MARSOC_PLAN = {
  name: 'MARSOC PT',
  program: 'marsoc',
  version: 1,
  createdAt: null,
  days: [
    {
      id: 'r1',
      name: 'Day 1 · Raider Strength',
      exercises: [
        WARMUP,
        { id: 'm11', name: 'Back Squat',            type: 'reps', sets: 4, reps: 8,  rest: 120, note: 'Brace the core, sit between the hips, drive up through the heels.' },
        { id: 'm12', name: 'Pull-ups',              type: 'reps', sets: 4, reps: 6,  rest: 120, note: 'Dead hang to chin over the bar. Use a band if needed.' },
        { id: 'm13', name: 'Standing Overhead Press',type: 'reps', sets: 3, reps: 8, rest: 90,  note: 'Squeeze glutes, press straight overhead, don’t arch the back.' },
        { id: 'm14', name: 'Trap Bar Deadlift',     type: 'reps', sets: 3, reps: 6,  rest: 120, note: 'Flat back, push the floor away. Light and clean.' },
        { id: 'm15', name: 'Farmer’s Carry',        type: 'reps', sets: 3, reps: 40, rest: 90,  note: 'Heavy dumbbells, tall posture. "Reps" = metres carried.' },
        { id: 'm16', name: 'Plank',                 type: 'time', sets: 3, reps: 45, rest: 60,  note: 'Straight line, tight core, breathe.' },
        { id: 'm17', name: 'Row Finisher',          type: 'cardio', sets: 1, reps: 10, rest: 0, note: '10 min steady row to finish.' },
      ],
    },
    {
      id: 'r2',
      name: 'Day 2 · Raider Endurance',
      exercises: [
        WARMUP,
        { id: 'm21', name: 'Run Intervals',         type: 'cardio', sets: 1, reps: 15, rest: 0, note: '15 min: 30s hard / 90s easy, repeat. Track your distance.' },
        { id: 'm22', name: 'Weighted Ruck / Incline',type: 'cardio', sets: 1, reps: 15, rest: 0, note: '15 min incline walk with a light weighted vest or pack.' },
        { id: 'm23', name: 'Walking Lunge',         type: 'reps', sets: 3, reps: 12, rest: 90, note: '12 each leg. Long steps, knee tracks the toe.' },
        { id: 'm24', name: 'Box Step-ups',          type: 'reps', sets: 3, reps: 12, rest: 60, note: '12 each leg onto a knee-height box. Drive through the top foot.' },
        { id: 'm25', name: 'Hanging Leg Raise',     type: 'reps', sets: 3, reps: 12, rest: 60, note: 'Control the legs up and down, no swinging.' },
        { id: 'm26', name: 'Plank',                 type: 'time', sets: 3, reps: 60, rest: 60, note: 'Hold 60s. Finish strong.' },
      ],
    },
    {
      id: 'r3',
      name: 'Day 3 · Raider Grit',
      exercises: [
        WARMUP,
        { id: 'm31', name: 'Push-ups',              type: 'reps', sets: 4, reps: 15, rest: 60, note: 'Chest to fists, straight body. Drop to knees if form slips.' },
        { id: 'm32', name: 'Pull-ups',              type: 'reps', sets: 4, reps: 6,  rest: 90, note: 'As many clean reps as you can, band-assisted if needed.' },
        { id: 'm33', name: 'Dips',                  type: 'reps', sets: 3, reps: 10, rest: 90, note: 'Bench or bars. Lower under control, don’t shrug.' },
        { id: 'm34', name: 'Jump Squats',           type: 'reps', sets: 3, reps: 15, rest: 60, note: 'Explode up, land soft with bent knees.' },
        { id: 'm35', name: 'Sit-ups',               type: 'reps', sets: 3, reps: 25, rest: 45, note: 'Full range, hands to thighs. Steady pace.' },
        { id: 'm36', name: 'Mountain Climbers',     type: 'time', sets: 3, reps: 40, rest: 45, note: '40s fast. Hips down, drive the knees.' },
        { id: 'm37', name: 'Run Finisher',          type: 'cardio', sets: 1, reps: 12, rest: 0, note: '12 min steady run or brisk incline walk.' },
      ],
    },
  ],
};

// ---- Program library ----
export const PROGRAMS = [
  { id: 'foundation', name: '4-Week Foundation', desc: 'Full-body 3×/week — the beginner starting point.', plan: DEFAULT_PLAN },
  { id: 'marsoc', name: 'MARSOC PT', desc: 'Raider-style strength, endurance & grit. 3×/week, more demanding.', plan: MARSOC_PLAN },
];
export function programById(id) {
  return PROGRAMS.find((p) => p.id === id) || PROGRAMS[0];
}

// Compute the target sets/reps for an exercise in a given week (1-based).
export function targetFor(exercise, week) {
  const prog = PROGRESSION.find((p) => p.week === week) || PROGRESSION[0];
  if (exercise.fixed) {
    // Fixed work (e.g. the warm-up) never ramps — same every week.
    return { sets: exercise.sets, reps: exercise.reps };
  }
  if (exercise.type === 'cardio') {
    // Cardio stays a single bout but its duration ramps up over the weeks.
    return { sets: exercise.sets, reps: exercise.reps + prog.addReps };
  }
  return {
    sets: exercise.sets + prog.addSets,
    reps: exercise.reps + prog.addReps,
  };
}
