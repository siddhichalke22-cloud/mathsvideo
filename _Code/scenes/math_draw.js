// Shared 1920x1080 mathematical graphics & animation primitives

export const THEME = {
  bg0: '#060a14',
  bg1: '#0d1526',
  panel: 'rgba(15, 23, 42, 0.90)',
  panelLight: 'rgba(30, 41, 59, 0.85)',
  border: '#334155',
  text: '#f8fafc',
  textDim: '#94a3b8',
  cyan: '#38bdf8',
  amber: '#fbbf24',
  emerald: '#34d399',
  coral: '#fb7185',
  violet: '#a78bfa',
  blue: '#60a5fa',
};

export const FONT_SANS = '"SF Pro Display", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
export const FONT_MONO = '"SF Mono", Menlo, Monaco, Consolas, monospace';

export function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function easeOutCubic(t) {
  t = clamp01(t);
  return 1 - Math.pow(1 - t, 3);
}

export function easeInOutCubic(t) {
  t = clamp01(t);
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}

export function easeOutBack(t) {
  t = clamp01(t);
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
}

export function seg(t, start, end) {
  if (end <= start) return t >= end ? 1 : 0;
  return clamp01((t - start) / (end - start));
}

export function findBeat(timeline, beatId) {
  for (const s of timeline.scenes) {
    for (const b of s.beats) {
      if (b.id === beatId) return b;
    }
  }
  return null;
}

export function beatSpan(timeline, beatId) {
  const b = findBeat(timeline, beatId);
  if (!b) return { start: 0, speechEnd: 1, end: 1, duration: 1 };
  return b;
}

export function drawBackground(ctx, t, sceneTitle, sceneIndex, totalDuration) {
  const W = 1920;
  const H = 1080;

  // Deep radial-linear gradient
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, THEME.bg0);
  grad.addColorStop(1, THEME.bg1);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // Subtle ambient glow
  const rad = ctx.createRadialGradient(960, 420, 40, 960, 480, 900);
  rad.addColorStop(0, 'rgba(56, 189, 248, 0.06)');
  rad.addColorStop(0.6, 'rgba(99, 102, 241, 0.03)');
  rad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = rad;
  ctx.fillRect(0, 0, W, H);

  // Subtle geometric grid
  ctx.strokeStyle = 'rgba(148, 163, 184, 0.055)';
  ctx.lineWidth = 1;
  const step = 60;
  ctx.beginPath();
  for (let x = 0; x <= W; x += step) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
  }
  for (let y = 0; y <= H; y += step) {
    ctx.moveTo(0, y);
    ctx.lineTo(W, y);
  }
  ctx.stroke();

  if (sceneTitle) {
    // Top header bar
    ctx.fillStyle = 'rgba(15, 23, 42, 0.72)';
    ctx.fillRect(0, 0, W, 74);
    ctx.strokeStyle = 'rgba(51, 65, 85, 0.7)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, 74);
    ctx.lineTo(W, 74);
    ctx.stroke();

    // Left badge
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    roundRectPath(ctx, 48, 18, 148, 38, 19);
    ctx.fill();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.55)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.fillStyle = THEME.cyan;
    ctx.font = `700 18px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(`SCENE ${sceneIndex} / 6`, 122, 37);

    // Title
    ctx.fillStyle = THEME.text;
    ctx.font = `700 28px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText(sceneTitle, 218, 38);

    // Course tag right
    ctx.fillStyle = THEME.textDim;
    ctx.font = `600 18px ${FONT_SANS}`;
    ctx.textAlign = 'right';
    ctx.fillText('M3 • Linear Algebra & Calculus', W - 48, 38);
  }

  // Bottom minimal progress bar
  if (totalDuration > 0) {
    const pct = clamp01(t / totalDuration);
    ctx.fillStyle = 'rgba(30, 41, 59, 0.7)';
    ctx.fillRect(0, H - 6, W, 6);
    const barGrad = ctx.createLinearGradient(0, 0, W, 0);
    barGrad.addColorStop(0, THEME.cyan);
    barGrad.addColorStop(1, THEME.emerald);
    ctx.fillStyle = barGrad;
    ctx.fillRect(0, H - 6, W * pct, 6);
  }
}

