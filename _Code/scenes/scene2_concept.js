import {
  THEME, FONT_SANS, FONT_MONO,
  clamp01, easeOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawMatrix, drawArrow,
} from './math_draw.js';

export function renderScene2(ctx, t, timeline) {
  drawBackground(ctx, t, 'Concept Introduction: Notation, Operations & Echelon Form', 2, timeline.totalDuration);

  const bObj = beatSpan(timeline, 's2_objective');
  const bAug = beatSpan(timeline, 's2_augmented');
  const bOps = beatSpan(timeline, 's2_ops');
  const bRef = beatSpan(timeline, 's2_ref');

  // Phase 1 (Objective banner top)
  const pObj = easeOutCubic(seg(t, bObj.start, bObj.start + 1.0));
  drawCard(ctx, 90, 108, 1740, 118, {
    alpha: pObj,
    border: THEME.cyan,
    fill: 'rgba(14, 30, 52, 0.92)',
  });
  ctx.save();
  ctx.globalAlpha = pObj;
  ctx.fillStyle = THEME.cyan;
  ctx.font = `700 18px ${FONT_MONO}`;
  ctx.textAlign = 'left';
  ctx.fillText('LEARNING OBJECTIVE', 124, 140);
  ctx.fillStyle = THEME.text;
  ctx.font = `600 25px ${FONT_SANS}`;
  ctx.fillText(
    'Understand why elementary row operations preserve solutions, build Row Echelon Form, and solve by back-substitution.',
    124,
    182
  );
  ctx.restore();

  // Phase 2: Ax = b -> [A | b]
  const pAug = easeOutCubic(seg(t, bAug.start, bAug.start + 1.2));
  if (pAug > 0) {
    drawCard(ctx, 90, 256, 840, 355, {
      alpha: pAug,
      border: 'rgba(56, 189, 248, 0.45)',
    });
    ctx.save();
    ctx.globalAlpha = pAug;
    ctx.fillStyle = THEME.cyan;
    ctx.font = `700 26px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('From Ax = b to Augmented Matrix [A | b]', 510, 302);
    ctx.restore();

    // Show Ax = b on left, arrow, [A|b] on right
    ctx.save();
    ctx.globalAlpha = pAug;
    ctx.fillStyle = THEME.text;
    ctx.font = `700 36px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.fillText('Ax = b', 215, 445);
    ctx.fillStyle = THEME.textDim;
    ctx.font = `500 20px ${FONT_SANS}`;
    ctx.fillText('A: coefficients', 215, 505);
    ctx.fillText('b: constants', 215, 536);
    ctx.restore();

    const arrP = easeOutCubic(seg(t, bAug.start + 2.2, bAug.start + 3.8));
    drawArrow(ctx, 305, 445, 395, 445, THEME.cyan, arrP, 4);

    if (arrP > 0.1) {
      drawMatrix(ctx, {
        cx: 650,
        cy: 455,
        rows: [
          ['a₁₁', 'a₁₂', 'a₁₃', 'b₁'],
          ['a₂₁', 'a₂₂', 'a₂₃', 'b₂'],
          ['a₃₁', 'a₃₂', 'a₃₃', 'b₃'],
        ],
        colWidths: [82, 82, 82, 74],
        rowHeight: 62,
        fontSize: 27,
        colHeaders: ['x', 'y', 'z', 'b'],
        alpha: clamp01((arrP - 0.1) / 0.9),
      });
    }
  }

  // Phase 3: Three Elementary Row Operations (Right Side)
  const pOps = easeOutCubic(seg(t, bOps.start, bOps.start + 1.0));
  if (pOps > 0) {
    drawCard(ctx, 965, 256, 865, 355, {
      alpha: pOps,
      border: 'rgba(251, 191, 36, 0.45)',
    });
    ctx.save();
    ctx.globalAlpha = pOps;
    ctx.fillStyle = THEME.amber;
    ctx.font = `700 26px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('The 3 Elementary Row Operations', 1397, 302);
    ctx.restore();

    const ops = [
      {
        num: '1. Row Swap',
        sym: 'Rᵢ ↔ Rⱼ',
        desc: 'Exchange any two rows',
        col: THEME.cyan,
        at: bOps.start + 3.5,
      },
      {
        num: '2. Row Scaling',
        sym: 'Rᵢ ← c·Rᵢ (c ≠ 0)',
        desc: 'Multiply a row by a nonzero scalar',
        col: THEME.violet,
        at: bOps.start + 7.5,
      },
      {
        num: '3. Row Replacement',
        sym: 'Rᵢ ← Rᵢ + k·Rⱼ',
        desc: 'Add a multiple of one row to another',
        col: THEME.emerald,
        at: bOps.start + 12.0,
      },
    ];

    ops.forEach((op, idx) => {
      const opP = easeOutCubic(seg(t, op.at, op.at + 1.2));
      if (opP <= 0) return;
      const oy = 358 + idx * 82;
      drawCard(ctx, 995, oy, 805, 68, {
        alpha: opP,
        fill: 'rgba(30, 41, 59, 0.9)',
        border: op.col,
        borderWidth: 2,
        radius: 12,
      });
      ctx.save();
      ctx.globalAlpha = opP;
      ctx.fillStyle = op.col;
      ctx.font = `700 22px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText(op.num, 1020, oy + 34);

      ctx.fillStyle = THEME.text;
      ctx.font = `700 22px ${FONT_MONO}`;
      ctx.fillText(op.sym, 1265, oy + 34);

      ctx.fillStyle = THEME.textDim;
      ctx.font = `500 18px ${FONT_SANS}`;
      ctx.textAlign = 'right';
      ctx.fillText(op.desc, 1775, oy + 34);
      ctx.restore();
    });
  }

  // Phase 4: Row Echelon Form (REF) Definition Card (Bottom)
  const pRef = easeOutCubic(seg(t, bRef.start, bRef.start + 1.2));
  if (pRef > 0) {
    drawCard(ctx, 90, 642, 1740, 360, {
      alpha: pRef,
      border: 'rgba(52, 211, 153, 0.55)',
      glowColor: 'rgba(52, 211, 153, 0.14)',
    });
    ctx.save();
    ctx.globalAlpha = pRef;
    ctx.fillStyle = THEME.emerald;
    ctx.font = `700 28px ${FONT_SANS}`;
    ctx.textAlign = 'left';
    ctx.fillText('Target: Row Echelon Form (REF)', 135, 694);

    const rules = [
      '• Pivot: first nonzero entry in each nonzero row (highlighted in gold/green).',
      '• Staircase rule: each pivot lies strictly to the right of the pivot above it.',
      '• Zero property: every entry directly below a pivot must be 0.',
      '• Any all-zero rows sit at the very bottom of the matrix.',
    ];
    ctx.fillStyle = THEME.text;
    ctx.font = `500 24px ${FONT_SANS}`;
    rules.forEach((r, i) => {
      const rp = easeOutCubic(seg(t, bRef.start + 1.0 + i * 1.4, bRef.start + 2.0 + i * 1.4));
      ctx.globalAlpha = pRef * (0.25 + 0.75 * rp);
      ctx.fillText(r, 145, 756 + i * 54);
    });
    ctx.restore();

    drawMatrix(ctx, {
      cx: 1490,
      cy: 830,
      rows: [
        ['■', '*', '*', '*'],
        [0, '■', '*', '*'],
        [0, 0, '■', '*'],
      ],
      colWidths: [72, 72, 72, 72],
      rowHeight: 68,
      fontSize: 32,
      pivots: [
        { r: 0, c: 0, color: THEME.emerald, pulse: t * 2 },
        { r: 1, c: 1, color: THEME.emerald, pulse: t * 2 },
        { r: 2, c: 2, color: THEME.emerald, pulse: t * 2 },
      ],
      echelonProgress: easeOutCubic(seg(t, bRef.start + 1.8, bRef.start + 5.0)),
      alpha: pRef,
    });
  }
}
