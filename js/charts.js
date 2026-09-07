// charts.js — tiny dependency-free SVG charts.

const NS = 'http://www.w3.org/2000/svg';
// Tactical monochrome palette (matches CSS tokens).
const ACCENT = '#cdd2d6';                 // light steel — lines/fills
const ACCENT_GLOW = 'rgba(205,212,218,.45)';
const INK = '#e7e9ea';                    // bright readout text
const MUTE = '#8b9196';                   // muted labels
const FAINT = '#5b6166';                  // axis labels
const GRID = 'rgba(255,255,255,.06)';
const DOT_FILL = '#0e0f11';               // dot centre (matches --bg-2)

function svgEl(tag, attrs) {
  const el = document.createElementNS(NS, tag);
  for (const k in attrs) el.setAttribute(k, attrs[k]);
  return el;
}

// Circular progress ring. value/max -> filled arc. Returns an <svg>.
export function progressRing(value, max, { size = 132, stroke = 12, label, sub } = {}) {
  const pct = max > 0 ? Math.min(1, value / max) : 0;
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const svg = svgEl('svg', { viewBox: `0 0 ${size} ${size}`, width: size, height: size, class: 'ring' });

  svg.appendChild(svgEl('circle', {
    cx: size / 2, cy: size / 2, r, fill: 'none',
    stroke: 'rgba(255,255,255,.08)', 'stroke-width': stroke,
  }));
  const arc = svgEl('circle', {
    cx: size / 2, cy: size / 2, r, fill: 'none',
    stroke: ACCENT, 'stroke-width': stroke, 'stroke-linecap': 'round',
    'stroke-dasharray': c, 'stroke-dashoffset': c * (1 - pct),
    transform: `rotate(-90 ${size / 2} ${size / 2})`,
    style: `filter:drop-shadow(0 0 6px ${ACCENT_GLOW});transition:stroke-dashoffset .6s ease`,
  });
  svg.appendChild(arc);

  const big = svgEl('text', {
    x: size / 2, y: size / 2 - 2, 'text-anchor': 'middle', 'dominant-baseline': 'middle',
    fill: INK, 'font-size': size * 0.26, 'font-weight': 700,
  });
  big.textContent = label != null ? label : `${Math.round(pct * 100)}%`;
  svg.appendChild(big);

  if (sub) {
    const small = svgEl('text', {
      x: size / 2, y: size / 2 + size * 0.17, 'text-anchor': 'middle',
      fill: MUTE, 'font-size': size * 0.1, 'font-weight': 600,
    });
    small.textContent = sub;
    svg.appendChild(small);
  }
  return svg;
}

// Line chart from [{date, value}] points. Returns an <svg> (responsive width).
export function lineChart(points, { height = 160, unit = '' } = {}) {
  const W = 320, H = height, padL = 34, padR = 12, padT = 14, padB = 22;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', preserveAspectRatio: 'none' });

  if (!points.length) {
    const t = svgEl('text', { x: W / 2, y: H / 2, 'text-anchor': 'middle', fill: MUTE, 'font-size': 13 });
    t.textContent = 'No data yet — log a session to see progress.';
    svg.appendChild(t);
    return svg;
  }

  const vals = points.map((p) => p.value);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const range = maxV - minV || 1;
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const x = (i) => padL + (points.length === 1 ? innerW / 2 : (i / (points.length - 1)) * innerW);
  const y = (v) => padT + innerH - ((v - minV) / range) * innerH;

  // gridlines + y labels (3 lines)
  for (let g = 0; g <= 2; g++) {
    const v = minV + (range * g) / 2;
    const gy = y(v);
    svg.appendChild(svgEl('line', { x1: padL, y1: gy, x2: W - padR, y2: gy, stroke: GRID, 'stroke-width': 1 }));
    const lbl = svgEl('text', { x: padL - 6, y: gy + 3, 'text-anchor': 'end', fill: FAINT, 'font-size': 9 });
    lbl.textContent = Math.round(v);
    svg.appendChild(lbl);
  }

  // area fill
  const linePts = points.map((p, i) => `${x(i)},${y(p.value)}`).join(' ');
  const areaPts = `${padL},${y(minV)} ${linePts} ${x(points.length - 1)},${y(minV)}`;
  const grad = svgEl('linearGradient', { id: 'fillGrad', x1: 0, y1: 0, x2: 0, y2: 1 });
  grad.appendChild(svgEl('stop', { offset: '0%', 'stop-color': ACCENT, 'stop-opacity': 0.35 }));
  grad.appendChild(svgEl('stop', { offset: '100%', 'stop-color': ACCENT, 'stop-opacity': 0 }));
  const defs = svgEl('defs', {});
  defs.appendChild(grad);
  svg.appendChild(defs);
  svg.appendChild(svgEl('polygon', { points: areaPts, fill: 'url(#fillGrad)' }));

  // line
  svg.appendChild(svgEl('polyline', {
    points: linePts, fill: 'none', stroke: ACCENT, 'stroke-width': 2.5,
    'stroke-linejoin': 'round', 'stroke-linecap': 'round',
    style: `filter:drop-shadow(0 0 4px ${ACCENT_GLOW})`,
  }));

  // dots + last-value label
  points.forEach((p, i) => {
    svg.appendChild(svgEl('circle', { cx: x(i), cy: y(p.value), r: 3, fill: DOT_FILL, stroke: ACCENT, 'stroke-width': 2 }));
  });
  const last = points[points.length - 1];
  const lt = svgEl('text', { x: x(points.length - 1), y: y(last.value) - 8, 'text-anchor': 'end', fill: INK, 'font-size': 11, 'font-weight': 700 });
  lt.textContent = `${last.value}${unit}`;
  svg.appendChild(lt);

  return svg;
}