export function roundRectPath(ctx, x, y, w, h, r) {
  const rr = Math.min(r, w / 2, h / 2);
  ctx.beginPath();
  ctx.moveTo(x + rr, y);
  ctx.lineTo(x + w - rr, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rr);
  ctx.lineTo(x + w, y + h - rr);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rr, y + h);
  ctx.lineTo(x + rr, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rr);
  ctx.lineTo(x, y + rr);
  ctx.quadraticCurveTo(x, y, x + rr, y);
  ctx.closePath();
}

export function drawCard(ctx, x, y, w, h, opts = {}) {
  const {
    fill = THEME.panel,
    border = THEME.border,
    borderWidth = 2,
    radius = 18,
    alpha = 1,
    glowColor = null,
  } = opts;
  ctx.save();
  ctx.globalAlpha = alpha;
  if (glowColor) {
    ctx.shadowColor = glowColor;
    ctx.shadowBlur = 24;
  }
  roundRectPath(ctx, x, y, w, h, radius);
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.shadowBlur = 0;
  ctx.strokeStyle = border;
  ctx.lineWidth = borderWidth;
  ctx.stroke();
  ctx.restore();
}

export function drawBadge(ctx, x, y, text, color = THEME.cyan, alpha = 1, fontSize = 24, padX = 22, h = 48) {
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.font = `700 ${fontSize}px ${FONT_MONO}`;
  const tw = ctx.measureText(text).width;
  const w = tw + padX * 2;
  roundRectPath(ctx, x - w / 2, y - h / 2, w, h, h / 2);
  ctx.fillStyle = 'rgba(15, 23, 42, 0.94)';
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
  ctx.restore();
  return w;
}

/**
 * Draw an augmented (or plain) matrix centered at (cx, cy).
 * rows: array of arrays of strings/numbers.
 */
