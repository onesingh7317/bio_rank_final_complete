/* ============================================================
   charts.js — SVG chart utilities for Bio Rank
   All charts are generated as inline SVG strings.
   ============================================================ */

const Charts = {

  /* ---- Hover tooltip registry, used by trendChart() below.
     Chart data is registered by key so inline SVG onmouseenter/onmousemove
     handlers (added when the chart is rendered) can look up the point
     they're hovering without re-serializing data into the DOM. ---- */
  _tooltipData: {},

  registerTrend(key, points) {
    this._tooltipData[key] = points;
  },

  _ensureTooltipEl() {
    let el = document.getElementById('chart-tooltip');
    if (!el) {
      el = document.createElement('div');
      el.id = 'chart-tooltip';
      el.className = 'chart-tooltip';
      document.body.appendChild(el);
    }
    return el;
  },

  showTooltip(evt, key, idx) {
    const points = this._tooltipData[key];
    if (!points || !points[idx]) return;
    const p = points[idx];
    const el = this._ensureTooltipEl();

    let rows = `<div class="chart-tooltip-title">${p.tooltipTitle || p.chapterName || p.title || p.label}</div>`;
    if (p.accuracy !== undefined) {
      rows += `<div class="chart-tooltip-row"><span>Accuracy</span><strong>${p.accuracy}%</strong></div>`;
    }
    if (p.score !== undefined && p.total !== undefined) {
      rows += `<div class="chart-tooltip-row"><span>Score</span><strong>${p.score}/${p.total}</strong></div>`;
    }
    if (p.label && (p.chapterName || p.title)) {
      rows += `<div class="chart-tooltip-sub">${p.label}</div>`;
    }

    el.innerHTML = rows;
    el.style.opacity = '1';
    this.moveTooltip(evt);
  },

  moveTooltip(evt) {
    const el = document.getElementById('chart-tooltip');
    if (!el) return;
    const pad = 14;
    let x = evt.clientX + pad;
    let y = evt.clientY + pad;
    const rect = el.getBoundingClientRect();
    if (x + rect.width > window.innerWidth - 8) x = evt.clientX - rect.width - pad;
    if (y + rect.height > window.innerHeight - 8) y = evt.clientY - rect.height - pad;
    el.style.left = `${x}px`;
    el.style.top = `${y}px`;
  },

  hideTooltip() {
    const el = document.getElementById('chart-tooltip');
    if (el) el.style.opacity = '0';
  },

  /* ---- Performance Trend Chart (smooth line + area, with tooltips) ----
     points: [{ label, accuracy, score, total, chapterName? / title? }]
     key: unique string used to register hover data for this chart instance
     Renders a responsive SVG (scales via viewBox) with gridlines, an
     x-axis label per point (thinned out if there are many), a smooth
     line + soft area fill for `accuracy`, and invisible large hit-targets
     over each dot so the tooltip is easy to trigger on touch/mouse. ---- */
  trendChart({ key, points, width = 640, height = 230, color = '#16a34a' }) {
    if (!points || points.length === 0) {
      return `<div class="chart-empty-state">Not enough data yet — complete a test to see this trend.</div>`;
    }

    this.registerTrend(key, points);

    const padL = 30, padR = 12, padT = 16, padB = 30;
    const chartW = width - padL - padR;
    const chartH = height - padT - padB;
    const n = points.length;
    const max = 100, min = 0;

    const coords = points.map((p, i) => {
      const x = padL + (n > 1 ? (i / (n - 1)) * chartW : chartW / 2);
      const v = Math.max(min, Math.min(max, p.accuracy || 0));
      const y = padT + chartH - ((v - min) / (max - min)) * chartH;
      return { x, y };
    });

    let linePath = '';
    let areaPath = '';
    if (n === 1) {
      const c = coords[0];
      linePath = `M ${(padL).toFixed(1)} ${c.y.toFixed(1)} L ${(width - padR).toFixed(1)} ${c.y.toFixed(1)}`;
      areaPath = `M ${(padL).toFixed(1)} ${c.y.toFixed(1)} L ${(width - padR).toFixed(1)} ${c.y.toFixed(1)} L ${(width - padR).toFixed(1)} ${(padT + chartH).toFixed(1)} L ${(padL).toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;
    } else {
      coords.forEach((c, i) => {
        if (i === 0) { linePath += `M ${c.x.toFixed(1)} ${c.y.toFixed(1)}`; return; }
        const prev = coords[i - 1];
        const midX = ((prev.x + c.x) / 2).toFixed(1);
        linePath += ` C ${midX} ${prev.y.toFixed(1)}, ${midX} ${c.y.toFixed(1)}, ${c.x.toFixed(1)} ${c.y.toFixed(1)}`;
      });
      const lastC = coords[coords.length - 1];
      const firstC = coords[0];
      areaPath = `${linePath} L ${lastC.x.toFixed(1)} ${(padT + chartH).toFixed(1)} L ${firstC.x.toFixed(1)} ${(padT + chartH).toFixed(1)} Z`;
    }

    const gridSteps = [0, 0.25, 0.5, 0.75, 1];
    const gridLines = gridSteps.map(g => {
      const y = padT + chartH - g * chartH;
      const val = Math.round(min + g * (max - min));
      return `<line x1="${padL}" y1="${y.toFixed(1)}" x2="${width - padR}" y2="${y.toFixed(1)}" stroke="#eef1f4" stroke-width="1"/>
        <text x="${(padL - 8).toFixed(1)}" y="${(y + 3).toFixed(1)}" text-anchor="end" font-size="9" fill="#9ca3af">${val}</text>`;
    }).join('');

    const labelEvery = n > 7 ? Math.ceil(n / 6) : 1;
    const xLabels = coords.map((c, i) => {
      if (i % labelEvery !== 0 && i !== n - 1) return '';
      return `<text x="${c.x.toFixed(1)}" y="${height - 8}" text-anchor="middle" font-size="9" fill="#9ca3af">${(points[i].label || '').substring(0, 10)}</text>`;
    }).join('');

    const dots = coords.map((c, i) => `
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="10" fill="transparent"
        onmouseenter="Charts.showTooltip(event,'${key}',${i})"
        onmousemove="Charts.moveTooltip(event)"
        onmouseleave="Charts.hideTooltip()"
        style="cursor:pointer;"/>
      <circle cx="${c.x.toFixed(1)}" cy="${c.y.toFixed(1)}" r="4" fill="${color}" stroke="#fff" stroke-width="1.5" pointer-events="none"/>
    `).join('');

    const gradId = `perfgrad-${key}`;

    return `
      <div class="chart-svg-wrap">
        <svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" preserveAspectRatio="xMidYMid meet" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Performance trend chart">
          <defs>
            <linearGradient id="${gradId}" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stop-color="${color}" stop-opacity="0.22"/>
              <stop offset="100%" stop-color="${color}" stop-opacity="0"/>
            </linearGradient>
          </defs>
          ${gridLines}
          <path d="${areaPath}" fill="url(#${gradId})"/>
          <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"/>
          ${dots}
          ${xLabels}
        </svg>
      </div>
    `;
  },

  /* ---- Simple Bar Chart ---- */
  barChart({ values, labels, width = 300, height = 120, color = '#2980b9' }) {
    if (!values || values.length === 0) return '';
    const max = Math.max(...values, 1);
    const barW = Math.floor((width - (values.length - 1) * 4) / values.length);
    let bars = '';
    let labelEls = '';

    values.forEach((v, i) => {
      const x = i * (barW + 4);
      const barH = Math.round((v / max) * (height - 24));
      const y = height - 24 - barH;
      bars += `<rect x="${x}" y="${y}" width="${barW}" height="${barH}" rx="3" fill="${color}" opacity="0.85"/>`;
      if (labels && labels[i]) {
        labelEls += `<text x="${x + barW / 2}" y="${height - 4}" text-anchor="middle" font-size="9" fill="#7f8c8d">${labels[i]}</text>`;
      }
      labelEls += `<text x="${x + barW / 2}" y="${y - 4}" text-anchor="middle" font-size="9" fill="#2c3e50" font-weight="600">${v}</text>`;
    });

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg">
      ${bars}${labelEls}
    </svg>`;
  },

  /* ---- Line Chart (weekly progress) ---- */
  lineChart({ values, width = 340, height = 100, color = '#2980b9', fillColor = 'rgba(41,128,185,0.08)' }) {
    if (!values || values.length < 2) return '';
    const max = Math.max(...values, 1);
    const min = Math.min(...values, 0);
    const range = max - min || 1;
    const padX = 16; const padY = 12;
    const chartW = width - padX * 2;
    const chartH = height - padY * 2;

    const pts = values.map((v, i) => {
      const x = padX + (i / (values.length - 1)) * chartW;
      const y = padY + chartH - ((v - min) / range) * chartH;
      return { x, y, v };
    });

    const linePath = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const areaPath = `${linePath} L ${pts[pts.length - 1].x.toFixed(1)} ${(padY + chartH).toFixed(1)} L ${pts[0].x.toFixed(1)} ${(padY + chartH).toFixed(1)} Z`;

    const dots = pts.map(p =>
      `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="3.5" fill="${color}" stroke="white" stroke-width="1.5"/>`
    ).join('');

    const dayLabels = ['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
    const labels = pts.map((p, i) =>
      `<text x="${p.x.toFixed(1)}" y="${height - 2}" text-anchor="middle" font-size="9" fill="#95a5a6">${dayLabels[i] || ''}</text>`
    ).join('');

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <path d="${areaPath}" fill="${fillColor}"/>
      <path d="${linePath}" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
      ${dots}
      ${labels}
    </svg>`;
  },

  /* ---- Donut Chart ---- */
  donutChart({ value, max = 100, size = 100, color = '#2980b9', trackColor = '#eaecee', label = '' }) {
    const r = (size - 16) / 2;
    const cx = size / 2;
    const cy = size / 2;
    const circumference = 2 * Math.PI * r;
    const pct = Math.min(value / max, 1);
    const dashOffset = circumference * (1 - pct);

    return `<svg viewBox="0 0 ${size} ${size}" width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${trackColor}" stroke-width="10"/>
      <circle cx="${cx}" cy="${cy}" r="${r}" fill="none" stroke="${color}" stroke-width="10"
        stroke-dasharray="${circumference.toFixed(2)}"
        stroke-dashoffset="${dashOffset.toFixed(2)}"
        stroke-linecap="round"
        transform="rotate(-90 ${cx} ${cy})"/>
      <text x="${cx}" y="${cy}" text-anchor="middle" dominant-baseline="middle"
        font-size="${size > 80 ? 18 : 13}" font-weight="700" fill="#1a1e2e">${label || value + '%'}</text>
    </svg>`;
  },

  /* ---- Radar / Pentagon Chart (simplified as bar groups) ---- */
  radarBars({ items, width = 300, height = 200 }) {
    if (!items || items.length === 0) return '';
    const barH = Math.floor((height - 20) / items.length) - 8;
    const labelW = 150;
    let rows = '';

    items.forEach((item, i) => {
      const y = i * (barH + 8) + 4;
      const barMax = width - labelW - 60;
      const barFill = Math.round((item.value / 100) * barMax);
      const color = item.value >= 70 ? '#27ae60' : item.value >= 50 ? '#f39c12' : '#e74c3c';
      rows += `
        <text x="0" y="${y + barH / 2 + 4}" font-size="11" fill="#5d6d7e">${item.label.substring(0,22)}</text>
        <rect x="${labelW}" y="${y}" width="${barMax}" height="${barH}" rx="4" fill="#eaecee"/>
        <rect x="${labelW}" y="${y}" width="${barFill}" height="${barH}" rx="4" fill="${color}" opacity="0.9"/>
        <text x="${labelW + barMax + 6}" y="${y + barH / 2 + 4}" font-size="11" fill="#2c3e50" font-weight="600">${item.value}%</text>
      `;
    });

    return `<svg viewBox="0 0 ${width} ${height}" width="100%" xmlns="http://www.w3.org/2000/svg">
      ${rows}
    </svg>`;
  },

  /* ---- Accuracy Donut with label ---- */
  accuracyWidget(accuracy, size = 120) {
    const color = accuracy >= 70 ? '#27ae60' : accuracy >= 50 ? '#f39c12' : '#e74c3c';
    return this.donutChart({ value: accuracy, max: 100, size, color, label: accuracy + '%' });
  },

  /* ---- Progress Ring (small) ---- */
  progressRing({ value, size = 48, color = '#2980b9' }) {
    return this.donutChart({ value, max: 100, size, color, trackColor: '#eaecee', label: value + '%' });
  },

};
