import {
  THEME, FONT_SANS, FONT_MONO,
  clamp01, lerp, easeOutCubic, easeInOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawMatrix, draw2DPlane, draw3DPlanesScene, drawBadge,
} from './math_draw.js';

export function renderScene3(ctx, t, timeline) {
  drawBackground(ctx, t, 'Visual Intuition: Why Row Operations Preserve Solutions', 3, timeline.totalDuration);

  const bSetup = beatSpan(timeline, 's3_2d_setup');
  const bSwapScale = beatSpan(timeline, 's3_2d_swap_scale');
  const bReplace = beatSpan(timeline, 's3_2d_replace');
  const bWhy = beatSpan(timeline, 's3_2d_why');
  const b3d = beatSpan(timeline, 's3_3d_planes');

  const in3D = t >= b3d.start - 0.3;
  const p3d = easeOutCubic(seg(t, b3d.start, b3d.start + 1.5));
  const fade2D = in3D ? 1 - p3d : 1;

  // PART A: 2D Intuition (Left Plot + Right Matrix & Explanation)
  if (fade2D > 0.01) {
    ctx.save();
    ctx.globalAlpha = fade2D;

    // Determine row replacement interpolation k: 0 -> -2
    const kP = easeInOutCubic(seg(t, bReplace.start + 2.5, bReplace.start + 8.0));
    const k = lerp(0, -2, kP);
    // L2' = L2 + k * L1 => (2 + k)x + (-1 + k)y = 1 + 5k
    const a2 = 2 + k;
    const b2 = -1 + k;
    const c2 = 1 + 5 * k;

    // Swap visual pulse during first half of s3_2d_swap_scale
    const swapPulse = seg(t, bSwapScale.start + 1.0, bSwapScale.start + 4.0);
    const scalePulse = seg(t, bSwapScale.start + 6.5, bSwapScale.start + 12.0);

    const lines = [
      {
        a: 1, b: 1, c: 5,
        color: THEME.cyan,
        width: scalePulse > 0 && scalePulse < 1 ? 6 : 4,
        label: scalePulse > 0.25 && scalePulse < 0.95 ? '2x + 2y = 10 (same line!)' : 'L₁: x + y = 5',
        labelPos: [-0.2, 5.2],
      },
    ];

    if (kP > 0.02) {
      // Ghost original L2
      lines.push({
        a: 2, b: -1, c: 1,
        color: 'rgba(251, 191, 36, 0.35)',
        width: 2.5,
        dash: [8, 6],
      });
    }

    lines.push({
      a: a2, b: b2, c: c2,
      color: kP > 0.95 ? THEME.emerald : THEME.amber,
      width: 4.5,
      label: kP > 0.95 ? 'L₂′: −3y = −9  (y = 3)' : (kP > 0.05 ? 'Pivoting L₂ + kL₁...' : 'L₂: 2x − y = 1'),
      labelPos: kP > 0.95 ? [4.3, 3.55] : [3.2, 4.7],
    });

    draw2DPlane(ctx, {
      cx: 530,
      cy: 550,
      w: 880,
      h: 810,
      scale: 88,
      originOffset: [2.0, 2.5],
      lines,
      point: {
        x: 2, y: 3,
        label: '(2, 3)',
        color: THEME.coral,
        pulse: t * 4,
      },
      alpha: easeOutCubic(seg(t, bSetup.start, bSetup.start + 1.2)),
    });

    // Right panel: synchronized augmented matrix & geometric reasoning
    drawCard(ctx, 1015, 145, 835, 810, {
      border: 'rgba(56, 189, 248, 0.45)',
    });

    ctx.fillStyle = THEME.text;
    ctx.font = `700 30px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('2D Geometric Meaning of Row Operations', 1432, 205);

    const fmtNum = (n) => (Math.abs(n - Math.round(n)) < 0.03 ? String(Math.round(n)) : n.toFixed(1));
    const scaleFactor = scalePulse > 0.25 && scalePulse < 0.95 ? 2 : 1;
    const matRows = [
      [1 * scaleFactor, 1 * scaleFactor, 5 * scaleFactor],
      [fmtNum(a2), fmtNum(b2), fmtNum(c2)],
    ];

    drawMatrix(ctx, {
      cx: 1432,
      cy: 345,
      rows: matRows,
      colWidths: [110, 110, 110],
      rowHeight: 78,
      augCol: 2,
      colHeaders: ['x', 'y', 'b'],
      rowHighlights: kP > 0.05 ? [{ r: 1, color: kP > 0.95 ? THEME.emerald : THEME.amber, alpha: 0.22 }] : [],
    });

    // Operation status badge
    if (swapPulse > 0 && swapPulse < 1) {
      drawBadge(ctx, 1432, 480, 'Swap R₁ ↔ R₂ : labels swap, lines fixed!', THEME.cyan, 1, 22);
    } else if (scalePulse > 0 && scalePulse < 1) {
      drawBadge(ctx, 1432, 480, 'Scale 2·R₁ : 2x + 2y = 10 is the EXACT same line!', THEME.violet, 1, 22);
    } else if (kP > 0.02) {
      const col = kP > 0.95 ? THEME.emerald : THEME.amber;
      const txt = kP > 0.95 ? 'R₂ ← R₂ − 2R₁  ⇒  −3y = −9  (Horizontal!)' : `R₂ ← R₂ + (${fmtNum(k)})R₁`;
      drawBadge(ctx, 1432, 480, txt, col, 1, 23);
    } else {
      drawBadge(ctx, 1432, 480, 'Intersection Point: (x, y) = (2, 3)', THEME.coral, 1, 22);
    }

    // Explanation box ("Why does it stay pinned?")
    const whyP = easeOutCubic(seg(t, bWhy.start, bWhy.start + 1.2));
    drawCard(ctx, 1055, 540, 755, 375, {
      fill: 'rgba(30, 41, 59, 0.88)',
      border: whyP > 0 ? THEME.emerald : THEME.border,
      radius: 16,
    });

    ctx.textAlign = 'left';
    ctx.fillStyle = THEME.amber;
    ctx.font = `700 24px ${FONT_SANS}`;
    ctx.fillText('Key Insight:', 1090, 588);

    const bullets = [
      { txt: '1. Swapping rows only reorders equations.', show: true },
      { txt: '2. Scaling by c ≠ 0 keeps every point on the line.', show: t >= bSwapScale.start + 5.0 },
      { txt: '3. Replacement pivots the line around (2, 3):', show: t >= bReplace.start },
      { txt: '    At (2, 3):  L₁ = 0  and  L₂ = 0', show: whyP > 0.1, mono: true, col: THEME.cyan },
      { txt: '    ⇒  (L₂ + k·L₁) = 0 + k(0) = 0  ALWAYS!', show: whyP > 0.4, mono: true, col: THEME.emerald },
    ];
    bullets.forEach((b, i) => {
      if (!b.show) return;
      ctx.fillStyle = b.col || THEME.text;
      ctx.font = b.mono ? `700 23px ${FONT_MONO}` : `500 23px ${FONT_SANS}`;
      ctx.fillText(b.txt, 1090, 646 + i * 52);
    });

    ctx.restore();
  }

  // PART B: 3D Planes Transition
  if (in3D) {
    ctx.save();
    ctx.globalAlpha = p3d;

    // Left: 3D Planes scene
    drawCard(ctx, 80, 130, 960, 840, {
      border: 'rgba(56, 189, 248, 0.5)',
    });
    ctx.fillStyle = THEME.cyan;
    ctx.font = `700 28px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('In ℝ³: Each Linear Equation is a Plane', 560, 185);

    // Morph plane 3 smoothly toward horizontal plane z = 3 during 3D beat!
    const morph3D = easeInOutCubic(seg(t, b3d.start + 3.0, b3d.start + 9.0));
    // Original Eq3: 2x + 4y - z = -3  =>  morphs to  0x + 0y + 1z = 3
    // At (2, -1, 3): 2(2)+4(-1)-3 = -3; and 0(2)+0(-1)+3 = 3!
    const n3 = [lerp(2, 0, morph3D), lerp(4, 0, morph3D), lerp(-1, 1, morph3D)];
    const d3 = lerp(-3, 3, morph3D);

    draw3DPlanesScene(ctx, {
      cx: 560,
      cy: 565,
      size: 135,
      yaw: 0.55 + (t - b3d.start) * 0.22,
      pitch: 0.44,
      center: [2, -1, 3],
      planes: [
        { n: [1, -1, 2], d: 9, color: THEME.cyan, stroke: THEME.cyan, alpha: 0.26 },
        { n: [0, 2, 3], d: 7, color: THEME.amber, stroke: THEME.amber, alpha: 0.26 },
        { n: n3, d: d3, color: morph3D > 0.8 ? THEME.emerald : THEME.coral, stroke: morph3D > 0.8 ? THEME.emerald : THEME.coral, alpha: 0.30 },
      ],
      point: { coords: [2, -1, 3], label: '(2, -1, 3)', color: THEME.coral },
    });

    // Right: Explanation card for 3D
    drawCard(ctx, 1080, 130, 760, 840, {
      border: 'rgba(52, 211, 153, 0.5)',
    });
    ctx.fillStyle = THEME.emerald;
    ctx.font = `700 30px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('From Tilted Planes to Axis-Aligned Solution', 1460, 200);

    const cards3D = [
      { title: 'Plane 1 (Cyan)', eq: 'x − y + 2z = 9', col: THEME.cyan },
      { title: 'Plane 2 (Amber)', eq: '2y + 3z = 7', col: THEME.amber },
      {
        title: morph3D > 0.8 ? 'Plane 3 After Elimination (Green)' : 'Plane 3 (Coral)',
        eq: morph3D > 0.8 ? 'z = 3   (Horizontal Plane!)' : '2x + 4y − z = −3',
        col: morph3D > 0.8 ? THEME.emerald : THEME.coral,
      },
    ];
    cards3D.forEach((c, i) => {
      const cy = 280 + i * 145;
      drawCard(ctx, 1130, cy, 660, 112, {
        fill: 'rgba(30, 41, 59, 0.88)',
        border: c.col,
        radius: 14,
      });
      ctx.fillStyle = c.col;
      ctx.font = `700 21px ${FONT_SANS}`;
      ctx.textAlign = 'left';
      ctx.fillText(c.title, 1165, cy + 36);
      ctx.fillStyle = THEME.text;
      ctx.font = `700 30px ${FONT_MONO}`;
      ctx.fillText(c.eq, 1165, cy + 80);
    });

    ctx.fillStyle = THEME.text;
    ctx.font = `600 24px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('Row operations pivot planes around their shared intersection', 1460, 780);
    ctx.fillStyle = THEME.emerald;
    ctx.fillText('until z = 3 appears directly!', 1460, 822);

    ctx.restore();
  }
}
