// scene4_example.js
import {
  THEME,
  FONT_SANS,
  FONT_MONO,
  drawBackground,
  drawCard,
  drawMatrix,
  drawArrow,
  roundRectPath,
} from './math_draw.js';

export function renderScene4(ctx, t, timeline, studentCfg) {
  // Background (dark slate)
  drawBackground(ctx, t, 'Worked 3×3 Example', 4, timeline.totalDuration);

  // Title card at the top
  const title = 'Worked 3×3 Example';
  drawCard(ctx, 960 - 400, 80, 800, 100, {
    fill: 'rgba(13,21,38,0.92)',
    border: THEME.emerald,
    borderWidth: 2,
    radius: 12,
    glowColor: 'rgba(52,211,153,0.16)',
  });
  ctx.save();
  ctx.fillStyle = THEME.emerald;
  ctx.font = `800 36px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText(title, 960, 140);
  ctx.restore();

  // Simple placeholder matrix (you can replace with the real drawing later)
  drawMatrix(ctx, {
    cx: 960,
    cy: 540,
    rows: [
      [2, -1, 1, 7],
      [1, 2, -3, 4],
      [-2, 1, 5, -1],
    ],
    colHeaders: ['x', 'y', 'z', 'b'],
    pivots: [],
    alpha: 1,
  });
}
