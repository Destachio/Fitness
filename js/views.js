// views.js — screen render functions. Each returns a DOM node.
import * as S from './store.js';
import { progressRing, lineChart, barChart, radarChart } from './charts.js';
import { el, clear, icon, toast, fmtDate } from './ui.js';
import { PROGRESSION, PROGRAM_WEEKS, targetFor } from './data.js';
import { verseForDate } from './verses.js';
import { allBadges, earnedBadges, earnedBadgeIdSet, badgeCounts } from './badges.js';
import { METRICS, TIER_LABELS, scoreOf, tierName, parseValue, fmtValue } from './standards.js';

const go = (hash) => { location.hash = hash; };

function header(title, sub) {
  return el('header.screen-head', {}, [
    el('h1', { text: title }),
    sub ? el('p.sub', { text: sub }) : null,
  ]);
}

function statCard(value, label, accent = false) {
  return el(`div.stat${accent ? '.accent' : ''}`, {}, [
    el('div.stat-val', { text: String(value) }),
    el('div.stat-lbl', { text: label }),
  ]);
}

// ---------------- DASHBOARD ----------------
export function dashboard() {
  const wrap = el('div.screen');
  const s = S.getSettings();
  const logs = S.getLogs().filter((l) => l.completed);
  const done = S.completedCount();
  const total = S.TOTAL_SESSIONS;

  wrap.appendChild(header(`Operative // ${s.athleteName}`, done >= total ? 'Mission accomplished — outstanding work.' : 'Gear up. Let’s execute today’s mission.'));

  // Progress ring + quick stats
  const top = el('div.dash-top');
  top.appendChild(el('div.ring-card', {}, [
    progressRing(done, total, { label: `${done}/${total}`, sub: 'ops' }),
    el('div.ring-cap', { text: 'Mission progress' }),
  ]));

  const thisWeek = (() => {
    const wk = currentWeek();
    return logs.filter((l) => l.week === wk).length;
  })();
  const stats = el('div.stat-grid', {}, [
    statCard(S.trainingStreak(), 'streak', true),
    statCard(`${thisWeek}/${S.SESSIONS_PER_WEEK}`, 'this week'),
    statCard(totalVolume(logs).toLocaleString(), `${s.weightUnit} lifted`),
    statCard(`W${currentWeek()}`, 'of ' + PROGRAM_WEEKS),
  ]);
  top.appendChild(stats);
  wrap.appendChild(top);

  // Primary CTA
  const next = S.nextScheduled();
  if (next) {
    wrap.appendChild(el('button.cta', { onclick: () => startSession(next.dayId, next.week) }, [
      icon('dumbbell'),
      el('span', {}, [
        el('strong', { text: `Deploy · ${next.dayName.split('·')[0].trim()}` }),
        el('em', { text: `Week ${next.week} · ${next.dayName.split('·')[1]?.trim() || ''}` }),
      ]),
    ]));
  } else {
    wrap.appendChild(el('div.card.done-card', {}, [
      icon('trophy'),
      el('div', {}, [
        el('strong', { text: 'Mission complete — 4 weeks down!' }),
        el('p.sub', { text: 'Redeploy from the Briefing tab, or build a custom op in Command.' }),
      ]),
    ]));
  }

  // Progression badges
  wrap.appendChild(badgesCard());

  // Daily hydration counter
  wrap.appendChild(hydrationCard());

  // Verse of the day (updates daily)
  wrap.appendChild(verseCard());

  // Body weight tracker
  wrap.appendChild(bodyweightCard());

  // Volume over time
  wrap.appendChild(sectionCard('Total volume per session', lineChart(
    logs.map((l) => ({ date: l.date, value: S.sessionVolume(l) })),
    { unit: ` ${s.weightUnit}` }
  )));

  // Weekly sessions bar
  const weekBars = [];
  for (let w = 1; w <= PROGRAM_WEEKS; w++) {
    weekBars.push({ label: 'W' + w, value: logs.filter((l) => l.week === w).length });
  }
  wrap.appendChild(sectionCard('Sessions completed each week', barChart(weekBars)));

  // Personal best badges
  wrap.appendChild(personalBestsCard());

  // Per-exercise progress picker
  wrap.appendChild(exerciseProgressCard());

  // Recent sessions
  wrap.appendChild(recentSessions(logs.slice().reverse().slice(0, 6)));

  return wrap;
}

function sectionCard(title, child) {
  return el('div.card', {}, [el('h3.card-title', { text: title }), child]);
}