export function drawMatrix(ctx, opts) {
  const {
    cx,
    cy,
    rows,
    colWidths = [86, 86, 86, 94],
    rowHeight = 76,
    augCol = 3, // divider before col index `augCol`; null for none
    fontSize = 36,
    alpha = 1,
    pivots = [], // [{r, c, color, pulse}]
    rowHighlights = [], // [{r, color, alpha}]
    cellHighlights = [], // [{r, c, color, alpha}]
    rowOffsets = null, // [dy0, dy1, ...]
    echelonProgress = 0, // 0..1 staircase line
    colHeaders = null, // e.g. ['x', 'y', 'z', 'b']
    title = null,
    bracketColor = '#cbd5e1',
  } = opts;

  const nRows = rows.length;
  const nCols = rows[0].length;
  const gapAug = augCol !== null ? 24 : 0;
  const totalW = colWidths.reduce((a, b) => a + b, 0) + gapAug;
  const totalH = nRows * rowHeight;
  const x0 = cx - totalW / 2;
  const y0 = cy - totalH / 2;

  ctx.save();
  ctx.globalAlpha = alpha;

  if (title) {
    ctx.fillStyle = THEME.textDim;
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(title, cx, y0 - (colHeaders ? 42 : 18));
  }

  // Compute column centers
  const colX = [];
  let cursor = x0;
  for (let c = 0; c < nCols; c++) {
    if (augCol !== null && c === augCol) {
      cursor += gapAug;
    }
    colX.push(cursor + colWidths[c] / 2);
    cursor += colWidths[c];
  }

  // Optional column headers
  if (colHeaders) {
    ctx.font = `700 22px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    for (let c = 0; c < nCols; c++) {
      ctx.fillStyle = c === augCol ? THEME.amber : THEME.cyan;
      ctx.fillText(colHeaders[c], colX[c], y0 - 12);
    }
  }

  // Row highlights
  for (const rh of rowHighlights) {
    const dy = rowOffsets ? rowOffsets[rh.r] || 0 : 0;
    const ry = y0 + rh.r * rowHeight + dy;
    ctx.save();
    ctx.globalAlpha = alpha * (rh.alpha ?? 0.22);
    roundRectPath(ctx, x0 + 4, ry + 6, totalW - 8, rowHeight - 12, 12);
    ctx.fillStyle = rh.color || THEME.amber;
    ctx.fill();
    ctx.restore();
  }

  // Cell highlights
  for (const ch of cellHighlights) {
    const dy = rowOffsets ? rowOffsets[ch.r] || 0 : 0;
    const ry = y0 + ch.r * rowHeight + dy;
    const cw = colWidths[ch.c];
    ctx.save();
    ctx.globalAlpha = alpha * (ch.alpha ?? 0.3);
    roundRectPath(ctx, colX[ch.c] - cw / 2 + 6, ry + 8, cw - 12, rowHeight - 16, 12);
    ctx.fillStyle = ch.color || THEME.cyan;
    ctx.fill();
    ctx.restore();
  }

  // Pivots
  for (const pv of pivots) {
    const dy = rowOffsets ? rowOffsets[pv.r] || 0 : 0;
    const ry = y0 + pv.r * rowHeight + dy;
    const cw = colWidths[pv.c];
    const pColor = pv.color || THEME.amber;
    const pulse = pv.pulse ?? 1;
    ctx.save();
    roundRectPath(ctx, colX[pv.c] - cw / 2 + 8, ry + 8, cw - 16, rowHeight - 16, 12);
    ctx.fillStyle = 'rgba(251, 191, 36, 0.16)';
    if (pColor === THEME.emerald) ctx.fillStyle = 'rgba(52, 211, 153, 0.16)';
    if (pColor === THEME.cyan) ctx.fillStyle = 'rgba(56, 189, 248, 0.16)';
    ctx.fill();
    ctx.strokeStyle = pColor;
    ctx.lineWidth = 2.5 + 1.2 * Math.sin(pulse * Math.PI);
    ctx.stroke();
    ctx.restore();
  }

  // Augmented divider line
  if (augCol !== null && augCol > 0 && augCol < nCols) {
    const divX = colX[augCol - 1] + colWidths[augCol - 1] / 2 + gapAug / 2;
    ctx.save();
    ctx.strokeStyle = 'rgba(56, 189, 248, 0.65)';
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(divX, y0 + 6);
    ctx.lineTo(divX, y0 + totalH - 6);
    ctx.stroke();
    ctx.restore();
  }

  // Matrix entries
  ctx.font = `600 ${fontSize}px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  for (let r = 0; r < nRows; r++) {
    const dy = rowOffsets ? rowOffsets[r] || 0 : 0;
    const ry = y0 + r * rowHeight + rowHeight / 2 + dy;
    for (let c = 0; c < nCols; c++) {
      const val = rows[r][c];
      const str = String(val);
      const isZeroBelow = r > c && str === '0' && c < (augCol ?? nCols);
      const isPivot = pivots.some((p) => p.r === r && p.c === c);
      if (isPivot) {
        const pv = pivots.find((p) => p.r === r && p.c === c);
        ctx.fillStyle = pv.color || THEME.amber;
      } else if (isZeroBelow) {
        ctx.fillStyle = 'rgba(52, 211, 153, 0.85)';
      } else if (augCol !== null && c >= augCol) {
        ctx.fillStyle = '#e2e8f0';
      } else {
        ctx.fillStyle = THEME.text;
      }
      ctx.fillText(str, colX[c], ry);
    }
  }

  // Echelon staircase overlay
  if (echelonProgress > 0 && nRows >= 2) {
    ctx.save();
    ctx.strokeStyle = THEME.emerald;
    ctx.lineWidth = 4;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.shadowColor = THEME.emerald;
    ctx.shadowBlur = 12;
    const pts = [];
    for (let r = 0; r < nRows; r++) {
      const lx = colX[r] - colWidths[r] / 2 + 4;
      const rx = colX[r] + colWidths[r] / 2 - 4;
      const by = y0 + (r + 1) * rowHeight - 4;
      pts.push([lx, y0 + r * rowHeight + 4]);
      pts.push([lx, by]);
      pts.push([rx, by]);
    }
    // Compute total length and draw fraction echelonProgress
    let totalLen = 0;
    const segLens = [];
    for (let i = 0; i < pts.length - 1; i++) {
      const d = Math.hypot(pts[i + 1][0] - pts[i][0], pts[i + 1][1] - pts[i][1]);
      segLens.push(d);
      totalLen += d;
    }
    let rem = totalLen * clamp01(echelonProgress);
    ctx.beginPath();
    ctx.moveTo(pts[0][0], pts[0][1]);
    for (let i = 0; i < segLens.length && rem > 0; i++) {
      const d = segLens[i];
      if (rem >= d) {
        ctx.lineTo(pts[i + 1][0], pts[i + 1][1]);
        rem -= d;
      } else {
        const f = rem / d;
        ctx.lineTo(lerp(pts[i][0], pts[i + 1][0], f), lerp(pts[i][1], pts[i + 1][1], f));
        rem = 0;
      }
    }
    ctx.stroke();
    ctx.restore();
  }

  // Square brackets [ ]
  const bw = 16;
  const bxL = x0 - 10;
  const bxR = x0 + totalW + 10;
  ctx.strokeStyle = bracketColor;
  ctx.lineWidth = 4.5;
  ctx.lineCap = 'square';
  ctx.beginPath();
  // Left bracket
  ctx.moveTo(bxL + bw, y0 - 4);
  ctx.lineTo(bxL, y0 - 4);
  ctx.lineTo(bxL, y0 + totalH + 4);
  ctx.lineTo(bxL + bw, y0 + totalH + 4);
  // Right bracket
  ctx.moveTo(bxR - bw, y0 - 4);
  ctx.lineTo(bxR, y0 - 4);
  ctx.lineTo(bxR, y0 + totalH + 4);
  ctx.lineTo(bxR - bw, y0 + totalH + 4);
  ctx.stroke();

  ctx.restore();
  return { x0, y0, totalW, totalH, colX };
}

export function drawSwapArc(ctx, x, y1, y2, progress, label = 'R₁ ↔ R₂', color = THEME.cyan) {
  if (progress <= 0) return;
  ctx.save();
  ctx.globalAlpha = clamp01(progress * 2);
  const midY = (y1 + y2) / 2;
  const ctrlX = x - 52;
  ctx.strokeStyle = color;
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(x, y1);
  ctx.quadraticCurveTo(ctrlX, midY, x, y2);
  ctx.stroke();

  // Arrowheads
  const drawHead = (px, py, dirY) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(px + 6, py);
    ctx.lineTo(px - 8, py + dirY * 6 - 5);
    ctx.lineTo(px - 8, py + dirY * 6 + 5);
    ctx.closePath();
    ctx.fill();
  };
  drawHead(x, y1, 1);
  drawHead(x, y2, -1);

  if (label) {
    ctx.font = `700 20px ${FONT_MONO}`;
    ctx.fillStyle = color;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, ctrlX + 10, midY);
  }
  ctx.restore();
}

