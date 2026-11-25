import {
  THEME, FONT_SANS, FONT_MONO,
  clamp01, lerp, easeOutCubic, easeInOutCubic, seg, beatSpan,
  drawBackground, drawCard, drawMatrix, drawArrow, roundRectPath,
} from './math_draw.js';

export function renderScene1(ctx, t, timeline, studentCfg) {
  const openingHold = timeline.openingHold || 4.5;
  const s1_intro = beatSpan(timeline, 's1_intro');
  const s1_question = beatSpan(timeline, 's1_question');
  const s1_bridge = beatSpan(timeline, 's1_bridge');

  // Opening Frame (0 .. openingHold + crossfade)
  if (t < openingHold + 0.6) {
    drawBackground(ctx, t, null, 1, timeline.totalDuration);
    const fadeOut = t > openingHold ? 1 - easeInOutCubic(seg(t, openingHold, openingHold + 0.6)) : 1;
    const enter = easeOutCubic(seg(t, 0, 1.0));

    ctx.save();
    ctx.globalAlpha = fadeOut;

    // Animated decorative subtle matrix grid behind title
    const cardW = 1320, cardH = 660;
    drawCard(ctx, 960 - cardW / 2, 540 - cardH / 2 + (1 - enter) * 24, cardW, cardH, {
      fill: 'rgba(13, 21, 38, 0.92)',
      border: 'rgba(56, 189, 248, 0.45)',
      borderWidth: 2,
      radius: 28,
      glowColor: 'rgba(56, 189, 248, 0.16)',
    });

    // Course pill
    ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
    roundRectPath(ctx, 960 - 300, 260, 600, 44, 22);
    ctx.fill();
    ctx.strokeStyle = THEME.cyan;
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.fillStyle = THEME.cyan;
    ctx.font = `700 20px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(studentCfg.course.toUpperCase(), 960, 283);

    // Main Title
    ctx.fillStyle = THEME.text;
    ctx.font = `800 84px ${FONT_SANS}`;
    ctx.fillText(studentCfg.title, 960, 415);

    // Concept Subtitle
    ctx.fillStyle = THEME.amber;
    ctx.font = `600 34px ${FONT_SANS}`;
    ctx.fillText(studentCfg.subtitle, 960, 495);

    // Divider
    ctx.strokeStyle = 'rgba(148, 163, 184, 0.3)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(640, 565);
    ctx.lineTo(1280, 565);
    ctx.stroke();

    // Student Name & ID
    ctx.fillStyle = THEME.text;
    ctx.font = `700 30px ${FONT_SANS}`;
    ctx.fillText(`Presented by: ${studentCfg.studentName}`, 960, 635);
    ctx.fillStyle = THEME.textDim;
    ctx.font = `600 24px ${FONT_MONO}`;
    ctx.fillText(`Student ID: ${studentCfg.studentId}`, 960, 685);

    // Topic tag
    ctx.fillStyle = THEME.emerald;
    ctx.font = `600 20px ${FONT_MONO}`;
    ctx.fillText('Topic Area: A. Linear Algebra • Approved Topic Bank', 960, 765);

    ctx.restore();
    if (t <= openingHold) return;
  }

  // Main Scene 1: Hook & Context
  drawBackground(ctx, t, 'Hook & Context: Why Elimination?', 1, timeline.totalDuration);

  const pIntro = easeOutCubic(seg(t, s1_intro.start, s1_intro.start + 1.5));
  const pQuest = easeOutCubic(seg(t, s1_question.start, s1_question.start + 1.8));
  const pBridge = easeOutCubic(seg(t, s1_bridge.start, s1_bridge.start + 1.5));

  // Left Card: Coupled System (tangled equations)
  const leftX = lerp(420, 480, pIntro);
  drawCard(ctx, leftX - 360, 210, 720, 560, {
    alpha: pIntro,
    border: 'rgba(251, 113, 133, 0.5)',
    glowColor: 'rgba(251, 113, 133, 0.12)',
  });

  ctx.save();
  ctx.globalAlpha = pIntro;
  ctx.fillStyle = THEME.coral;
  ctx.font = `700 28px ${FONT_SANS}`;
  ctx.textAlign = 'center';
  ctx.fillText('Coupled 3×3 System (Entangled Variables)', leftX, 265);

  const eqs = [
    { txt: '2y + 3z = 7', col: THEME.cyan },
    { txt: 'x − y + 2z = 9', col: THEME.amber },
    { txt: '2x + 4y − z = −3', col: THEME.coral },
  ];
  eqs.forEach((eq, i) => {
    const ey = 365 + i * 110;
    drawCard(ctx, leftX - 270, ey - 38, 540, 76, {
      fill: 'rgba(30, 41, 59, 0.85)',
      border: eq.col,
      borderWidth: 2,
      radius: 14,
    });
    ctx.fillStyle = THEME.text;
    ctx.font = `700 34px ${FONT_MONO}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(eq.txt, leftX, ey);
  });

  // Animated coupling lines when question beat plays
  if (pQuest > 0) {
    ctx.globalAlpha = pQuest * 0.75;
    ctx.strokeStyle = THEME.amber;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([6, 6]);
    ctx.beginPath();
    ctx.moveTo(leftX - 290, 365);
    ctx.bezierCurveTo(leftX - 340, 420, leftX - 340, 530, leftX - 290, 585);
    ctx.moveTo(leftX + 290, 365);
    ctx.bezierCurveTo(leftX + 340, 420, leftX + 340, 530, leftX + 290, 585);
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = THEME.amber;
    ctx.font = `600 21px ${FONT_SANS}`;
    ctx.fillText('Naive substitution spirals into messy fractions!', leftX, 710);
  }
  ctx.restore();

  // Center Arrow
  const arrowP = easeInOutCubic(seg(t, s1_question.start + 2.0, s1_question.start + 4.2));
  if (arrowP > 0) {
    drawArrow(ctx, 870, 480, 1050, 480, THEME.amber, arrowP, 6);
    ctx.save();
    ctx.globalAlpha = arrowP;
    ctx.fillStyle = THEME.amber;
    ctx.font = `700 22px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('Gaussian', 960, 442);
    ctx.fillText('Elimination', 960, 520);
    ctx.restore();
  }

  // Right Card: Clean Echelon Staircase
  if (arrowP > 0.2) {
    const rAlpha = clamp01((arrowP - 0.2) / 0.8);
    const rightX = 1440;
    drawCard(ctx, rightX - 360, 210, 720, 560, {
      alpha: rAlpha,
      border: 'rgba(52, 211, 153, 0.55)',
      glowColor: 'rgba(52, 211, 153, 0.14)',
    });
    ctx.save();
    ctx.globalAlpha = rAlpha;
    ctx.fillStyle = THEME.emerald;
    ctx.font = `700 28px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('Row Echelon Staircase', rightX, 265);
    ctx.restore();

    drawMatrix(ctx, {
      cx: rightX,
      cy: 470,
      rows: [
        [1, -1, 2, 9],
        [0, 2, 3, 7],
        [0, 0, 1, 3],
      ],
      colHeaders: ['x', 'y', 'z', 'b'],
      pivots: [
        { r: 0, c: 0, color: THEME.emerald, pulse: t * 2 },
        { r: 1, c: 1, color: THEME.emerald, pulse: t * 2 },
        { r: 2, c: 2, color: THEME.emerald, pulse: t * 2 },
      ],
      echelonProgress: easeOutCubic(seg(t, s1_question.start + 3.5, s1_question.start + 6.0)),
      alpha: rAlpha,
    });

    if (pBridge > 0) {
      ctx.save();
      ctx.globalAlpha = pBridge;
      ctx.fillStyle = THEME.emerald;
      ctx.font = `700 24px ${FONT_MONO}`;
      ctx.textAlign = 'center';
      ctx.fillText('z = 3  →  y = −1  →  x = 2', rightX, 680);
      ctx.fillStyle = THEME.textDim;
      ctx.font = `600 20px ${FONT_SANS}`;
      ctx.fillText('Reads itself from bottom to top!', rightX, 725);
      ctx.restore();
    }
  }

  // Bottom question / bridge banner
  const bannerP = easeOutCubic(seg(t, s1_bridge.start, s1_bridge.start + 1.2));
  if (bannerP > 0) {
    drawCard(ctx, 210, 825, 1500, 150, {
      alpha: bannerP,
      fill: 'rgba(15, 23, 42, 0.94)',
      border: THEME.cyan,
      borderWidth: 2,
    });
    ctx.save();
    ctx.globalAlpha = bannerP;
    ctx.fillStyle = THEME.cyan;
    ctx.font = `700 24px ${FONT_SANS}`;
    ctx.textAlign = 'center';
    ctx.fillText('CORE QUESTION', 960, 868);
    ctx.fillStyle = THEME.text;
    ctx.font = `600 28px ${FONT_SANS}`;
    ctx.fillText('Which moves simplify a matrix while guaranteeing the EXACT same solution?', 960, 922);
    ctx.restore();
  }
}