function exerciseProgressCard() {
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Exercise progress' }));
  const exes = S.planExercises();
  const select = el('select.select');
  exes.forEach((e) => select.appendChild(el('option', { value: e.id, text: e.name })));
  const body = el('div');
  const draw = () => {
    const ex = exes.find((x) => x.id === select.value) || exes[0];
    const pts = S.exerciseHistory(select.value).map((p) => ({ date: p.date, value: p.value }));
    clear(body);
    const cunit = ex && ex.type === 'time' ? 's' : ex && ex.type === 'cardio' ? ' min' : ` ${S.getSettings().weightUnit}`;
    body.appendChild(lineChart(pts, { unit: cunit }));
    const chint = ex && ex.type === 'time' ? 'Best hold time per session.' : ex && ex.type === 'cardio' ? 'Minutes of cardio per session.' : 'Heaviest working set per session.';
    body.appendChild(el('p.hint', { text: chint }));
  };
  select.addEventListener('change', draw);
  card.appendChild(select);
  card.appendChild(body);
  if (exes.length) draw();
  return card;
}

function badgesCard() {
  const badges = allBadges();
  const counts = badgeCounts();
  const card = el('div.card');
  card.appendChild(el('div.badges-head', {}, [
    el('h3.card-title', { text: 'Badges' }),
    el('span.badges-count', { text: `${counts.earned}/${counts.total}` }),
  ]));
  const grid = el('div.badge-grid');
  badges.forEach((b) => {
    grid.appendChild(el(`div.badge${b.earned ? '.earned' : ''}`, { title: `${b.name} — ${b.desc}` }, [
      el('span.badge-ic', { text: b.icon }),
      el('span.badge-name', { text: b.name }),
      el('span.badge-desc', { text: b.desc }),
    ]));
  });
  card.appendChild(grid);
  return card;
}

function hydrationCard() {
  const goal = S.getWaterGoal();
  const card = el('div.card.water-card');
  card.appendChild(el('h3.card-title', { text: 'Hydration' }));
  const head = el('div.water-head');
  const glasses = el('div.water-glasses');
  const controls = el('div.water-controls');
  card.append(head, glasses, controls);

  const fmtL = (n) => (n * 0.25).toFixed(2).replace(/\.?0+$/, '');

  function draw() {
    const count = S.getWaterCount();
    const hit = count >= goal;
    clear(head);
    head.appendChild(el('div.water-readout', {}, [
      el('span.water-count', { text: `${count}/${goal}` }),
      el('span.water-sub', { text: `glasses · ${fmtL(count)} of ${fmtL(goal)} L` }),
    ]));
    if (hit) head.appendChild(el('span.water-done', {}, [icon('check', { size: 14 }), el('span', { text: 'Goal hit' })]));

    clear(glasses);
    for (let i = 0; i < goal; i++) {
      const filled = i < count;
      glasses.appendChild(el(`button.glass${filled ? '.filled' : ''}`, {
        'aria-label': `glass ${i + 1}`,
        // tapping the topmost filled glass empties it; otherwise fill up to here
        onclick: () => { S.setWaterCount(filled && i === count - 1 ? i : i + 1); draw(); },
      }, icon('droplet', { size: 18 })));
    }

    clear(controls);
    controls.append(
      el('button.water-btn', { 'aria-label': 'remove a glass', onclick: () => { S.addWater(-1); draw(); } }, '−'),
      el('button.water-btn.add', {
        onclick: () => {
          const before = S.getWaterCount();
          S.addWater(1);
          draw();
          if (before < goal && S.getWaterCount() >= goal) toast('Hydration goal hit! 💧');
        },
      }, [icon('droplet', { size: 16 }), el('span', { text: 'Add glass' })]),
    );
  }
  draw();
  return card;
}

function bodyweightCard() {
  const unit = S.getSettings().weightUnit;
  const entries = S.getBodyweights();
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Body weight' }));

  if (entries.length) {
    const latest = entries[entries.length - 1];
    const first = entries[0];
    const diff = Math.round((latest.weight - first.weight) * 10) / 10;
    const arrow = diff > 0 ? '▲' : diff < 0 ? '▼' : '·';
    card.appendChild(el('div.bw-now', {}, [
      el('span.bw-val', { text: `${latest.weight} ${unit}` }),
      entries.length > 1 ? el('span.bw-diff', { text: `${arrow} ${Math.abs(diff)} ${unit} since start`, class: `bw-diff ${diff > 0 ? 'up' : diff < 0 ? 'down' : ''}` }) : el('span.bw-diff', { text: 'first entry' }),
    ]));
    card.appendChild(lineChart(entries.map((e) => ({ date: e.date, value: e.weight })), { unit: ` ${unit}`, height: 130 }));
  } else {
    card.appendChild(el('p.hint', { text: 'Log body weight to track changes over the program. Weigh in once a week at the same time of day.' }));
  }

  // inline add
  const dateInput = el('input.input.bw-date', { type: 'date', value: new Date().toISOString().slice(0, 10) });
  const wInput = el('input.input.bw-input', { type: 'number', inputmode: 'decimal', placeholder: `Weight (${unit})` });
  const addBtn = el('button.btn.primary.bw-add', {
    onclick: () => {
      if (!wInput.value) { toast('Enter a weight', 'err'); return; }
      S.addBodyweight(wInput.value, dateInput.value);
      toast('Body weight logged');
      rerender();
    },
  }, 'Log');
  card.appendChild(el('div.bw-form', {}, [wInput, dateInput, addBtn]));
  return card;
}

