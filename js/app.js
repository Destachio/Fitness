// app.js — router, bottom nav, init.
import * as views from './views.js';
import { el, icon } from './ui.js';
import { getPlan } from './store.js';

const ROUTES = [
  { hash: '#/', view: views.dashboard, nav: 'dashboard', label: 'Home', icon: 'dashboard' },
  { hash: '#/today', view: views.today, nav: 'today', label: 'Workout', icon: 'dumbbell' },
  { hash: '#/plan', view: views.plan, nav: 'plan', label: 'Plan', icon: 'calendar' },
  { hash: '#/parent', view: views.parent, nav: 'parent', label: 'Parent', icon: 'gear' },
];

const root = document.getElementById('app');
const navEl = document.getElementById('nav');

function parseHash() {
  const h = location.hash || '#/';
  if (h.startsWith('#/session/')) return { name: 'session', arg: h.slice('#/session/'.length) };
  const route = ROUTES.find((r) => r.hash === h);
  return { name: route ? route.nav : 'dashboard', arg: null };
}

function render() {
  const { name, arg } = parseHash();
  root.scrollTop = 0;
  window.scrollTo(0, 0);
  let node;
  if (name === 'session') node = views.session(arg);
  else {
    const route = ROUTES.find((r) => r.nav === name) || ROUTES[0];
    node = route.view();
  }
  root.replaceChildren(node);
  updateNav(name);
}

function buildNav() {
  ROUTES.forEach((r) => {
    navEl.appendChild(el('a.nav-item', { href: r.hash, 'data-nav': r.nav }, [
      icon(r.icon, { size: 24 }),
      el('span', { text: r.label }),
    ]));
  });
}

function updateNav(active) {
  const map = { session: 'today' };
  const cur = map[active] || active;
  [...navEl.children].forEach((a) => a.classList.toggle('active', a.dataset.nav === cur));
}

// Let views re-render in place (e.g. after editing the plan or unlocking).
views.setRerender(render);

window.addEventListener('hashchange', render);

function init() {
  getPlan(); // seed default plan on first run
  buildNav();
  if (!location.hash) location.hash = '#/';
  render();

  // Service worker for offline / installable PWA.
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./sw.js').catch(() => {});
    });
  }
}

init();
