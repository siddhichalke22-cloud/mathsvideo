// scene6_summary.js
import {
  THEME,
  FONT_SANS,
  FONT_MONO,
  drawBackground,
  drawCard,
  roundRectPath,
} from './math_draw.js';

export function renderScene6(ctx, t, timeline, studentCfg) {
  drawBackground(ctx, t, 'Summary & Credits', 6, timeline.totalDuration);

  // Main summary card
  drawCard(ctx, 960 - 420, 80, 840, 600, {
    fill: 'rgba(13,21,38,0.94)',
    border: THEME.cyan,
    borderWidth: 2,
    radius: 14,
    glowColor: 'rgba(56,189,248,0.12)',
  });
  ctx.save();

  // Title "Take‑aways"
  ctx.fillStyle = THEME.cyan;
  ctx.font = `800 38px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('Take‑aways', 960, 150);

  // Bullet points
  const points = [
    'Gaussian elimination turns any linear system into a clean staircase.',
    'Elementary row operations preserve the solution set.',
    'Back‑substitution reads the solution directly from the staircase.',
  ];
  ctx.fillStyle = THEME.text;
  ctx.font = `600 24px ${FONT_MONO}`;
  points.forEach((p, i) => {
    ctx.fillText(`• ${p}`, 960, 210 + i * 40);
  });

  // Credits at the bottom
  ctx.fillStyle = THEME.textDim;
  ctx.font = `500 20px ${FONT_MONO}`;
  ctx.fillText(`Created by: ${studentCfg.studentName}`, 960, 440);
  ctx.fillText(`Student ID: ${studentCfg.studentId}`, 960, 470);
  ctx.fillText('Voice: macOS “say” (Daniel) – background music credited in CREDITS.md', 960, 500);
  ctx.restore();
}