function personalBestsCard() {
  const unit = S.getSettings().weightUnit;
  const pbs = S.personalBests();
  const latestDate = S.latestSessionDate();
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Personal bests 🏆' }));
  if (!pbs.length) {
    card.appendChild(el('p.hint', { text: 'Finish workouts to earn PB badges — your best lift for each exercise shows up here.' }));
    return card;
  }
  const grid = el('div.pb-grid');
  pbs.sort((a, b) => (b.best.date || '').localeCompare(a.best.date || ''));
  pbs.forEach((p) => {
    const isNew = p.best.date && p.best.date.slice(0, 10) === latestDate;
    const value = p.type === 'time' ? `${p.best.value}s` : `${p.best.value} ${unit}`;
    const detail = p.type === 'time' ? 'best hold' : `× ${p.best.reps} reps`;
    grid.appendChild(el(`div.pb-badge${isNew ? '.new' : ''}`, {}, [
      isNew ? el('span.pb-new', { text: 'NEW' }) : null,
      icon('trophy', { size: 18 }),
      el('div.pb-body', {}, [
        el('span.pb-name', { text: p.name }),
        el('span.pb-val', { text: value }),
        el('span.pb-detail', { text: detail }),
      ]),
    ]));
  });
  card.appendChild(grid);
  return card;
}

function recentSessions(items) {
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Recent sessions' }));
  if (!items.length) {
    card.appendChild(el('p.hint', { text: 'No sessions logged yet. Your history will show here.' }));
    return card;
  }
  const list = el('ul.session-list');
  items.forEach((l) => {
    list.appendChild(el('li', { onclick: () => go('#/session/' + l.id) }, [
      el('div', {}, [
        el('strong', { text: l.dayName }),
        el('span.muted', { text: `${fmtDate(l.date)} · Week ${l.week}` }),
      ]),
      el('span.vol', { text: `${S.sessionVolume(l).toLocaleString()} ${S.getSettings().weightUnit}` }),
    ]));
  });
  card.appendChild(list);
  return card;
}

// Verse of the day — shown on the Base page, updates daily.
function verseCard(dateIso) {
  const v = verseForDate(dateIso ? new Date(dateIso) : new Date());
  return el('div.card.verse-card', {}, [
    el('div.verse-head', {}, [icon('book', { size: 16 }), el('span', { text: 'Verse of the Day' })]),
    el('p.verse-text', { text: `“${v.text}”` }),
    el('p.verse-ref', { text: `${v.ref} · NKJV` }),
  ]);
}

function totalVolume(logs) {
  return logs.reduce((sum, l) => sum + S.sessionVolume(l), 0);
}
function currentWeek() {
  const done = S.completedCount();
  return Math.min(PROGRAM_WEEKS, Math.floor(done / S.SESSIONS_PER_WEEK) + 1);
}

// ---------------- TODAY ----------------
export function today() {
  const wrap = el('div.screen');
  wrap.appendChild(header('Today’s mission', 'Select an op and start logging.'));
  const next = S.nextScheduled();
  const plan = S.getPlan();
  const wk = currentWeek();

  if (next) {
    wrap.appendChild(el('p.hint', { text: `Up next: Week ${next.week} · ${next.dayName}` }));
  }

  plan.days.forEach((day) => {
    const isNext = next && next.dayId === day.id && next.week === wk;
    const card = el(`div.day-card${isNext ? '.next' : ''}`);
    card.appendChild(el('div.day-card-head', {}, [
      el('h3', { text: day.name }),
      isNext ? el('span.badge', { text: 'Up next' }) : null,
    ]));
    const ul = el('ul.ex-preview');
    day.exercises.forEach((ex) => {
      const t = targetLabel(ex, wk);
      ul.appendChild(el('li', {}, [
        el('span', { text: ex.name }),
        el('span.muted', { text: t }),
      ]));
    });
    card.appendChild(ul);
    card.appendChild(el('button.btn.primary', { onclick: () => startSession(day.id, wk) }, [
      icon('dumbbell', { size: 18 }), el('span', { text: `Deploy · Week ${wk}` }),
    ]));
    wrap.appendChild(card);
  });
  return wrap;
}

