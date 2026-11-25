// _Code/render_video.js
/**
 * Full‑video rendering script for the Gaussian elimination animation.
 *
 * Prerequisites (run once):
 *   npm install                # installs node‑canvas
 *   ffmpeg must be on PATH     # brew install ffmpeg on macOS
 *
 * Usage:
 *   npm run render
 *
 * Output:
 *   _Code/build/GaussianElimination_Animation.mp4
 */

import fs from 'fs';
import path from 'path';
import { createCanvas } from 'canvas';
import { execSync } from 'child_process';

(async () => {
  // ---------------------------------------------------------------------
  // 1️⃣ Load configuration & student data
  // ---------------------------------------------------------------------
  const timelinePath = path.join(__dirname, 'timeline.json');
  const studentCfgPath = path.join(__dirname, 'student_config.json');

  if (!fs.existsSync(timelinePath) || !fs.existsSync(studentCfgPath)) {
    console.error('❌  Required files missing – abort.');
    process.exit(1);
  }
  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const studentCfg = JSON.parse(fs.readFileSync(studentCfgPath, 'utf8'));

  const { fps, width, height, scenes, totalDuration } = timeline;

  // ---------------------------------------------------------------------
  // 2️⃣ Prepare output directory
  // ---------------------------------------------------------------------
  const outFrames = path.join(__dirname, 'build', 'frames');
  fs.rmSync(outFrames, { recursive: true, force: true });
  fs.mkdirSync(outFrames, { recursive: true });

  // ---------------------------------------------------------------------
  // 3️⃣ Dynamically import scene modules (ES‑module async import)
  // ---------------------------------------------------------------------
  const scenesDir = path.join(__dirname, 'scenes');
  const sceneFuncs = {};
  for (const s of scenes) {
    const modPath = path.join(scenesDir, `${s.id}.js`);
    if (fs.existsSync(modPath)) {
      // `file://` URL is required for dynamic import in Node when using absolute paths
      const mod = await import(`file://${modPath}`);
      // All scene files export a function whose name starts with 'renderScene'
      const fnName = Object.keys(mod).find(k => k.startsWith('renderScene'));
      sceneFuncs[s.id] = mod[fnName];
    } else {
      console.warn(`⚠️  Scene file missing: ${modPath}`);
    }
  }

  // ---------------------------------------------------------------------
  // 4️⃣ Render each frame
  // ---------------------------------------------------------------------
  const totalFrames = Math.ceil(totalDuration * fps);
  console.log(`▶️  Rendering ${totalFrames} frames @ ${fps} fps (${totalDuration.toFixed(2)} s)…`);
  for (let i = 0; i < totalFrames; i++) {
    const t = i / fps;               // current time in seconds
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // Find active scene for this timestamp
    const curScene = scenes.find(s => t >= s.start && t < s.end);
    if (curScene && sceneFuncs[curScene.id]) {
      // Call the scene’s render function
      sceneFuncs[curScene.id](ctx, t, timeline, studentCfg);
    } else {
      // Fallback: black background
      ctx.fillStyle = 'black';
      ctx.fillRect(0, 0, width, height);
    }

    const outPath = path.join(outFrames, `frame_${String(i).padStart(5, '0')}.png`);
    const buffer = canvas.toBuffer('image/png');
    fs.writeFileSync(outPath, buffer);
  }

  // ---------------------------------------------------------------------
  // 5️⃣ Stitch frames with ffmpeg + audio
  // ---------------------------------------------------------------------
  const videoOut = path.join(__dirname, 'build', 'GaussianElimination_Animation.mp4');
  const audioPath = path.join(__dirname, 'build', 'final_audio.wav'); // created by generate_audio.py

  console.log('🔧  Running ffmpeg…');
  try {
    const ffmpegCmd = [
      'ffmpeg',
      '-y',
      `-r ${fps}`,
      `-i ${path.join(outFrames, 'frame_%05d.png')}`,
      `-i ${audioPath}`,
      '-c:v libx264',
      '-pix_fmt yuv420p',
      '-c:a aac',
      '-shortest',
      `${videoOut}`,
    ].join(' ');
    execSync(ffmpegCmd, { stdio: 'inherit' });
    console.log(`✅  Video written to ${videoOut}`);
  } catch (e) {
    console.error('❌  ffmpeg failed – ensure it is installed and on PATH.');
    process.exit(1);
  }

  // ---------------------------------------------------------------------
  // 6️⃣ Report final duration (optional, uses ffprobe)
  // ---------------------------------------------------------------------
  try {
    const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoOut}"`);
    console.log(`📏  Final video duration: ${parseFloat(dur).toFixed(2)} s`);
  } catch (_) {
    console.warn('⚠️  ffprobe not available – could not report duration.');
  }
})();