export function drawArrow(ctx, x1, y1, x2, y2, color = THEME.amber, progress = 1, lineWidth = 4) {
  if (progress <= 0) return;
  ctx.save();
  const px = lerp(x1, x2, clamp01(progress));
  const py = lerp(y1, y2, clamp01(progress));
  ctx.strokeStyle = color;
  ctx.fillStyle = color;
  ctx.lineWidth = lineWidth;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x1, y1);
  ctx.lineTo(px, py);
  ctx.stroke();
  if (progress > 0.7) {
    const ang = Math.atan2(y2 - y1, x2 - x1);
    const hl = 14;
    ctx.beginPath();
    ctx.moveTo(px, py);
    ctx.lineTo(px - hl * Math.cos(ang - 0.45), py - hl * Math.sin(ang - 0.45));
    ctx.lineTo(px - hl * Math.cos(ang + 0.45), py - hl * Math.sin(ang + 0.45));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}

/**
 * Draw 2D Cartesian coordinate plane and lines of form a*x + b*y = c.
 */
export function draw2DPlane(ctx, opts) {
  const {
    cx,
    cy,
    w,
    h,
    scale = 65, // pixels per unit
    originOffset = [0, 0], // math coords at center
    lines = [], // [{a, b, c, color, width, dash, label, alpha}]
    point = null, // {x, y, label, color, pulse}
    alpha = 1,
  } = opts;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Clip box
  roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 16);
  ctx.fillStyle = 'rgba(7, 11, 20, 0.92)';
  ctx.fill();
  ctx.strokeStyle = THEME.border;
  ctx.lineWidth = 2;
  ctx.stroke();

  ctx.save();
  roundRectPath(ctx, cx - w / 2, cy - h / 2, w, h, 16);
  ctx.clip();

  const toScreen = (mx, my) => [
    cx + (mx - originOffset[0]) * scale,
    cy - (my - originOffset[1]) * scale,
  ];

  // Gridlines
  const minX = Math.floor(originOffset[0] - w / (2 * scale)) - 1;
  const maxX = Math.ceil(originOffset[0] + w / (2 * scale)) + 1;
  const minY = Math.floor(originOffset[1] - h / (2 * scale)) - 1;
  const maxY = Math.ceil(originOffset[1] + h / (2 * scale)) + 1;

  ctx.strokeStyle = 'rgba(148, 163, 184, 0.14)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let gx = minX; gx <= maxX; gx++) {
    const [sx] = toScreen(gx, 0);
    ctx.moveTo(sx, cy - h / 2);
    ctx.lineTo(sx, cy + h / 2);
  }
  for (let gy = minY; gy <= maxY; gy++) {
    const [, sy] = toScreen(0, gy);
    ctx.moveTo(cx - w / 2, sy);
    ctx.lineTo(cx + w / 2, sy);
  }
  ctx.stroke();

  // Axes
  const [ox, oy] = toScreen(0, 0);
  ctx.strokeStyle = 'rgba(203, 213, 225, 0.55)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - w / 2, oy);
  ctx.lineTo(cx + w / 2, oy);
  ctx.moveTo(ox, cy - h / 2);
  ctx.lineTo(ox, cy + h / 2);
  ctx.stroke();

  // Axis numbers
  ctx.fillStyle = THEME.textDim;
  ctx.font = `500 15px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  for (let gx = minX; gx <= maxX; gx++) {
    if (gx === 0) continue;
    const [sx] = toScreen(gx, 0);
    if (sx > cx - w / 2 + 15 && sx < cx + w / 2 - 15) {
      ctx.fillText(String(gx), sx, Math.min(cy + h / 2 - 22, Math.max(cy - h / 2 + 6, oy + 6)));
    }
  }
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let gy = minY; gy <= maxY; gy++) {
    if (gy === 0) continue;
    const [, sy] = toScreen(0, gy);
    if (sy > cy - h / 2 + 15 && sy < cy + h / 2 - 15) {
      ctx.fillText(String(gy), Math.min(cx + w / 2 - 8, Math.max(cx - w / 2 + 26, ox - 8)), sy);
    }
  }

  // Lines: a*x + b*y = c
  for (const ln of lines) {
    const { a, b, c, color = THEME.cyan, width = 3.5, dash = null, label = null, alpha: lAlpha = 1 } = ln;
    if (Math.abs(a) < 1e-6 && Math.abs(b) < 1e-6) continue;
    ctx.save();
    ctx.globalAlpha = alpha * lAlpha;
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    if (dash) ctx.setLineDash(dash);

    let p1, p2;
    if (Math.abs(b) > Math.abs(a)) {
      const y1 = (c - a * (minX - 1)) / b;
      const y2 = (c - a * (maxX + 1)) / b;
      p1 = toScreen(minX - 1, y1);
      p2 = toScreen(maxX + 1, y2);
    } else {
      const x1 = (c - b * (minY - 1)) / a;
      const x2 = (c - b * (maxY + 1)) / a;
      p1 = toScreen(x1, minY - 1);
      p2 = toScreen(x2, maxY + 1);
    }
    ctx.beginPath();
    ctx.moveTo(p1[0], p1[1]);
    ctx.lineTo(p2[0], p2[1]);
    ctx.stroke();

    if (label && ln.labelPos) {
      const [lx, ly] = toScreen(ln.labelPos[0], ln.labelPos[1]);
      ctx.setLineDash([]);
      ctx.font = `700 18px ${FONT_MONO}`;
      const tw = ctx.measureText(label).width;
      roundRectPath(ctx, lx - tw / 2 - 10, ly - 15, tw + 20, 30, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.9)';
      ctx.fill();
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(label, lx, ly + 1);
    }
    ctx.restore();
  }

  // Intersection point
  if (point) {
    const [px, py] = toScreen(point.x, point.y);
    const pCol = point.color || THEME.coral;
    const pulse = point.pulse ?? 0;
    ctx.save();
    ctx.fillStyle = pCol;
    ctx.globalAlpha = alpha * (0.25 + 0.15 * Math.sin(pulse));
    ctx.beginPath();
    ctx.arc(px, py, 18 + 4 * Math.sin(pulse), 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px, py, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();

    if (point.label) {
      ctx.font = `700 20px ${FONT_MONO}`;
      const tw = ctx.measureText(point.label).width;
      roundRectPath(ctx, px + 14, py - 32, tw + 18, 30, 8);
      ctx.fillStyle = 'rgba(15, 23, 42, 0.92)';
      ctx.fill();
      ctx.strokeStyle = pCol;
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = '#ffffff';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(point.label, px + 23, py - 16);
    }
    ctx.restore();
  }

  ctx.restore();
  ctx.restore();
}

/**
 * Depth-sorted 3D plane visualizer in R^3.
 * planes: [{n: [a,b,c], d: rhs, color, stroke, alpha}] representing a*x + b*y + c*z = d
 */
export function draw3DPlanesScene(ctx, opts) {
  const {
    cx,
    cy,
    size = 110,
    yaw = 0.65,
    pitch = 0.42,
    center = [2, -1, 3],
    planes = [],
    point = null, // [2, -1, 3]
    line = null, // {p0, dir, color}
    alpha = 1,
  } = opts;

  const cyaw = Math.cos(yaw), syaw = Math.sin(yaw);
  const cp = Math.cos(pitch), sp = Math.sin(pitch);

  const project = (pt) => {
    const x = pt[0] - center[0];
    const y = pt[1] - center[1];
    const z = pt[2] - center[2];
    // Rotate around Z (yaw) then X (pitch)
    const x1 = x * cyaw - y * syaw;
    const y1 = x * syaw + y * cyaw;
    const z1 = z;
    const y2 = y1 * cp - z1 * sp;
    const z2 = y1 * sp + z1 * cp;
    // Camera along +Y2 looking toward origin, X1 right, Z2 up
    const camDist = 14;
    const persp = camDist / Math.max(2, camDist - y2 * 0.45);
    return {
      sx: cx + x1 * size * persp,
      sy: cy - z2 * size * persp,
      depth: y2,
    };
  };

  ctx.save();
  ctx.globalAlpha = alpha;

  // Draw coordinate triad around center
  const axes = [
    { dir: [2.6, 0, 0], label: 'x', col: '#64748b' },
    { dir: [0, 2.6, 0], label: 'y', col: '#64748b' },
    { dir: [0, 0, 2.4], label: 'z', col: '#94a3b8' },
  ];
  for (const ax of axes) {
    const pA = project([center[0] - ax.dir[0], center[1] - ax.dir[1], center[2] - ax.dir[2]]);
    const pB = project([center[0] + ax.dir[0], center[1] + ax.dir[1], center[2] + ax.dir[2]]);
    ctx.strokeStyle = ax.col;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([4, 4]);
    ctx.beginPath();
    ctx.moveTo(pA.sx, pA.sy);
    ctx.lineTo(pB.sx, pB.sy);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = ax.col;
    ctx.font = `700 18px ${FONT_MONO}`;
    ctx.fillText(ax.label, pB.sx + 8, pB.sy);
  }

  // Subdivide each plane into 5x5 quads so intersecting planes sort cleanly!
  const quads = [];
  const half = 2.2;
  const gridN = 6;

  for (const pl of planes) {
    const [a, b, c] = pl.n;
    const d = pl.d;
    const norm = Math.hypot(a, b, c);
    if (norm < 1e-6) continue;
    const n = [a / norm, b / norm, c / norm];
    // Find base point on plane closest to center
    const err = a * center[0] + b * center[1] + c * center[2] - d;
    const base = [
      center[0] - (err * a) / (norm * norm),
      center[1] - (err * b) / (norm * norm),
      center[2] - (err * c) / (norm * norm),
    ];
    // Orthonormal tangent basis (u, v)
    const ref = Math.abs(n[2]) < 0.8 ? [0, 0, 1] : [1, 0, 0];
    const uRaw = [
      n[1] * ref[2] - n[2] * ref[1],
      n[2] * ref[0] - n[0] * ref[2],
      n[0] * ref[1] - n[1] * ref[0],
    ];
    const uLen = Math.hypot(...uRaw);
    const u = uRaw.map((v) => v / uLen);
    const v = [
      n[1] * u[2] - n[2] * u[1],
      n[2] * u[0] - n[0] * u[2],
      n[0] * u[1] - n[1] * u[0],
    ];

    for (let i = 0; i < gridN; i++) {
      for (let j = 0; j < gridN; j++) {
        const s0 = lerp(-half, half, i / gridN);
        const s1 = lerp(-half, half, (i + 1) / gridN);
        const t0 = lerp(-half, half, j / gridN);
        const t1 = lerp(-half, half, (j + 1) / gridN);
        const mk = (su, tv) => [
          base[0] + su * u[0] + tv * v[0],
          base[1] + su * u[1] + tv * v[1],
          base[2] + su * u[2] + tv * v[2],
        ];
        const pts3 = [mk(s0, t0), mk(s1, t0), mk(s1, t1), mk(s0, t1)];
        const proj = pts3.map(project);
        const avgDepth = proj.reduce((acc, p) => acc + p.depth, 0) / 4;
        quads.push({
          proj,
          depth: avgDepth,
          color: pl.color,
          stroke: pl.stroke,
          alpha: pl.alpha ?? 0.28,
          isEdge: [i === 0, j === gridN - 1, i === gridN - 1, j === 0],
        });
      }
    }
  }

  quads.sort((q1, q2) => q1.depth - q2.depth);
  for (const q of quads) {
    ctx.save();
    ctx.globalAlpha = alpha * q.alpha;
    ctx.fillStyle = q.color;
    ctx.beginPath();
    ctx.moveTo(q.proj[0].sx, q.proj[0].sy);
    for (let k = 1; k < 4; k++) ctx.lineTo(q.proj[k].sx, q.proj[k].sy);
    ctx.closePath();
    ctx.fill();

    // Subtle grid wireframe + stronger outer edges
    ctx.globalAlpha = alpha * 0.22;
    ctx.strokeStyle = q.stroke || q.color;
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.globalAlpha = alpha * 0.85;
    ctx.lineWidth = 2.2;
    for (let k = 0; k < 4; k++) {
      if (q.isEdge[k]) {
        const nk = (k + 1) % 4;
        ctx.beginPath();
        ctx.moveTo(q.proj[k].sx, q.proj[k].sy);
        ctx.lineTo(q.proj[nk].sx, q.proj[nk].sy);
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // Optional intersection line
  if (line) {
    const p1 = project([
      line.p0[0] - line.dir[0] * 2.4,
      line.p0[1] - line.dir[1] * 2.4,
      line.p0[2] - line.dir[2] * 2.4,
    ]);
    const p2 = project([
      line.p0[0] + line.dir[0] * 2.4,
      line.p0[1] + line.dir[1] * 2.4,
      line.p0[2] + line.dir[2] * 2.4,
    ]);
    ctx.strokeStyle = line.color || THEME.amber;
    ctx.lineWidth = 4.5;
    ctx.shadowColor = line.color || THEME.amber;
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(p1.sx, p1.sy);
    ctx.lineTo(p2.sx, p2.sy);
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  // Optional intersection point
  if (point) {
    const p = project(point.coords);
    ctx.save();
    ctx.fillStyle = point.color || THEME.coral;
    ctx.shadowColor = point.color || THEME.coral;
    ctx.shadowBlur = 16;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, 8.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 2;
    ctx.stroke();
    if (point.label) {
      ctx.font = `700 20px ${FONT_MONO}`;
      ctx.fillStyle = '#ffffff';
      ctx.fillText(point.label, p.sx + 14, p.sy - 12);
    }
    ctx.restore();
  }

  ctx.restore();
}