function targetLabel(ex, week) {
  const { sets, reps } = targetFor(ex, week);
  if (ex.type === 'cardio') return `${reps} min`;
  return ex.type === 'time' ? `${sets} × ${reps}s` : `${sets} × ${reps}`;
}

function startSession(dayId, week) {
  const sess = S.newSession(dayId, week);
  S.saveLog(sess);
  go('#/session/' + sess.id);
}

// ---------------- SESSION (logging) ----------------
export function session(id) {
  const log = S.getLog(id);
  const wrap = el('div.screen');
  if (!log) {
    wrap.appendChild(header('Session not found'));
    wrap.appendChild(el('button.btn', { onclick: () => go('#/today') }, 'Back to Today'));
    return wrap;
  }
  const unit = S.getSettings().weightUnit;
  const prog = PROGRESSION.find((p) => p.week === log.week);

  wrap.appendChild(el('div.session-head', {}, [
    el('button.icon-btn', { onclick: () => go('#/'), 'aria-label': 'Back' }, icon('back')),
    el('div', {}, [
      el('h1', { text: log.dayName }),
      el('p.sub', { text: `Week ${log.week} of ${PROGRAM_WEEKS} · ${fmtDate(log.date)}` }),
    ]),
  ]));
  if (prog) wrap.appendChild(el('div.cue', {}, [icon('flame', { size: 16 }), el('span', { text: prog.cue })]));

  const save = () => S.saveLog(log);

  log.entries.forEach((entry, ei) => {
    const card = el('div.ex-card');
    const pbTag = el('span.pb-tag', { text: '🏆 PB!' });
    pbTag.style.display = 'none';
    card.appendChild(el('div.ex-card-head', {}, [
      el('div', {}, [
        el('div.ex-title', {}, [el('h3', { text: entry.name }), pbTag]),
        el('p.target', { text: entry.type === 'cardio' ? `Target: ${entry.targetReps} min` : `Target: ${entry.targetSets} × ${entry.targetReps}${entry.type === 'time' ? 's' : ''}` }),
      ]),
      entry.rest ? el('button.rest-btn', { onclick: (e) => startRest(entry.rest, e.currentTarget) }, `Rest ${entry.rest}s`) : null,
    ]));
    if (entry.note) card.appendChild(el('p.ex-note', { text: entry.note }));

    // Live PB badge: lights up when a completed set beats the prior best.
    const priorBest = S.exerciseBest(entry.exerciseId, { excludeLogId: log.id });
    const updatePb = () => {
      if (entry.type === 'cardio') { pbTag.style.display = 'none'; return; } // cardio isn't a PB lift
      let v = 0;
      for (const s of entry.sets) {
        if (!s.done) continue;
        const val = entry.type === 'time' ? (parseInt(s.reps, 10) || 0) : (parseFloat(s.weight) || 0);
        if (val > v) v = val;
      }
      pbTag.style.display = v > 0 && (!priorBest || v > priorBest.value) ? '' : 'none';
    };

    // set rows
    const colWeight = entry.type === 'time' ? `${unit} (opt)` : entry.type === 'cardio' ? 'lvl/km' : unit;
    const colReps = entry.type === 'time' ? 'seconds' : entry.type === 'cardio' ? 'minutes' : 'reps';
    const table = el('div.set-table');
    table.appendChild(el('div.set-row.set-row-head', {}, [
      el('span', { text: 'Set' }),
      el('span', { text: colWeight }),
      el('span', { text: colReps }),
      el('span', { text: '✓' }),
    ]));
    const renderRows = () => {
      [...table.querySelectorAll('.set-data')].forEach((n) => n.remove());
      entry.sets.forEach((set, si) => {
        const row = el(`div.set-row.set-data${set.done ? '.done' : ''}`);
        row.appendChild(el('span.set-num', { text: String(si + 1) }));
        const wInput = el('input.num', {
          type: 'number', inputmode: 'decimal', placeholder: '–', value: set.weight,
          onchange: (e) => { set.weight = e.target.value; save(); updatePb(); },
        });
        const rInput = el('input.num', {
          type: 'number', inputmode: 'numeric', placeholder: String(entry.targetReps), value: set.reps,
          onchange: (e) => { set.reps = e.target.value; save(); updatePb(); },
        });
        const chk = el(`button.set-check${set.done ? '.on' : ''}`, {
          'aria-label': 'mark set done',
          onclick: () => {
            set.done = !set.done;
            if (set.done && set.reps === '') set.reps = String(entry.targetReps);
            save();
            row.classList.toggle('done', set.done);
            chk.classList.toggle('on', set.done);
            chk.innerHTML = '';
            if (set.done) chk.appendChild(icon('check', { size: 16 }));
            updateProgressBar();
            updatePb();
          },
        }, set.done ? icon('check', { size: 16 }) : null);
        row.appendChild(wInput);
        row.appendChild(rInput);
        row.appendChild(chk);
        table.appendChild(row);
      });
    };
    renderRows();
    updatePb();
    card.appendChild(table);

    // add / remove set
    card.appendChild(el('div.set-actions', {}, [
      el('button.mini', { onclick: () => { entry.sets.push({ weight: entry.sets.at(-1)?.weight || '', reps: '', done: false }); save(); renderRows(); } }, '+ Add set'),
      entry.sets.length > 1 ? el('button.mini.ghost', { onclick: () => { entry.sets.pop(); save(); renderRows(); updateProgressBar(); updatePb(); } }, '– Remove') : null,
    ]));
    wrap.appendChild(card);
  });

  // session notes
  wrap.appendChild(el('div.card', {}, [
    el('h3.card-title', { text: 'Notes (how did it feel?)' }),
    el('textarea.notes', { placeholder: 'e.g. squats felt strong, increase weight next time', onchange: (e) => { log.notes = e.target.value; save(); } }, log.notes || ''),
  ]));

  // progress + finish
  const bar = el('div.finish-bar');
  const fill = el('div.finish-fill');
  const label = el('span.finish-label');
  bar.appendChild(el('div.finish-track', {}, fill));
  bar.appendChild(label);
  function updateProgressBar() {
    const totalSets = log.entries.reduce((n, e) => n + e.sets.length, 0);
    const doneSets = log.entries.reduce((n, e) => n + e.sets.filter((s) => s.done).length, 0);
    const pct = totalSets ? Math.round((doneSets / totalSets) * 100) : 0;
    fill.style.width = pct + '%';
    label.textContent = `${doneSets}/${totalSets} sets done`;
  }
  updateProgressBar();
  wrap.appendChild(bar);

  wrap.appendChild(el('button.cta.finish', {
    onclick: () => {
      const badgesBefore = earnedBadgeIdSet();
      log.completed = true;
      log.date = log.date || new Date().toISOString();
      S.saveLog(log);
      const pbs = S.detectNewPBs(log);
      if (pbs.length) {
        const unit = S.getSettings().weightUnit;
        const top = pbs[0];
        const val = top.type === 'time' ? `${top.value}s` : `${top.value} ${unit}`;
        toast(pbs.length === 1 ? `New PB! ${top.name} ${val} 🏆` : `${pbs.length} new PBs! 🏆`);
        if (navigator.vibrate) navigator.vibrate([120, 60, 120]);
      } else {
        toast('Mission complete! 💪');
      }
      // Celebrate any newly-earned progression badge.
      const gained = earnedBadges().filter((b) => !badgesBefore.has(b.id));
      if (gained.length) {
        setTimeout(() => { toast(`Badge unlocked: ${gained[0].name} 🎖️`); if (navigator.vibrate) navigator.vibrate([80, 40, 80]); }, 1100);
      }
      go('#/');
    },
  }, [icon('check'), el('span', { text: log.completed ? 'Update & save' : 'Complete mission' })]));

  if (log.completed) {
    wrap.appendChild(el('button.btn.danger-ghost', {
      onclick: () => { if (confirm('Delete this session from your history?')) { S.deleteLog(log.id); toast('Deleted'); go('#/'); } },
    }, [icon('trash', { size: 16 }), el('span', { text: 'Delete session' })]));
  }

  return wrap;
}

