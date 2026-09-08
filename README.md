# 🎯 Field Ops Fitness

A mobile-first, installable web app for running the **Functional Fit Father**
13-week protocol: a block progression built to hit the GBRS Group performance
standards. Log every set, track the seven tests, and watch the radar move.
Tactical command-HUD look — near-black gunmetal UI, monochrome steel-grey
hairlines and accents, tactical red for records/alerts, a reticle app icon, and
a monospace readout feel.

Built as a **zero-dependency PWA** — plain HTML/CSS/JS, no build step, no backend.
All data is stored **on the device** (browser `localStorage`), so it works fully
offline once installed.

## Features

- **Dashboard** — program progress ring, training streak, total volume lifted,
  weekly session bars, and a per-exercise progress chart.
- **Workout logging** — every session shows the day, exercises, target sets/reps,
  coaching notes, and inputs for the **weight** and **reps completed** per set.
  Tick sets off, add/remove sets, leave a note, and a built-in rest timer.
- **Hydration counter** — a daily water tracker on the Base page: tap glasses
  (or +/−) toward a goal (default 8 ≈ 2 L), resets each day, with a goal you can
  set in Command.
- **Body weight tracker** — log weigh-ins (one per day), see the latest weight,
  the change since you started, and a trend chart on the dashboard.
- **Progression badges** 🎖️ — 18 achievements earned live from real progress
  (sessions, streaks, PBs, hydration, body-weight logs, and benchmark tiers).
  Earned/locked grid on the Base and Standards screens, with an unlock toast.
- **Performance Standards radar** 🎯 — a spider chart across the 7 tests
  (Bench, Trap Bar Deadlift, 800 m Run, Broad Jump, Farmer's Carry, Pull-ups,
  Plank) plotted against **The Standard / Elite / Be-a-Pro** tiers. Enter your
  Week 1 numbers and your Week 13 numbers, and watch the shape grow.
- **Verse of the Day** — a motivational Bible verse (NKJV) on the Base page,
  below the water tracker, themed around strength, courage, and perseverance.
  Updates daily, rotating through the set and consistent all day.
- **Personal best badges** 🏆 — the app tracks your best lift for each exercise.
  Beat it during a workout and a "PB!" tag lights up live; finish the session and
  you get a celebration. Recent PBs are flagged **NEW** on the dashboard.
- **The 13-week protocol** — 50 sessions across five phases:
  - **Week 1 · Baseline** — 3 test days. Test, record, rest. No training.
  - **Block 1 · Base (weeks 2–5)** — build the tissue, learn the movements.
  - **Block 2 · Build (weeks 6–9)** — add load, move the numbers.
  - **Block 3 · Peak (weeks 10–12)** — specificity, train the test.
  - **Week 13 · Retest** — the same three test days. The two columns are the proof.

  Training weeks run 4 sessions: **Mon** lower + jump, **Tue** upper + carry,
  **Thu** run + grinder, **Sat** full body + ruck. Wed/Fri/Sun are recovery.
  Targets are written per block, so what you see is what the protocol says —
  load progression ("add 2.5 kg per week") lives in each exercise's note.
  The Briefing tab shows every block, every session, and the standing rules.
- **Parent mode (PIN protected)** — fully customise the protocol: rename
  sessions, add/remove/edit exercises, change sets/reps/rest and coaching notes.
  Also set the athlete's name, weight unit (kg/lb), and start date. Forgot the
  PIN? A **"Forgot PIN?"** reset on the lock screen clears it without touching
  any data.
- **Backup** — export/import all data as a JSON file (do this before clearing
  browser data or switching phones — data lives on the device only).

## Run it

It's static files — serve the folder over HTTPS (a service worker requires
HTTPS, except on `localhost`).

**Locally:**
```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

**Host it free on GitHub Pages (test on your phone before merging):**

1. On GitHub, open the repo → **Settings** → **Pages** (left sidebar).
2. Under **Build and deployment → Source**, choose **Deploy from a branch**.
3. Set **Branch** to `claude/gym-fitness-tracker-app-0W6ZJ` and folder to
   **`/ (root)`**, then **Save**.
4. Wait ~1 minute. Your live URL appears at the top of the Pages screen —
   it will be **`https://destachio.github.io/Fitness/`**.

Open that URL on your phone and **Add to Home Screen**. All paths are relative,
so it works under the `/Fitness/` sub-path. Every time you push to the branch,
Pages redeploys automatically.

## Install on his phone

1. Open the hosted URL in the phone's browser (Safari on iOS, Chrome on Android).
2. **Add to Home Screen** — it installs like an app, runs full-screen, and works
   offline.

## Parent mode / PIN

The first time you open **Parent**, you can optionally set a 4–8 digit PIN.
After that, the edit screens are locked behind it so he can't change the plan by
accident. The PIN unlocks for the current app session only. Forgot it? Clear the
app's site data to reset (this also clears history, so export a backup first).

## Project layout

```
index.html              app shell
manifest.webmanifest    PWA manifest
sw.js                   service worker (offline cache)
css/styles.css          theme + layout
js/
  data.js               default 4-week plan + progression rules
  store.js              localStorage persistence, stats, PIN
  charts.js             tiny SVG charts (ring / line / bar)
  ui.js                 DOM helpers, icons, toast
  views.js              screens (dashboard, workout, plan, parent)
  app.js                router + bottom nav + init
icons/                  app icons (+ make_icons.py to regenerate)
```

> Note: the Functional Fit Father protocol is written for an adult and is
> general guidance, not medical advice. It is demanding — heavy trap bar
> deadlifts, weighted rucks, bodyweight bench and timed grinders. If a younger
> athlete is running it, scale the loads down hard, prioritise form over the
> numbers, and check with a coach or doctor first. Form failure is a stop
> signal, not a challenge.
