import { spawnSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const outPdf = path.join(rootDir, 'GaussianElimination_Storyboard.pdf');
const cfgPath = path.join(__dirname, 'student_config.json');
const srcHtmlPath = path.join(__dirname, 'storyboard.html');
const buildDir = path.join(__dirname, 'build');
fs.mkdirSync(buildDir, { recursive: true });
const renderedHtmlPath = path.join(buildDir, 'storyboard_rendered.html');

const cfg = JSON.parse(fs.readFileSync(cfgPath, 'utf8'));
let html = fs.readFileSync(srcHtmlPath, 'utf8');
html = html
  .replace('<span id="studentName">Student Name</span>', cfg.studentName)
  .replace('<span id="studentId">Student ID</span>', cfg.studentId)
  .replace('M3_AnimationVideo_GaussianElimination_&lt;StudentID&gt;', cfg.repositoryName);
fs.writeFileSync(renderedHtmlPath, html, 'utf8');

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
    `file://${renderedHtmlPath}`,
  ],
  { stdio: 'pipe' }
);

fs.rmSync(profileDir, { recursive: true, force: true });

if (result.status !== 0 || !fs.existsSync(outPdf)) {
  console.error('Failed to generate storyboard PDF:', result.stderr?.toString());
  process.exit(1);
}

const stats = fs.statSync(outPdf);
console.log(`Generated ${outPdf} (${(stats.size / 1024).toFixed(1)} KB)`);