let restTimer;
function startRest(sec, btn) {
  clearInterval(restTimer);
  let left = sec;
  btn.classList.add('running');
  const tick = () => {
    btn.textContent = `Rest ${left}s`;
    if (left <= 0) {
      clearInterval(restTimer);
      btn.classList.remove('running');
      btn.textContent = `Rest ${sec}s`;
      toast('Rest done — next set! ⏱️');
      if (navigator.vibrate) navigator.vibrate(200);
      return;
    }
    left--;
  };
  tick();
  restTimer = setInterval(tick, 1000);
}

// ---------------- PLAN (overview) ----------------
export function plan() {
  const wrap = el('div.screen');
  const p = S.getPlan();
  wrap.appendChild(header(p.name, '3 days/week · 4-week progressive plan'));

  // progression legend
  const leg = el('div.card', {}, [el('h3.card-title', { text: 'How the 4 weeks ramp up' })]);
  PROGRESSION.forEach((pr) => {
    leg.appendChild(el('div.week-row', {}, [
      el('span.week-tag', { text: 'Week ' + pr.week }),
      el('span', { text: pr.cue }),
    ]));
  });
  wrap.appendChild(leg);

  p.days.forEach((day) => {
    const card = el('div.card');
    card.appendChild(el('h3.card-title', { text: day.name }));
    const ul = el('ul.plan-ex');
    day.exercises.forEach((ex) => {
      ul.appendChild(el('li', {}, [
        el('div', {}, [
          el('strong', { text: ex.name }),
          el('span.muted', { text: ex.note }),
        ]),
        el('span.reps', { text: ex.type === 'cardio' ? `${ex.reps} min` : ex.type === 'time' ? `${ex.sets}×${ex.reps}s` : `${ex.sets}×${ex.reps}` }),
      ]));
    });
    card.appendChild(ul);
    wrap.appendChild(card);
  });

  wrap.appendChild(el('button.btn', { onclick: () => go('#/parent') }, [icon('gear', { size: 18 }), el('span', { text: 'Edit plan (parent)' })]));
  return wrap;
}

