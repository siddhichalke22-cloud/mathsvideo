// scene5_interpretation.js
import {
  THEME,
  FONT_SANS,
  FONT_MONO,
  drawBackground,
  drawCard,
  roundRectPath,
} from './math_draw.js';

export function renderScene5(ctx, t, timeline, studentCfg) {
  drawBackground(ctx, t, 'Interpretation & Echelon Outcomes', 5, timeline.totalDuration);

  // Header card
  drawCard(ctx, 960 - 380, 70, 760, 80, {
    fill: 'rgba(13,21,38,0.92)',
    border: THEME.amber,
    borderWidth: 2,
    radius: 12,
    glowColor: 'rgba(251,113,133,0.16)',
  });
  ctx.save();
  ctx.fillStyle = THEME.amber;
  ctx.font = `800 32px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('What the solution tells us', 960, 120);
  ctx.restore();

  // Placeholder explanation
  const lines = [
    'The row‑echelon form shows that the three planes intersect at a',
    'single point (x, y, z) = (2, –1, 3). This means the system has a',
    'unique solution – geometrically the three planes meet at one',
    'exact location in space.',
  ];
  ctx.fillStyle = THEME.text;
  ctx.font = `600 22px ${FONT_MONO}`;
  ctx.textAlign = 'center';
  lines.forEach((l, i) => {
    ctx.fillText(l, 960, 200 + i * 30);
  });
}
