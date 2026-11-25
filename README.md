# M3 Linear Algebra & Calculus — Animation Video Project
## Topic: Gaussian Elimination (Step-by-Step Row Operations, Pivots & Row Echelon Form)

**Course:** Linear Algebra and Calculus (M3) • Internal Assessment (10%)  
**Suggested Public GitHub Repository Name:** `M3_AnimationVideo_GaussianElimination_<StudentID>`  
**Video Format:** 1920×1080 (16:9 Landscape), H.264 MP4, ~5:30 duration (under the 7-minute limit)

---

### Learning Objective
> *By the end of this video, the viewer will be able to understand why elementary row operations preserve the solution set of a linear system, apply Gaussian elimination step by step to transform an augmented matrix into Row Echelon Form, and interpret the resulting upper-triangular geometry and back-substitution.*

---

### Repository Contents

| Deliverable | Path | Description |
| :--- | :--- | :--- |
| **Final Video** | [`GaussianElimination_Video.mp4`](GaussianElimination_Video.mp4) | Rendered 1080p 16:9 MP4 with Opening Frame, 6 pedagogical scenes, voice-over narration, subtle ambient music, and Closing Credits. |
| **6-Scene Storyboard** | [`GaussianElimination_Storyboard.pdf`](GaussianElimination_Storyboard.pdf) | Structured 6-scene storyboard with purpose, visual/math/narration plan, and scene diagrams. |
| **Animation Source Code** | [`_Code/`](_Code/) | Complete modular HTML5 Canvas2D animation engine, Node.js/Chrome/FFmpeg renderer, Python exact-rational verifier, narration script, and audio synthesizer. |
| **Narration & Timeline** | [`Supporting_Documents/Narration_Script_and_Timeline.md`](Supporting_Documents/Narration_Script_and_Timeline.md) | Complete beat-by-beat transcript and timing breakdown. |
| **Verification & Viva Notes** | [`Supporting_Documents/Mathematical_Verification_and_Viva_Notes.md`](Supporting_Documents/Mathematical_Verification_and_Viva_Notes.md) | Paper-style step-by-step derivation, substitution checks, and Q&A preparation guide. |

---

### Core Mathematical Example Covered

We solve the $3 \times 3$ system:
$$\begin{aligned}
2y + 3z &= 7 \\
x - y + 2z &= 9 \\
2x + 4y - z &= -3
\end{aligned}$$

1. **Augmented Matrix:** $\left[\begin{array}{ccc|c} 0 & 2 & 3 & 7 \\ 1 & -1 & 2 & 9 \\ 2 & 4 & -1 & -3 \end{array}\right]$
2. **Row Swap ($R_1 \leftrightarrow R_2$)** to place a nonzero pivot $1$ at $(1,1)$
3. **Row Replacement ($R_3 \leftarrow R_3 - 2R_1$)** to clear column 1
4. **Row Replacement ($R_3 \leftarrow R_3 - 3R_2$)** to clear column 2
5. **Row Scaling ($R_3 \leftarrow -\frac{1}{14}R_3$)** to reach clean Row Echelon Form:
   $$\left[\begin{array}{ccc|c} 1 & -1 & 2 & 9 \\ 0 & 2 & 3 & 7 \\ 0 & 0 & 1 & 3 \end{array}\right]$$
6. **Back-Substitution:** $z = 3 \implies y = -1 \implies x = 2$, verified in all three original equations.

---

### How to Personalize Name / Student ID & Rebuild

1. Edit [`_Code/student_config.json`](_Code/student_config.json) with your `studentName`, `studentId`, and `repositoryName`.
2. Verify all mathematical calculations:
   ```bash
   python3 _Code/math_verify.py
   ```
3. Regenerate the Storyboard PDF:
   ```bash
   node _Code/generate_storyboard.mjs
   ```
4. Regenerate audio tracks and timeline (optional if keeping existing audio):
   ```bash
   python3 _Code/generate_audio.py
   ```
5. Re-render the 1080p MP4 video:
   ```bash
   node _Code/render_video.mjs
   ```

---

### Credits, Music & AI Disclosure
- **References:**
  - Gilbert Strang, *Introduction to Linear Algebra* (5th Ed.)
  - David C. Lay, Steven R. Lay, Judi J. McDonald, *Linear Algebra and Its Applications*
- **Music Credit:** Original procedural ambient sine-pad track synthesized programmatically via Python + FFmpeg (`generate_audio.py`, CC0 / Original, mixed at `-26 dB` beneath voice narration).
- **AI Tool Disclosure:** AI assistance was used to structure the storyboard, author the modular HTML5 Canvas2D animation scripts, synthesize the voice-over narration track, and generate the Python mathematical verification tests. All mathematical derivations, visual decisions, and code were reviewed and verified independently.
