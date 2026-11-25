// _Code/scenes/scene4_example.js
import {
  THEME, FONT_SANS, FONT_MONO,
  clamp01, lerp, easeOutCubic, easeInOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawBadge, drawMatrix, drawSwapArc, drawArrow, roundRectPath,
} from './math_draw.js';

export function renderScene4(ctx, t, timeline, studentCfg) {
  drawBackground(ctx, t, 'Worked 3×3 Example: Step-by-Step Elimination', 4, timeline.totalDuration);

  const bSetup = beatSpan(timeline, 's4_setup');
  const bSwap = beatSpan(timeline, 's4_swap');
  const bElim1 = beatSpan(timeline, 's4_elim1');
  const bElim2 = beatSpan(timeline, 's4_elim2');
  const bScale = beatSpan(timeline, 's4_scale');
  const bBack = beatSpan(timeline, 's4_backsub');
  const bVerify = beatSpan(timeline, 's4_verify');

  // Determine current matrix state and visual highlights based on time
  let rows = [
    [0, 2, 3, 7],
    [1, -1, 2, 9],
    [2, 4, -1, -3],
  ];
  let pivots = [];
  let rowHighlights = [];
  let cellHighlights = [];
  let rowOffsets = [0, 0, 0];
  let echelonProgress = 0;
  let opBadge = 'Augmented Matrix [A | b]';
  let opColor = THEME.cyan;
  let stepNotes = [
    'System of 3 equations:',
    '  2y + 3z = 7',
    '  x − y + 2z = 9',
    '  2x + 4y − z = −3',
  ];

  if (t < bSwap.start) {
    // Setup
    const p = easeOutCubic(seg(t, bSetup.start, bSetup.start + 2.0));
    cellHighlights = [{ r: 0, c: 0, color: THEME.coral, alpha: 0.35 * seg(t, bSetup.start + 5, bSetup.end) }];
    opBadge = 'Step 0: Write Augmented Matrix [A | b]';
    opColor = THEME.cyan;
  } else if (t < bElim1.start) {
    // Row swap R1 <-> R2
    const pSwap = easeInOutCubic(seg(t, bSwap.start + 1.5, bSwap.start + 5.0));
    const rh = 78;
    if (pSwap < 1) {
      rowOffsets = [pSwap * rh, -pSwap * rh, 0];
      cellHighlights = [{ r: 0, c: 0, color: THEME.coral, alpha: 0.35 * (1 - pSwap) }];
    } else {
      rows = [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [2, 4, -1, -3],
      ];
      pivots = [{ r: 0, c: 0, color: THEME.amber, pulse: 0.5 }];
    }
    opBadge = 'Step 1: R₁ ↔ R₂  (Avoid Zero Pivot)';
    opColor = THEME.amber;
    stepNotes = [
      'Entry (1,1) is 0 — cannot be a pivot.',
      'Swap Row 1 and Row 2:',
      '  New R₁: [ 1  −1   2 |  9 ]',
      '  New R₂: [ 0   2   3 |  7 ]',
      'Row 2 already has 0 in column 1!',
    ];
  } else if (t < bElim2.start) {
    // Eliminate R3, col 1: R3 -> R3 - 2*R1
    const pDone = seg(t, bElim1.start + 4.5, bElim1.start + 9.0);
    rows = pDone < 0.5
      ? [[1, -1, 2, 9], [0, 2, 3, 7], [2, 4, -1, -3]]
      : [[1, -1, 2, 9], [0, 2, 3, 7], [0, 6, -5, -21]];
    pivots = [{ r: 0, c: 0, color: THEME.amber, pulse: 0.4 }];
    rowHighlights = [
      { r: 0, color: THEME.amber, alpha: 0.14 },
      { r: 2, color: THEME.cyan, alpha: 0.2 },
    ];
    if (pDone >= 0.5) {
      cellHighlights = [{ r: 2, c: 0, color: THEME.emerald, alpha: 0.35 }];
    }
    opBadge = 'Step 2: R₃ → R₃ − 2·R₁';
    opColor = THEME.cyan;
    stepNotes = [
      'Clear entry (3,1) below pivot 1:',
      '  2 − 2(1)   = 0',
      '  4 − 2(−1)  = 6',
      ' −1 − 2(2)   = −5',
      ' −3 − 2(9)   = −21',
    ];
  } else if (t < bScale.start) {
    // Eliminate R3, col 2: R3 -> R3 - 3*R2
    const pDone = seg(t, bElim2.start + 4.5, bElim2.start + 9.0);
    rows = pDone < 0.5
      ? [[1, -1, 2, 9], [0, 2, 3, 7], [0, 6, -5, -21]]
      : [[1, -1, 2, 9], [0, 2, 3, 7], [0, 0, -14, -42]];
    pivots = [
      { r: 0, c: 0, color: THEME.amber, pulse: 0.2 },
      { r: 1, c: 1, color: THEME.amber, pulse: 0.5 },
    ];
    rowHighlights = [
      { r: 1, color: THEME.amber, alpha: 0.14 },
      { r: 2, color: THEME.cyan, alpha: 0.2 },
    ];
    if (pDone >= 0.5) {
      cellHighlights = [{ r: 2, c: 1, color: THEME.emerald, alpha: 0.35 }];
    }
    opBadge = 'Step 3: R₃ → R₃ − 3·R₂';
    opColor = THEME.cyan;
    stepNotes = [
      'Pivot 2 is entry (2,2) = 2.',
      'Clear entry (3,2) = 6:',
      '   6 − 3(2)  = 0',
      '  −5 − 3(3)  = −14',
      ' −21 − 3(7)  = −42',
    ];
  } else if (t < bBack.start) {
    // Scale R3 by -1/14
    const pDone = seg(t, bScale.start + 3.5, bScale.start + 7.0);
    rows = pDone < 0.5
      ? [[1, -1, 2, 9], [0, 2, 3, 7], [0, 0, -14, -42]]
      : [[1, -1, 2, 9], [0, 2, 3, 7], [0, 0, 1, 3]];
    pivots = [
      { r: 0, c: 0, color: THEME.amber, pulse: 0.2 },
      { r: 1, c: 1, color: THEME.amber, pulse: 0.2 },
      { r: 2, c: 2, color: THEME.emerald, pulse: 0.7 },
    ];
    rowHighlights = [{ r: 2, color: THEME.emerald, alpha: 0.18 }];
    echelonProgress = easeOutCubic(seg(t, bScale.start, bScale.start + 2.5));
    opBadge = 'Step 4: R₃ → (−1/14)·R₃  (Row Echelon Form)';
    opColor = THEME.emerald;
    stepNotes = [
      'Upper triangular staircase achieved!',
      'Scale Row 3 by −1/14:',
      '  −14z = −42  ⟹  z = 3',
      'All zeros below every pivot:',
      '  Pivots: 1, 2, 1',
    ];
  } else if (t < bVerify.start) {
    // Back-substitution
    rows = [
      [1, -1, 2, 9],
      [0, 2, 3, 7],
      [0, 0, 1, 3],
    ];
    pivots = [
      { r: 0, c: 0, color: THEME.emerald, pulse: 0.3 },
      { r: 1, c: 1, color: THEME.emerald, pulse: 0.3 },
      { r: 2, c: 2, color: THEME.emerald, pulse: 0.3 },
    ];
    echelonProgress = 1;
    opBadge = 'Step 5: Back-Substitution (Bottom → Top)';
    opColor = THEME.emerald;
    const pZ = seg(t, bBack.start + 1.0, bBack.start + 3.0);
    const pY = seg(t, bBack.start + 5.0, bBack.start + 8.0);
    const pX = seg(t, bBack.start + 10.0, bBack.start + 14.0);
    stepNotes = [];
    if (pZ > 0) stepNotes.push('From Row 3:  z = 3');
    if (pY > 0) stepNotes.push('From Row 2:  2y + 3(3) = 7  ⟹  2y = −2  ⟹  y = −1');
    if (pX > 0) stepNotes.push('From Row 1:  x − (−1) + 2(3) = 9  ⟹  x = 2');
    if (pX >= 1) stepNotes.push('Solution:  (x, y, z) = (2, −1, 3)');
  } else {
    // Verification
    rows = [
      [1, -1, 2, 9],
      [0, 2, 3, 7],
      [0, 0, 1, 3],
    ];
    pivots = [
      { r: 0, c: 0, color: THEME.emerald, pulse: 0.4 },
      { r: 1, c: 1, color: THEME.emerald, pulse: 0.4 },
      { r: 2, c: 2, color: THEME.emerald, pulse: 0.4 },
    ];
    echelonProgress = 1;
    opBadge = 'Step 6: Verify in Original Equations ✓';
    opColor = THEME.emerald;
    stepNotes = [
      'Check (x, y, z) = (2, −1, 3):',
      '  Eq 1:  2(−1) + 3(3) = −2 + 9 = 7  ✓',
      '  Eq 2:  2 − (−1) + 2(3) = 3 + 6 = 9  ✓',
      '  Eq 3:  2(2) + 4(−1) − 3 = 4 − 4 − 3 = −3  ✓',
    ];
  }

  // Operation badge at top
  drawBadge(ctx, 960, 138, opBadge, opColor, 1, 25, 32, 54);

  // Left card: Augmented Matrix
  drawCard(ctx, 110, 200, 820, 620, {
    fill: 'rgba(13, 21, 38, 0.92)',
    border: opColor,
    borderWidth: 2,
    radius: 22,
    glowColor: 'rgba(0, 229, 255, 0.12)',
  });

  drawMatrix(ctx, {
    cx: 520,
    cy: 515,
    rows,
    colWidths: [110, 110, 110, 120],
    rowHeight: 78,
    augCol: 3,
    fontSize: 38,
    pivots,
    rowHighlights,
    cellHighlights,
    rowOffsets,
    echelonProgress,
    colHeaders: ['x', 'y', 'z', 'b'],
    title: 'Augmented Matrix',
  });

  if (t >= bSwap.start && t < bElim1.start) {
    const pArc = easeInOutCubic(seg(t, bSwap.start + 0.8, bSwap.start + 5.2));
    drawSwapArc(ctx, 795, 515 - 78, 515, pArc, 'R₁ ↔ R₂', THEME.amber);
  }

  // Right card: Step-by-Step Algebra & Verification
  drawCard(ctx, 980, 200, 830, 620, {
    fill: 'rgba(13, 21, 38, 0.92)',
    border: THEME.border,
    borderWidth: 2,
    radius: 22,
  });

  ctx.save();
  ctx.fillStyle = THEME.cyan;
  ctx.font = `700 28px ${FONT_SANS}`;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('Algebraic Derivation', 1030, 240);

  ctx.font = `600 26px ${FONT_MONO}`;
  stepNotes.forEach((line, idx) => {
    const isHighlight = line.includes('✓') || line.includes('Solution:');
    ctx.fillStyle = isHighlight ? THEME.emerald : THEME.text;
    ctx.fillText(line, 1030, 315 + idx * 66);
  });
  ctx.restore();

  // Bottom solution banner during back-substitution & verification
  if (t >= bBack.start + 12.0) {
    const pSol = easeOutCubic(seg(t, bBack.start + 12.0, bBack.start + 13.5));
    drawCard(ctx, 460, 865, 1000, 95, {
      alpha: pSol,
      fill: 'rgba(16, 185, 129, 0.14)',
      border: THEME.emerald,
      borderWidth: 2.5,
      radius: 18,
      glowColor: 'rgba(52, 211, 153, 0.22)',
    });
    ctx.save();
    ctx.globalAlpha = pSol;
    ctx.fillStyle = THEME.emerald;
    ctx.font = `800 34px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('Unique Solution:  (x, y, z) = (2, −1, 3)', 960, 912);
    ctx.restore();
  }
}
