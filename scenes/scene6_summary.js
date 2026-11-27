// _Code/scenes/scene6_summary.js
import {
  THEME, FONT_SANS, FONT_MONO,
  easeOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawBadge,
} from './math_draw.js';

export function renderScene6(ctx, t, timeline, studentCfg) {
  drawBackground(ctx, t, 'Summary & Credits', 6, timeline.totalDuration);

  const bTake = beatSpan(timeline, 's6_takeaways');
  const bCred = beatSpan(timeline, 's6_credits');

  const takeaways = [
    {
      num: '01',
      title: 'Row Operations Preserve Solutions',
      desc: 'Swapping, scaling (nonzero), and row replacement never alter the solution set.',
      color: THEME.cyan,
      start: bTake.start + 1.5,
    },
    {
      num: '02',
      title: 'Build the Row Echelon Staircase',
      desc: 'Clear entries below each pivot from top-left to bottom-right.',
      color: THEME.amber,
      start: bTake.start + 8.5,
    },
    {
      num: '03',
      title: 'Back-Substitution & Pivot Structure',
      desc: 'Solve bottom-up and classify unique, zero, or infinitely many solutions.',
      color: THEME.emerald,
      start: bTake.start + 16.0,
    },
  ];

  // Left: Core Takeaways
  takeaways.forEach((item, idx) => {
    const p = easeOutCubic(seg(t, item.start, item.start + 1.4));
    const y = 135 + idx * 255;
    drawCard(ctx, 100, y, 980, 225, {
      alpha: p,
      fill: 'rgba(13, 21, 38, 0.92)',
      border: item.color,
      borderWidth: 2,
      radius: 20,
    });

    ctx.save();
    ctx.globalAlpha = p;
    drawBadge(ctx, 175, y + 60, item.num, item.color, p, 24, 18, 48);

    ctx.fillStyle = item.color;
    ctx.font = `800 30px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(item.title, 240, y + 60);

    ctx.fillStyle = THEME.text;
    ctx.font = `500 24px ${FONT_SANS}`;
    ctx.fillText(item.desc, 140, y + 145);
    ctx.restore();
  });

  // Right: Presentation Credits & Verification
  const pCred = easeOutCubic(seg(t, bCred.start - 2.0, bCred.start + 1.5));
  drawCard(ctx, 1130, 135, 690, 735, {
    alpha: pCred,
    fill: 'rgba(13, 21, 38, 0.94)',
    border: THEME.cyan,
    borderWidth: 2,
    radius: 24,
    glowColor: 'rgba(0, 229, 255, 0.14)',
  });

  ctx.save();
  ctx.globalAlpha = pCred;
  ctx.fillStyle = THEME.cyan;
  ctx.font = `800 34px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('Credits', 1475, 225);

  const info = [
    ['Topic', studentCfg.title],
    ['Course', studentCfg.course],
    ['Presented By', studentCfg.studentName],
    ['Student ID', studentCfg.studentId],
  ];

  info.forEach(([k, v], i) => {
    const yy = 310 + i * 115;
    ctx.fillStyle = THEME.textDim;
    ctx.font = `700 18px ${FONT_MONO}`;
    ctx.textAlign = 'left';
    ctx.fillText(k.toUpperCase(), 1180, yy);

    ctx.fillStyle = THEME.text;
    ctx.font = `600 24px ${FONT_SANS}`;
    ctx.fillText(String(v), 1180, yy + 32);
  });
  ctx.restore();
}
