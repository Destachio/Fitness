# 💪 Gym Tracker

A mobile-first, installable web app to help a young athlete get fit in the gym:
follow a 4-week plan, log every set, and watch progress on a dashboard.
Dark theme with neon-blue accents.

Built as a **zero-dependency PWA** — plain HTML/CSS/JS, no build step, no backend.
All data is stored **on the device** (browser `localStorage`), so it works fully
offline once installed.

## Features

- **Dashboard** — program progress ring, training streak, total volume lifted,
  weekly session bars, and a per-exercise progress chart.
- **Workout logging** — every session shows the day, exercises, target sets/reps,
  coaching notes, and inputs for the **weight** and **reps completed** per set.
  Tick sets off, add/remove sets, leave a note, and a built-in rest timer.
- **Body weight tracker** — log weigh-ins (one per day), see the latest weight,
  the change since you started, and a trend chart on the dashboard.
- **Personal best badges** 🏆 — the app tracks your best lift for each exercise.
  Beat it during a workout and a "PB!" tag lights up live; finish the session and
  you get a celebration. Recent PBs are flagged **NEW** on the dashboard.
- **4-week default plan** — full-body, 3 days/week (A/B/C), tuned for a teen
  beginner at a commercial gym. The 4 weeks ramp up automatically (reps then an
  extra set).
- **Parent mode (PIN protected)** — fully customise the plan: rename days, add/
  remove/edit exercises, change sets/reps/rest and coaching notes. Also set the
  athlete's name, weight unit (kg/lb), and start date.
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
   it will be **`https://destachio.github.io/fitness/`**.

Open that URL on your phone and **Add to Home Screen**. All paths are relative,
so it works under the `/fitness/` sub-path. Every time you push to the branch,
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

> Note: the default plan is general beginner guidance, not medical advice. For a
> 13-year-old, keep weights light, prioritise form, and check with a coach.
