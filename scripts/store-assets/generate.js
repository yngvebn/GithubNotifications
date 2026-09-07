#!/usr/bin/env node
/**
 * Regenerates the Chrome Web Store listing assets in ../../assets.
 *
 * The popup markup/CSS is mirrored from projects/main/src/app/app.component.*
 * so the listing images stay in sync with the real UI. Avatars are generated
 * placeholders rather than real photos.
 *
 * Usage: node scripts/store-assets/generate.js [--chrome <path to chrome.exe>]
 */
const fs = require('fs');
const path = require('path');
const os = require('os');
const { execFileSync } = require('child_process');

const root = path.resolve(__dirname, '..', '..');
const cssPath = path.join(root, 'v2/projects/main/src/app/app.component.css');
const outDir = path.join(root, 'assets');

const CHROME_CANDIDATES = [
  process.env.CHROME_PATH,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
];

function findChrome() {
  const flagIndex = process.argv.indexOf('--chrome');
  if (flagIndex !== -1) return process.argv[flagIndex + 1];
  const found = CHROME_CANDIDATES.filter(Boolean).find((p) => fs.existsSync(p));
  if (!found) throw new Error('Chrome not found; pass --chrome <path>');
  return found;
}

const svg = (body, viewBox) =>
  `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='${viewBox}'>${body}</svg>`;

const avatar = (initials, bg) =>
  svg(
    `<rect width='40' height='40' fill='%23${bg}'/>` +
      `<text x='20' y='26' font-family='sans-serif' font-size='16' font-weight='600' fill='%23ffffff' text-anchor='middle'>${initials}</text>`,
    '0 0 40 40'
  );

// Octicons git-pull-request (MIT) -- generic PR glyph, matches assets/icon_*.png
const PR_ICON = svg(
  "<g fill='%2324292f'>" +
    "<path d='M3.5 1.75a.75.75 0 0 0-1.5 0v9.44a2.75 2.75 0 1 0 1.5 0V1.75Zm-.75 10.5a1.25 1.25 0 1 0 0 2.5 1.25 1.25 0 0 0 0-2.5Z'/>" +
    "<path d='M13.25 14.75a2.75 2.75 0 1 0-1.5-5.06V6.5A2.5 2.5 0 0 0 9.25 4H8.31l1.22-1.22a.75.75 0 0 0-1.06-1.06L5.72 4.28a.75.75 0 0 0 0 1.06l2.75 2.75a.75.75 0 1 0 1.06-1.06L8.31 5.5h.94a1 1 0 0 1 1 1v3.19a2.75 2.75 0 0 0 3 5.06Zm0-4a1.25 1.25 0 1 1 0 2.5 1.25 1.25 0 0 1 0-2.5Z'/></g>",
  '0 0 16 16'
);

const REPOS = [
  {
    name: 'repo1',
    prs: [
      { title: 'Add new feature to handle user authentication', number: 123, createdAt: '2 days ago', by: 'johndoe', draft: false, avatar: avatar('JD', '0969da') },
      { title: 'Fix bug in notification system', number: 124, createdAt: '1 day ago', by: 'janedoe', draft: true, avatar: avatar('JA', '8250df') },
    ],
  },
  {
    name: 'repo2',
    prs: [
      { title: 'Update dependencies and security patches', number: 45, createdAt: '3 days ago', by: 'bobsmith', draft: false, avatar: avatar('BS', '1a7f37') },
      { title: 'Refactor component architecture', number: 67, createdAt: '1 week ago', by: 'alicejohnson', draft: true, avatar: avatar('AJ', 'bf3989') },
    ],
  },
];

function popup({ empty }) {
  const body = empty
    ? '<div class="pull-requests"><div class="no-prs"><p>No open pull requests found! \u{1F389}</p></div></div>'
    : `<div class="pull-requests">${REPOS.map(
        (repo) => `<div class="repository-group"><div class="repository-name">${repo.name}</div>${repo.prs
          .map(
            (pr) => `
      <div class="pull-request${pr.draft ? ' pull-request-draft' : ''}">
        <div class="pr-icon"><img src="${PR_ICON}" alt="PR" /></div>
        <div class="pr-info">
          <div class="pr-title">${pr.title}${pr.draft ? '<span class="draft-badge">Draft</span>' : ''}</div>
          <div class="pr-summary"><span class="pr-number">#${pr.number}</span> opened <span class="pr-opened">${pr.createdAt}</span> by <span class="pr-opened-by">${pr.by}</span></div>
        </div>
        <div class="pr-avatar"><img src="${pr.avatar}" alt="${pr.by}" /></div>
      </div>`
          )
          .join('')}</div>`
      ).join('')}</div>`;

  return `<div class="pr-notifications">
  <div class="header${empty ? '' : ' header-compact'}"><h3>Pull Requests</h3>
    <button class="options-btn" title="Options">\u2699\uFE0F</button></div>
  ${body}
</div>`;
}

function page({ width, height, cards, extraCss = '' }) {
  const css = fs.readFileSync(cssPath, 'utf8');
  return `<!doctype html>
<meta charset="utf-8">
<title>store asset</title>
<style>
html, body { margin: 0; padding: 0; background: #ffffff; }
${css}
/* component class mirrors .github-notifications from the real popup */
.pr-notifications {
  min-width: 350px; max-width: 400px;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  font-size: 14px; background: #ffffff;
}
.pull-requests { max-height: none; }
.frame {
  width: ${width}px; height: ${height}px; box-sizing: border-box;
  display: flex; align-items: center; justify-content: center;
  gap: 16px; overflow: hidden;
}
.card {
  border: 1px solid #d1d9e0; border-radius: 6px; overflow: hidden;
  box-shadow: 0 1px 3px rgba(27,31,36,.12), 0 8px 24px rgba(66,74,83,.12);
}
${extraCss}
</style>
<div class="frame">${cards}</div>
`;
}

const TARGETS = [
  { file: 'with-pullrequests.png', width: 640, height: 400, cards: `<div class="card">${popup({ empty: false })}</div>` },
  { file: 'no-pullrequests.png', width: 640, height: 400, cards: `<div class="card">${popup({ empty: true })}</div>` },
  {
    file: 'promotile.png',
    width: 440,
    height: 280,
    cards: `<div class="card">${popup({ empty: true })}</div><div class="card">${popup({ empty: false })}</div>`,
    extraCss: '.frame { padding: 0 12px; } .card { zoom: .6; }',
  },
];

const chrome = findChrome();
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'store-assets-'));

for (const t of TARGETS) {
  const html = path.join(tmp, t.file.replace('.png', '.html'));
  fs.writeFileSync(html, page(t), 'utf8');
  const out = path.join(outDir, t.file);
  execFileSync(chrome, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    `--window-size=${t.width},${t.height}`,
    `--screenshot=${out}`,
    `--user-data-dir=${path.join(tmp, 'profile-' + t.file)}`,
    `file://${html.split(path.sep).join("/")}`,
  ], { stdio: 'ignore' });
  console.log(`wrote ${path.relative(root, out)} (${t.width}x${t.height})`);
}

// Chrome can still hold profile file handles briefly after exit; cleanup is best-effort.
try {
  fs.rmSync(tmp, { recursive: true, force: true, maxRetries: 5, retryDelay: 200 });
} catch {
  console.log('note: could not remove temp dir ' + tmp);
}