// Weekly bar chart from [{label, value}].
export function barChart(bars, { height = 150, unit = '' } = {}) {
  const W = 320, H = height, padT = 16, padB = 26, padL = 10, padR = 10;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart', preserveAspectRatio: 'none' });
  const maxV = Math.max(...bars.map((b) => b.value), 1);
  const innerW = W - padL - padR;
  const innerH = H - padT - padB;
  const slot = innerW / bars.length;
  const bw = Math.min(46, slot * 0.6);

  bars.forEach((b, i) => {
    const h = (b.value / maxV) * innerH;
    const bx = padL + slot * i + (slot - bw) / 2;
    const by = padT + innerH - h;
    svg.appendChild(svgEl('rect', {
      x: bx, y: by, width: bw, height: Math.max(h, 1), rx: 5,
      fill: b.value > 0 ? ACCENT : 'rgba(255,255,255,.10)',
      style: b.value > 0 ? `filter:drop-shadow(0 0 5px ${ACCENT_GLOW})` : '',
    }));
    if (b.value > 0) {
      const vt = svgEl('text', { x: bx + bw / 2, y: by - 4, 'text-anchor': 'middle', fill: INK, 'font-size': 10, 'font-weight': 700 });
      vt.textContent = `${b.value}${unit}`;
      svg.appendChild(vt);
    }
    const lt = svgEl('text', { x: bx + bw / 2, y: H - 8, 'text-anchor': 'middle', fill: MUTE, 'font-size': 10 });
    lt.textContent = b.label;
    svg.appendChild(lt);
  });
  return svg;
}

// Radar / spider chart for the performance standards.
// axes: [{ short, score }] with score in 0..3. Rings mark the 3 tiers.
export function radarChart(axes, { tierLabels = ['Standard', 'Elite', 'Pro'] } = {}) {
  const W = 340, H = 320, cx = W / 2, cy = H / 2 + 6, R = 118, MAX = 3;
  const N = axes.length;
  const svg = svgEl('svg', { viewBox: `0 0 ${W} ${H}`, class: 'chart radar', preserveAspectRatio: 'xMidYMid meet' });
  const ang = (i) => -Math.PI / 2 + (i * 2 * Math.PI) / N;
  const pt = (i, r) => [cx + r * Math.cos(ang(i)), cy + r * Math.sin(ang(i))];
  const polyPoints = (r) => axes.map((_, i) => pt(i, r).join(',')).join(' ');

  // tier rings (concentric polygons) at score 1, 2, 3
  for (let t = 1; t <= MAX; t++) {
    const r = (t / MAX) * R;
    svg.appendChild(svgEl('polygon', {
      points: polyPoints(r), fill: 'none',
      stroke: t === MAX ? 'rgba(255,255,255,.28)' : 'rgba(255,255,255,.13)', 'stroke-width': t === MAX ? 1.3 : 1,
    }));
    // tier label along the top spoke
    const [lx, ly] = pt(0, r);
    const lbl = svgEl('text', { x: lx + 4, y: ly + 3, fill: FAINT, 'font-size': 7.5, 'font-weight': 700 });
    lbl.textContent = (tierLabels[t - 1] || '').toUpperCase();
    svg.appendChild(lbl);
  }

  // spokes + axis labels
  axes.forEach((a, i) => {
    const [ex, ey] = pt(i, R);
    svg.appendChild(svgEl('line', { x1: cx, y1: cy, x2: ex, y2: ey, stroke: GRID, 'stroke-width': 1 }));
    const [lx, ly] = pt(i, R + 16);
    const anchor = Math.abs(lx - cx) < 12 ? 'middle' : lx > cx ? 'start' : 'end';
    const t = svgEl('text', { x: lx, y: ly + 3, 'text-anchor': anchor, fill: MUTE, 'font-size': 9, 'font-weight': 700 });
    t.textContent = a.short;
    svg.appendChild(t);
  });

  // athlete polygon
  const aPts = axes.map((a, i) => pt(i, (Math.max(0, Math.min(MAX, a.score)) / MAX) * R).join(',')).join(' ');
  svg.appendChild(svgEl('polygon', {
    points: aPts, fill: 'rgba(205,212,218,.18)', stroke: ACCENT, 'stroke-width': 2,
    'stroke-linejoin': 'round', style: `filter:drop-shadow(0 0 4px ${ACCENT_GLOW})`,
  }));
  axes.forEach((a, i) => {
    const [x, y] = pt(i, (Math.max(0, Math.min(MAX, a.score)) / MAX) * R);
    if (a.score > 0) svg.appendChild(svgEl('circle', { cx: x, cy: y, r: 3, fill: DOT_FILL, stroke: ACCENT, 'stroke-width': 2 }));
  });
  return svg;
}