// ---------------- STANDARDS (radar) ----------------
export function standards() {
  const wrap = el('div.screen');
  wrap.appendChild(header('Performance Standards', 'Test yourself, then chart your progress vs the tiers.'));

  const std = S.getStandards();
  const axes = METRICS.map((m) => ({ short: m.short, score: std[m.key] != null ? scoreOf(std[m.key], m.B) : 0 }));

  // Radar
  const radarBox = el('div.card.radar-card');
  radarBox.appendChild(radarChart(axes, { tierLabels: TIER_LABELS }));
  // legend
  radarBox.appendChild(el('div.radar-legend', {}, TIER_LABELS.map((t, i) =>
    el('span.legend-item', {}, [el(`span.legend-ring r${i + 1}`), el('span', { text: t })]))));
  wrap.appendChild(radarBox);

  // Benchmark inputs
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Your results' }));
  card.appendChild(el('p.hint', { text: 'Enter your best for each test. Standard / Elite / Be-a-Pro targets are shown; the radar updates instantly.' }));

  METRICS.forEach((m) => {
    const raw = std[m.key];
    const score = raw != null ? scoreOf(raw, m.B) : 0;
    const row = el('div.bench-row');
    row.appendChild(el('div.bench-top', {}, [
      el('div.bench-name', {}, [el('strong', { text: m.label }), el('span.muted', { text: m.hint })]),
      el(`span.bench-tier t${Math.min(3, Math.floor(score))}`, { text: raw != null ? tierName(score) : '—' }),
    ]));
    const input = el('input.input.bench-input', {
      type: m.kind === 'time' ? 'text' : 'number',
      inputmode: m.kind === 'time' ? 'text' : 'decimal',
      placeholder: m.kind === 'time' ? 'mm:ss' : m.unit,
      value: raw != null ? fmtValue(m.kind, raw) : '',
      onchange: (e) => {
        const v = parseValue(m.kind, e.target.value);
        S.setStandard(m.key, v);
        rerender();
      },
    });
    row.appendChild(el('div.bench-entry', {}, [
      input,
      el('div.bench-targets', {}, [
        el('span.bench-unit', { text: m.unit }),
        el('span.bench-goals', { text: `${m.tiers[0]} · ${m.tiers[1]} · ${m.tiers[2]}` }),
      ]),
    ]));
    card.appendChild(row);
  });
  wrap.appendChild(card);

  // Badges live here too (progression overview)
  wrap.appendChild(badgesCard());
  return wrap;
}

