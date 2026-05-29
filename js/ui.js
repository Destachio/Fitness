// ui.js — tiny DOM helpers + toast + icons.

// el('div.card', {onclick}, [children|string])
export function el(spec, props = {}, children = []) {
  const [tag, ...classes] = spec.split('.');
  const node = document.createElement(tag || 'div');
  if (classes.length) node.className = classes.join(' ');
  for (const k in props) {
    const v = props[k];
    if (k === 'class') node.className = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k === 'text') node.textContent = v;
    else if (k.startsWith('on') && typeof v === 'function') node.addEventListener(k.slice(2), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else if (v != null && v !== false) node.setAttribute(k, v);
  }
  const kids = Array.isArray(children) ? children : [children];
  for (const c of kids) {
    if (c == null || c === false) continue;
    node.appendChild(typeof c === 'string' || typeof c === 'number' ? document.createTextNode(String(c)) : c);
  }
  return node;
}

export function clear(node) { while (node.firstChild) node.removeChild(node.firstChild); return node; }

let toastTimer;
export function toast(msg, kind = 'ok') {
  let t = document.getElementById('toast');
  if (!t) {
    t = el('div', { id: 'toast', class: 'toast' });
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.className = `toast show ${kind}`;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = 'toast'; }, 2200);
}

// Minimal inline SVG icon set (stroke-based, currentColor).
const ICONS = {
  dashboard: '<path d="M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z"/>',
  dumbbell:  '<path d="M6.5 6.5 17.5 17.5M4 9l1-1m0 0L4 7M5 8 3 6m14 12 1-1m0 0 1 1m-1-1 2 2M8 5 5 8m11 11 3-3"/><path d="m7.5 7.5 9 9"/>',
  calendar:  '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M3 9h18M8 2v4M16 2v4"/>',
  gear:      '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2A1.6 1.6 0 0 0 6.6 19l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.6 1.6 0 0 0 3 13.6H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.6 7L4.5 7a2 2 0 1 1 2.8-2.8l.1.1A1.6 1.6 0 0 0 10 4.6V4a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8v.1a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1Z"/>',
  flame:     '<path d="M12 2s5 4 5 9a5 5 0 0 1-10 0c0-1.5.5-2.5 1-3.5C8.5 9 9 11 10 11c1.5 0 1-3 0-5 2 1 2-2 2-4Z"/>',
  check:     '<path d="M20 6 9 17l-5-5"/>',
  plus:      '<path d="M12 5v14M5 12h14"/>',
  trash:     '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  back:      '<path d="M19 12H5M12 19l-7-7 7-7"/>',
  lock:      '<rect x="4" y="11" width="16" height="9" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
  trophy:    '<path d="M8 21h8M12 17v4M6 4h12v3a6 6 0 0 1-12 0V4Z"/><path d="M6 5H3v2a3 3 0 0 0 3 3M18 5h3v2a3 3 0 0 1-3 3"/>',
  droplet:   '<path d="M12 2.7S6 9 6 13.5a6 6 0 0 0 12 0C18 9 12 2.7 12 2.7Z"/>',
  book:       '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2V5Z"/><path d="M19 17H6a2 2 0 0 0-2 2"/>',
};
export function icon(name, { size = 22 } = {}) {
  const svg = `<svg viewBox="0 0 24 24" width="${size}" height="${size}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${ICONS[name] || ''}</svg>`;
  const span = document.createElement('span');
  span.className = 'icon';
  span.innerHTML = svg;
  return span;
}

export function fmtDate(iso) {
  return new Date(iso).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' });
}
