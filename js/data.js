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