// ---------------- PARENT ----------------
export function parent() {
  const wrap = el('div.screen');
  wrap.appendChild(header('Parent mode', 'Customise workouts & settings.'));

  if (!S.isParentUnlocked()) {
    return pinGate(wrap);
  }
  if (!S.hasPin()) {
    wrap.appendChild(pinSetupCard());
  }

  // Settings
  const s = S.getSettings();
  const set = el('div.card');
  set.appendChild(el('h3.card-title', { text: 'Settings' }));
  set.appendChild(field('Athlete name', el('input.input', { value: s.athleteName, onchange: (e) => S.saveSettings({ athleteName: e.target.value || 'Athlete' }) })));
  const unitSel = el('select.select', { onchange: (e) => S.saveSettings({ weightUnit: e.target.value }) });
  ['kg', 'lb'].forEach((u) => unitSel.appendChild(el('option', { value: u, text: u, selected: s.weightUnit === u ? 'selected' : null })));
  set.appendChild(field('Weight unit', unitSel));
  set.appendChild(field('Daily water goal (glasses ~250 ml)', el('input.input', { type: 'number', inputmode: 'numeric', min: '1', max: '20', value: s.waterGoal, onchange: (e) => S.saveSettings({ waterGoal: Math.max(1, Math.min(20, parseInt(e.target.value, 10) || 8)) }) })));
  set.appendChild(field('Program start date', el('input.input', { type: 'date', value: s.startDate || '', onchange: (e) => S.saveSettings({ startDate: e.target.value }) })));
  wrap.appendChild(set);

  // Training program selector
  wrap.appendChild(programCard());

  // Plan editor
  wrap.appendChild(planEditor());

  // PIN management
  if (S.hasPin()) {
    wrap.appendChild(el('div.card', {}, [
      el('h3.card-title', { text: 'Parent PIN' }),
      el('button.btn', { onclick: () => { const pin = prompt('Set a new 4-digit PIN'); if (pin && /^\d{4,8}$/.test(pin)) { S.setPin(pin); toast('PIN updated'); } else if (pin) toast('Use 4–8 digits', 'err'); } }, 'Change PIN'),
    ]));
  }

  // Data / backup
  const data = el('div.card');
  data.appendChild(el('h3.card-title', { text: 'Data & backup' }));
  data.appendChild(el('p.hint', { text: 'Workouts are stored on this device only. Export a backup before clearing browser data or switching phones.' }));
  data.appendChild(el('div.row-btns', {}, [
    el('button.btn', { onclick: exportBackup }, 'Export backup'),
    el('button.btn', { onclick: importBackup }, 'Import backup'),
  ]));
  data.appendChild(el('button.btn.danger-ghost', {
    onclick: () => { if (confirm('Reset the current program back to its default workouts? Your logged sessions are kept.')) { S.resetPlanToDefault(); toast('Program reset to default'); rerender(); } },
  }, 'Reset program to default'));
  data.appendChild(el('button.btn.danger-ghost', {
    onclick: () => { if (confirm('Erase ALL sessions and history? This cannot be undone.')) { S.getLogs().forEach((l) => S.deleteLog(l.id)); toast('History cleared'); } },
  }, 'Clear all session history'));
  wrap.appendChild(data);

  return wrap;
}

function pinGate(wrap) {
  const card = el('div.card.pin-card');
  card.appendChild(icon('lock', { size: 40 }));
  card.appendChild(el('h3', { text: 'Enter parent PIN' }));
  const input = el('input.input.pin-input', { type: 'password', inputmode: 'numeric', placeholder: '••••', maxlength: 8 });
  const submit = () => {
    if (S.checkPin(input.value)) { S.unlockParent(); toast('Unlocked'); rerender(); }
    else { toast('Wrong PIN', 'err'); input.value = ''; }
  };
  input.addEventListener('keydown', (e) => { if (e.key === 'Enter') submit(); });
  card.appendChild(input);
  card.appendChild(el('button.btn.primary', { onclick: submit }, 'Unlock'));
  wrap.appendChild(card);
  setTimeout(() => input.focus(), 50);
  return wrap;
}

function pinSetupCard() {
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Protect parent mode' }));
  card.appendChild(el('p.hint', { text: 'Set a PIN so your son can’t accidentally change the plan. (Optional.)' }));
  const input = el('input.input', { type: 'password', inputmode: 'numeric', placeholder: '4–8 digit PIN', maxlength: 8 });
  card.appendChild(input);
  card.appendChild(el('button.btn.primary', {
    onclick: () => { if (/^\d{4,8}$/.test(input.value)) { S.setPin(input.value); S.unlockParent(); toast('PIN set'); rerender(); } else toast('Use 4–8 digits', 'err'); },
  }, 'Set PIN'));
  return card;
}

function field(label, control) {
  return el('label.field', {}, [el('span.field-lbl', { text: label }), control]);
}

