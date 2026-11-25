// _Code/render_video.js
/**
 * Full-video rendering script for the Gaussian elimination animation.
 *
 * Uses Headless Google Chrome's hardware/Skia HTML5 Canvas 2D renderer to
 * execute the exact ES-module scene files and pipes PNG frames directly into
 * ffmpeg along with build/final_audio.wav.
 *
 * Usage:
 *   npm run render
 *
 * Output:
 *   _Code/build/GaussianElimination_Animation.mp4
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import { spawn, execSync } from 'child_process';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.mjs': 'application/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
};

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';

(async () => {
  const timelinePath = path.join(__dirname, 'timeline.json');
  const studentCfgPath = path.join(__dirname, 'student_config.json');

  if (!fs.existsSync(timelinePath) || !fs.existsSync(studentCfgPath)) {
    console.error('❌  Required files missing – abort.');
    process.exit(1);
  }
  if (!fs.existsSync(CHROME_BIN)) {
    console.error(`❌  Google Chrome not found at ${CHROME_BIN}`);
    process.exit(1);
  }

  const timeline = JSON.parse(fs.readFileSync(timelinePath, 'utf8'));
  const { fps, width, height, totalDuration } = timeline;
  const totalFrames = Math.ceil(totalDuration * fps);

  const buildDir = path.join(__dirname, 'build');
  fs.mkdirSync(buildDir, { recursive: true });
  const videoOut = path.join(buildDir, 'GaussianElimination_Animation.mp4');
  const audioPath = path.join(buildDir, 'final_audio.wav');

  if (!fs.existsSync(audioPath)) {
    console.error(`❌  Audio file missing: ${audioPath}`);
    process.exit(1);
  }

  // Start ffmpeg reading PNG frames from stdin
  console.log(`▶️  Rendering ${totalFrames} frames @ ${fps} fps (${totalDuration.toFixed(2)} s) via Headless Chrome…`);
  const ffmpeg = spawn('ffmpeg', [
    '-y',
    '-f', 'image2pipe',
    '-vcodec', 'png',
    '-r', String(fps),
    '-i', '-',
    '-i', audioPath,
    '-c:v', 'libx264',
    '-preset', 'fast',
    '-crf', '18',
    '-pix_fmt', 'yuv420p',
    '-c:a', 'aac',
    '-b:a', '192k',
    '-shortest',
    videoOut,
  ], { stdio: ['pipe', 'inherit', 'inherit'] });

  let ffmpegDone = new Promise((resolve, reject) => {
    ffmpeg.on('close', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`ffmpeg exited with code ${code}`));
    });
    ffmpeg.on('error', reject);
  });

  const renderHtml = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="margin:0;background:#000;">
<canvas id="c" width="${width}" height="${height}"></canvas>
<script type="module">
(async () => {
  const status = (msg) => fetch('/log', { method: 'POST', body: msg }).catch(() => {});
  try {
    const [timeline, studentCfg] = await Promise.all([
      fetch('/timeline.json').then(r => r.json()),
      fetch('/student_config.json').then(r => r.json()),
    ]);

    const sceneFuncs = {};
    for (const s of timeline.scenes) {
      const mod = await import('/scenes/' + s.id + '.js');
      const fnName = Object.keys(mod).find(k => k.startsWith('renderScene'));
      sceneFuncs[s.id] = mod[fnName];
    }

    const canvas = document.getElementById('c');
    const ctx = canvas.getContext('2d');
    const fps = timeline.fps;
    const totalFrames = Math.ceil(timeline.totalDuration * fps);
    const firstScene = timeline.scenes[0];
    const lastScene = timeline.scenes[timeline.scenes.length - 1];

    const toPngBlob = () => new Promise(res => canvas.toBlob(res, 'image/png'));

    for (let i = 0; i < totalFrames; i++) {
      const t = i / fps;
      let curScene = timeline.scenes.find(s => t >= s.start && t < s.end);
      if (!curScene) {
        curScene = t < firstScene.start ? firstScene : lastScene;
      }
      ctx.clearRect(0, 0, ${width}, ${height});
      sceneFuncs[curScene.id](ctx, t, timeline, studentCfg);

      const blob = await toPngBlob();
      const resp = await fetch('/frame?i=' + i, { method: 'POST', body: blob });
      if (!resp.ok) throw new Error('Frame upload failed at ' + i);
    }
    await fetch('/done', { method: 'POST' });
  } catch (err) {
    await status('RENDER_ERROR: ' + (err && err.stack ? err.stack : String(err)));
    await fetch('/done?error=1', { method: 'POST' });
  }
})();
</script>
</body>
</html>`;

  let renderFinishedResolve, renderFinishedReject;
  const renderFinished = new Promise((res, rej) => {
    renderFinishedResolve = res;
    renderFinishedReject = rej;
  });

  let receivedFrames = 0;
  const tStart = Date.now();

  const server = http.createServer((req, res) => {
    const urlPath = (req.url || '/').split('?')[0];
    if (req.method === 'GET') {
      if (urlPath === '/' || urlPath === '/render.html') {
        res.writeHead(200, { 'Content-Type': MIME['.html'] });
        res.end(renderHtml);
        return;
      }
      const safeRel = path.normalize(urlPath).replace(/^(\.\.[/\\])+/, '');
      const filePath = path.join(__dirname, safeRel);
      if (filePath.startsWith(__dirname) && fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
        const ext = path.extname(filePath);
        res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
        fs.createReadStream(filePath).pipe(res);
        return;
      }
      res.writeHead(404);
      res.end('Not found');
      return;
    }

    if (req.method === 'POST' && urlPath === '/frame') {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        const buf = Buffer.concat(chunks);
        const ok = ffmpeg.stdin.write(buf);
        receivedFrames++;
        if (receivedFrames % 150 === 0 || receivedFrames === totalFrames) {
          const pct = ((receivedFrames / totalFrames) * 100).toFixed(1);
          const elapsed = ((Date.now() - tStart) / 1000).toFixed(1);
          console.log(`   🎞️  ${receivedFrames}/${totalFrames} frames (${pct}%) • ${elapsed}s`);
        }
        const reply = () => {
          res.writeHead(200);
          res.end('ok');
        };
        if (ok) reply();
        else ffmpeg.stdin.once('drain', reply);
      });
      return;
    }

    if (req.method === 'POST' && urlPath === '/log') {
      const chunks = [];
      req.on('data', c => chunks.push(c));
      req.on('end', () => {
        console.error(Buffer.concat(chunks).toString('utf8'));
        res.writeHead(200);
        res.end('ok');
      });
      return;
    }

    if (req.method === 'POST' && urlPath === '/done') {
      res.writeHead(200);
      res.end('ok');
      if ((req.url || '').includes('error=1')) {
        renderFinishedReject(new Error('Browser render failed'));
      } else {
        renderFinishedResolve();
      }
      return;
    }

    res.writeHead(404);
    res.end();
  });

  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();

  const profileDir = `/tmp/chrome_render_prof_${process.pid}`;
  fs.rmSync(profileDir, { recursive: true, force: true });

  const chrome = spawn(CHROME_BIN, [
    '--headless=new',
    '--no-sandbox',
    '--disable-gpu',
    `--user-data-dir=${profileDir}`,
    '--autoplay-policy=no-user-gesture-required',
    `http://127.0.0.1:${port}/render.html`,
  ], { stdio: ['ignore', 'ignore', 'pipe'] });

  let chromeErr = '';
  chrome.stderr.on('data', d => {
    chromeErr += d.toString();
  });

  try {
    await renderFinished;
  } finally {
    chrome.kill('SIGTERM');
    server.close();
    fs.rmSync(profileDir, { recursive: true, force: true });
  }

  ffmpeg.stdin.end();
  await ffmpegDone;

  console.log(`✅  Video written to ${videoOut}`);
  try {
    const dur = execSync(`ffprobe -v error -show_entries format=duration -of default=noprint_wrappers=1:nokey=1 "${videoOut}"`);
    console.log(`📏  Final video duration: ${parseFloat(dur).toFixed(2)} s`);
  } catch (_) {
    console.warn('⚠️  ffprobe not available – could not report duration.');
  }
})();
