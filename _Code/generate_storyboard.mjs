import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outPdf = path.join(rootDir, 'GaussianElimination_Storyboard.pdf');

// Serve _Code briefly over localhost so storyboard.html can fetch student_config.json cleanly
const server = http.createServer((req, res) => {
  const cleanUrl = (req.url || '/').split('?')[0];
  const relPath = cleanUrl === '/' ? 'storyboard.html' : cleanUrl.replace(/^\/+/, '');
  const filePath = path.join(__dirname, relPath);
  if (!filePath.startsWith(__dirname) || !fs.existsSync(filePath)) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  const ext = path.extname(filePath);
  const types = { '.html': 'text/html', '.json': 'application/json', '.js': 'application/javascript' };
  res.writeHead(200, { 'Content-Type': types[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
const { port } = server.address();
const url = `http://127.0.0.1:${port}/storyboard.html`;

const chromeBin = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const profileDir = '/tmp/chrome_storyboard_prof';
fs.rmSync(profileDir, { recursive: true, force: true });

const result = spawnSync(
  chromeBin,
  [
    '--headless=new',
    '--no-sandbox',
    `--user-data-dir=${profileDir}`,
    '--no-pdf-header-footer',
    `--print-to-pdf=${outPdf}`,
    '--virtual-time-budget=2000',
    url,
  ],
  { stdio: 'pipe' }
);

server.close();
fs.rmSync(profileDir, { recursive: true, force: true });

if (result.status !== 0 || !fs.existsSync(outPdf)) {
  console.error('Failed to generate storyboard PDF:', result.stderr?.toString());
  process.exit(1);
}

const stats = fs.statSync(outPdf);
console.log(`Generated ${outPdf} (${(stats.size / 1024).toFixed(1)} KB)`);
