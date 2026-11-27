// _Code/scenes/scene5_interpretation.js
import {
  THEME, FONT_SANS, FONT_MONO,
  easeOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawBadge, draw3DPlanesScene,
} from './math_draw.js';

export function renderScene5(ctx, t, timeline, studentCfg) {
  drawBackground(ctx, t, 'Interpretation & Echelon Outcomes', 5, timeline.totalDuration);

  const bUnique = beatSpan(timeline, 's5_unique');
  const bCases = beatSpan(timeline, 's5_cases');

  // Left Card: 3D Plane Intersection Visualization
  const p3D = easeOutCubic(seg(t, bUnique.start, bUnique.start + 1.8));
  drawCard(ctx, 90, 125, 820, 840, {
    alpha: p3D,
    fill: 'rgba(13, 21, 38, 0.92)',
    border: THEME.cyan,
    borderWidth: 2,
    radius: 24,
    glowColor: 'rgba(0, 229, 255, 0.12)',
  });

  ctx.save();
  ctx.globalAlpha = p3D;
  ctx.fillStyle = THEME.cyan;
  ctx.font = `700 28px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('3D Geometry: Three Intersecting Planes', 500, 178);
  ctx.restore();

  draw3DPlanesScene(ctx, {
    cx: 500,
    cy: 530,
    size: 115,
    yaw: 0.6 + (t - bUnique.start) * 0.18,
    pitch: 0.42,
    center: [2, -1, 3],
    planes: [
      { n: [1, -1, 2], d: 9, color: THEME.cyan },
      { n: [0, 2, 3], d: 7, color: THEME.amber },
      { n: [0, 0, 1], d: 3, color: THEME.emerald },
    ],
    point: { coords: [2, -1, 3], color: THEME.emerald, label: '(2, −1, 3)' },
    alpha: p3D,
  });

  drawBadge(ctx, 500, 900, '3 Pivots  ⟹  Unique Point (2, −1, 3)', THEME.emerald, p3D, 22, 26, 48);

  // Right Side: 3 Possible Echelon Outcomes
  const cases = [
    {
      title: '1. Unique Solution (Consistent)',
      cond: 'Pivot in every variable column',
      row: '[ 0  0  1 | 3 ]   ⟹   z = 3',
      geom: 'Planes meet at 1 unique point',
      color: THEME.emerald,
      start: bUnique.start + 1.0,
    },
    {
      title: '2. No Solution (Inconsistent)',
      cond: 'Zeros on left, nonzero constant on right',
      row: '[ 0  0  0 | 5 ]   ⟹   0 = 5  (Contradiction)',
      geom: 'Planes have no common intersection',
      color: THEME.coral,
      start: bCases.start + 6.0,
    },
    {
      title: '3. Infinitely Many Solutions',
      cond: 'Entire row vanishes (free variable)',
      row: '[ 0  0  0 | 0 ]   ⟹   0 = 0  (Free variable)',
      geom: 'Planes intersect along a line or plane',
      color: THEME.amber,
      start: bCases.start + 16.0,
    },
  ];

  cases.forEach((c, idx) => {
    const p = easeOutCubic(seg(t, c.start, c.start + 1.5));
    const y = 125 + idx * 290;
    drawCard(ctx, 960, y, 870, 260, {
      alpha: p,
      fill: 'rgba(13, 21, 38, 0.92)',
      border: c.color,
      borderWidth: 2,
      radius: 20,
    });

    ctx.save();
    ctx.globalAlpha = p;
    ctx.fillStyle = c.color;
    ctx.font = `800 28px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.fillText(c.title, 1000, y + 26);

    ctx.fillStyle = THEME.textDim;
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.fillText(c.cond, 1000, y + 72);

    ctx.fillStyle = THEME.text;
    ctx.font = `700 24px ${FONT_MONO}`;
    ctx.fillText(c.row, 1000, y + 124);

    ctx.fillStyle = c.color;
    ctx.font = `600 22px ${FONT_SANS}`;
    ctx.fillText(`Geometry: ${c.geom}`, 1000, y + 190);
    ctx.restore();
  });
}