function programCard() {
  const active = S.activeProgramId();
  const card = el('div.card');
  card.appendChild(el('h3.card-title', { text: 'Training program' }));
  card.appendChild(el('p.hint', { text: 'Pick the program. Switching replaces the workout days with that program’s template — your logged history is kept, but any custom edits to the current plan are reset.' }));
  S.PROGRAM_LIST.forEach((p) => {
    const isActive = p.id === active;
    card.appendChild(el(`div.program-row${isActive ? '.active' : ''}`, {}, [
      el('div.program-info', {}, [
        el('strong', { text: p.name }),
        el('span.muted', { text: p.desc }),
      ]),
      isActive
        ? el('span.badge', { text: 'Active' })
        : el('button.btn.mini-load', {
            onclick: () => {
              if (!confirm(`Switch to "${p.name}"? This replaces the current workout days (logged sessions are kept).`)) return;
              S.loadProgram(p.id);
              toast(`${p.name} loaded`);
              rerender();
            },
          }, 'Load'),
    ]));
  });
  return card;
}

function planEditor() {
  const card = el('div.card.editor');
  card.appendChild(el('h3.card-title', { text: 'Workout editor' }));
  card.appendChild(el('p.hint', { text: 'Edit exercises, sets & reps. The 4-week ramp applies automatically on top of these base numbers.' }));
  const p = S.getPlan();

  const planNameInput = el('input.input', { value: p.name, onchange: (e) => { p.name = e.target.value; S.savePlan(p); } });
  card.appendChild(field('Plan name', planNameInput));

  p.days.forEach((day) => {
    const box = el('div.editor-day');
    box.appendChild(el('input.input.day-name', { value: day.name, onchange: (e) => { day.name = e.target.value; S.savePlan(p); } }));

    day.exercises.forEach((ex) => {
      const row = el('div.editor-ex');
      row.appendChild(el('input.input', { value: ex.name, placeholder: 'Exercise name', onchange: (e) => { ex.name = e.target.value; S.savePlan(p); } }));
      const nums = el('div.editor-nums');
      nums.appendChild(numField('Sets', ex.sets, (v) => { ex.sets = clampInt(v, 1, 10); S.savePlan(p); }));
      const repLabel = ex.type === 'time' ? 'Secs' : ex.type === 'cardio' ? 'Mins' : 'Reps';
      nums.appendChild(numField(repLabel, ex.reps, (v) => { ex.reps = clampInt(v, 1, 600); S.savePlan(p); }));
      nums.appendChild(numField('Rest', ex.rest, (v) => { ex.rest = clampInt(v, 0, 600); S.savePlan(p); }));
      const typeSel = el('select.select.mini-sel', { onchange: (e) => { ex.type = e.target.value; S.savePlan(p); rerender(); } });
      const typeLabels = { reps: 'Reps', time: 'Time', cardio: 'Cardio' };
      ['reps', 'time', 'cardio'].forEach((t) => typeSel.appendChild(el('option', { value: t, text: typeLabels[t], selected: ex.type === t ? 'selected' : null })));
      nums.appendChild(el('label.num-field', {}, [el('span', { text: 'Type' }), typeSel]));
      row.appendChild(nums);
      row.appendChild(el('input.input.note-input', { value: ex.note || '', placeholder: 'Coaching note (optional)', onchange: (e) => { ex.note = e.target.value; S.savePlan(p); } }));
      row.appendChild(el('button.icon-btn.del', { onclick: () => { day.exercises = day.exercises.filter((x) => x !== ex); S.savePlan(p); rerender(); }, 'aria-label': 'delete exercise' }, icon('trash', { size: 16 })));
      box.appendChild(row);
    });

    box.appendChild(el('button.mini', {
      onclick: () => { day.exercises.push({ id: 'ex_' + Date.now().toString(36), name: 'New exercise', type: 'reps', sets: 3, reps: 10, rest: 90, note: '' }); S.savePlan(p); rerender(); },
    }, '+ Add exercise'));
    card.appendChild(box);
  });

  return card;
}

function numField(label, value, onchange) {
  return el('label.num-field', {}, [
    el('span', { text: label }),
    el('input.input.num-sm', { type: 'number', inputmode: 'numeric', value, onchange: (e) => onchange(e.target.value) }),
  ]);
}
function clampInt(v, lo, hi) { return Math.max(lo, Math.min(hi, parseInt(v, 10) || lo)); }

function exportBackup() {
  const blob = new Blob([S.exportData()], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = el('a', { href: url, download: `fitness-backup-${new Date().toISOString().slice(0, 10)}.json` });
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
  toast('Backup downloaded');
}
function importBackup() {
  const inp = el('input', { type: 'file', accept: 'application/json' });
  inp.addEventListener('change', () => {
    const file = inp.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { try { S.importData(reader.result); toast('Backup restored'); rerender(); } catch { toast('Invalid backup file', 'err'); } };
    reader.readAsText(file);
  });
  inp.click();
}

// app.js sets this so views can trigger a re-render after data changes.
let _rerender = () => {};
export function setRerender(fn) { _rerender = fn; }
function rerender() { _rerender(); }
