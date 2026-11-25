# Mathematical Verification & Individual Viva / Q&A Guide

## 1. Exact Step-by-Step Paper Verification

### A. 2D Intuition System (Scene 3)
$$\begin{cases} L_1: & x + y = 5 \\ L_2: & 2x - y = 1 \end{cases}$$
- Add $L_1 + L_2 \implies 3x = 6 \implies x = 2 \implies y = 3$.
- Augmented matrix: $\left[\begin{array}{cc|c} 1 & 1 & 5 \\ 2 & -1 & 1 \end{array}\right]$.
- Apply $R_2 \leftarrow R_2 - 2R_1$:
  - $[2, -1 \mid 1] - 2[1, 1 \mid 5] = [0, -3 \mid -9]$, i.e., $-3y = -9 \iff y = 3$.
- Why $(2, 3)$ stays fixed: At $(2,3)$, $L_1(2,3) - 5 = 0$ and $L_2(2,3) - 1 = 0$, so $(L_2 - 2L_1)(2,3) = 0 - 2(0) = 0$.

### B. 3×3 Worked Example (Scene 4)
Original system:
$$\begin{cases}
0x + 2y + 3z = 7 \\
1x - 1y + 2z = 9 \\
2x + 4y - 1z = -3
\end{cases}$$

1. **Initial Augmented Matrix:**
   $$\left[\begin{array}{ccc|c} 0 & 2 & 3 & 7 \\ 1 & -1 & 2 & 9 \\ 2 & 4 & -1 & -3 \end{array}\right]$$
2. **Row Swap ($R_1 \leftrightarrow R_2$):**
   $$\left[\begin{array}{ccc|c} 1 & -1 & 2 & 9 \\ 0 & 2 & 3 & 7 \\ 2 & 4 & -1 & -3 \end{array}\right]$$
3. **Row Replacement ($R_3 \leftarrow R_3 - 2R_1$):**
   - $2 - 2(1) = 0$
   - $4 - 2(-1) = 6$
   - $-1 - 2(2) = -5$
   - $-3 - 2(9) = -21$
   $$\left[\begin{array}{ccc|c} 1 & -1 & 2 & 9 \\ 0 & 2 & 3 & 7 \\ 0 & 6 & -5 & -21 \end{array}\right]$$
4. **Row Replacement ($R_3 \leftarrow R_3 - 3R_2$):**
   - $0 - 3(0) = 0$
   - $6 - 3(2) = 0$
   - $-5 - 3(3) = -14$
   - $-21 - 3(7) = -42$
   $$\left[\begin{array}{ccc|c} 1 & -1 & 2 & 9 \\ 0 & 2 & 3 & 7 \\ 0 & 0 & -14 & -42 \end{array}\right]$$
5. **Row Scaling ($R_3 \leftarrow -\frac{1}{14} R_3$):**
   $$\left[\begin{array}{ccc|c} 1 & -1 & 2 & 9 \\ 0 & 2 & 3 & 7 \\ 0 & 0 & 1 & 3 \end{array}\right]$$
6. **Back-Substitution:**
   - $z = 3$
   - $2y + 3(3) = 7 \implies 2y = -2 \implies y = -1$
   - $x - (-1) + 2(3) = 9 \implies x + 7 = 9 \implies x = 2$
7. **Substitution Check in Original Equations:**
   - Eq 1: $2(-1) + 3(3) = -2 + 9 = 7$ ✓
   - Eq 2: $2 - (-1) + 2(3) = 2 + 1 + 6 = 9$ ✓
   - Eq 3: $2(2) + 4(-1) - 3 = 4 - 4 - 3 = -3$ ✓

---

## 2. Viva / Q&A Preparation Notes

1. **Why must row operations be reversible?**
   Because if an operation $T$ maps system $S_1 \to S_2$ and has an inverse operation $T^{-1}$ mapping $S_2 \to S_1$:
   - Every solution of $S_1$ satisfies $S_2$ (forward implication).
   - Every solution of $S_2$ satisfies $S_1$ (reverse implication via $T^{-1}$).
   - Scaling by $c = 0$ is forbidden because multiplying an equation by $0$ destroys information ($0 = 0$ is satisfied by *all* vectors), so it is not reversible!
2. **What is the difference between Row Echelon Form (REF) and Reduced Row Echelon Form (RREF)?**
   - **REF** (Gaussian elimination): leading nonzero entry (pivot) in each row is strictly right of the pivot above it, and all entries *below* each pivot are zero. Solved via back-substitution.
   - **RREF** (Gauss-Jordan elimination): additionally, every pivot equals $1$ and all entries *above and below* each pivot are zero.
3. **Why did we need a row swap at the start?**
   Entry $(1,1)$ was $0$. A pivot must be nonzero so we can form multiples $-a_{i1}/a_{11}$ to eliminate entries below it.
4. **How does the animation code work?**
   - `_Code/generate_audio.py` measures exact TTS clip durations and writes `_Code/timeline.json` plus a mixed voice + `-26 dB` ambient music track.
   - `_Code/renderer.html` + `_Code/scenes/*.js` draw deterministic 1920×1080 Canvas2D frames as a pure function of time `t` (`renderFrame(t)`), including eased matrix cell morphs, 2D line pivoting, and depth-sorted 3D plane projections.
   - `_Code/render_video.mjs` drives headless Chrome over CDP/WebSocket and pipes raw RGBA frames into `ffmpeg` to produce `GaussianElimination_Video.mp4`.
