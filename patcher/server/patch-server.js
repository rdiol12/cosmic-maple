'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');
const { generateManifest } = require('./generate-manifest.cjs');

const PORT = parseInt(process.env.PATCH_PORT || '3500', 10);
const DIST_DIR = 'C:/Users/rdiol/sela/workspace/heavenclient-dist';
const MANIFEST_PATH = path.join(__dirname, 'patch-manifest.json');

// Generate manifest on startup if missing or stale
async function ensureManifest() {
  if (!fs.existsSync(MANIFEST_PATH)) {
    console.log('No manifest found, generating...');
    await generateManifest(DIST_DIR, MANIFEST_PATH);
  }
}

// Watch dist directory for changes — auto-regenerate manifest
// Uses polling fallback since fs.watch on Windows can miss events
let watchDebounce = null;
let lastKnownMtimes = {};

function watchDistDir() {
  // Initial snapshot of file mtimes
  snapshotMtimes();

  // Primary: fs.watch for immediate detection
  try {
    fs.watch(DIST_DIR, (eventType, filename) => {
      if (!filename) return;
      scheduleManifestRegen(`fs.watch: ${filename}`);
    });
    console.log(`Watching ${DIST_DIR} for changes (fs.watch + polling fallback)`);
  } catch (err) {
    console.error('fs.watch failed:', err.message);
  }

  // Fallback: poll every 30s to catch missed events
  setInterval(() => {
    const changed = checkMtimeChanges();
    if (changed.length > 0) {
      scheduleManifestRegen(`poll: ${changed.join(', ')}`);
    }
  }, 30_000);
}

function snapshotMtimes() {
  try {
    const files = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.nx') || f.endsWith('.exe') || f.endsWith('.dll') || f.endsWith('.png') || f === 'Settings');
    for (const f of files) {
      const stat = fs.statSync(path.join(DIST_DIR, f));
      lastKnownMtimes[f] = stat.mtimeMs;
    }
  } catch (_) {}
}

function checkMtimeChanges() {
  const changed = [];
  try {
    const files = fs.readdirSync(DIST_DIR).filter(f => f.endsWith('.nx') || f.endsWith('.exe') || f.endsWith('.dll') || f.endsWith('.png') || f === 'Settings');
    for (const f of files) {
      const stat = fs.statSync(path.join(DIST_DIR, f));
      if (lastKnownMtimes[f] !== stat.mtimeMs) {
        changed.push(f);
      }
    }
  } catch (_) {}
  return changed;
}

function scheduleManifestRegen(reason) {
  if (watchDebounce) clearTimeout(watchDebounce);
  watchDebounce = setTimeout(async () => {
    console.log(`\n[watch] ${reason} — regenerating manifest...`);
    try {
      await generateManifest(DIST_DIR, MANIFEST_PATH);
      snapshotMtimes(); // update snapshot after regen
    } catch (err) {
      console.error('[watch] Manifest generation failed:', err.message);
    }
  }, 5000); // wait 5s for writes to settle
}

// HTTP server
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // CORS for browser-based clients
  res.setHeader('Access-Control-Allow-Origin', '*');

  if (pathname === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', time: new Date().toISOString() }));
    return;
  }

  if (pathname === '/manifest') {
    if (!fs.existsSync(MANIFEST_PATH)) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Manifest not generated yet' }));
      return;
    }
    const data = fs.readFileSync(MANIFEST_PATH, 'utf-8');
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(data);
    return;
  }

  // /files/<name> → serve any distribution file (NX, EXE, DLL, Settings)
  const fileMatch = pathname.match(/^\/files\/(.+)$/);
  if (fileMatch) {
    const filename = fileMatch[1];
    // Prevent path traversal
    if (filename.includes('..') || filename.includes('/') || filename.includes('\\')) {
      res.writeHead(400);
      res.end('Invalid filename');
      return;
    }
    const filePath = path.join(DIST_DIR, filename);
    if (!fs.existsSync(filePath)) {
      res.writeHead(404);
      res.end('File not found');
      return;
    }
    const stat = fs.statSync(filePath);
    console.log(`[download] ${filename} (${(stat.size / 1024 / 1024).toFixed(1)} MB) → ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': `attachment; filename="${filename}"`,
    });
    fs.createReadStream(filePath).pipe(res);
    return;
  }

  // /patcher — download the patcher exe
  if (pathname === '/patcher') {
    const exePath = path.join(__dirname, '..', 'client', 'dist', 'MaplePatcher.exe');
    if (!fs.existsSync(exePath)) {
      res.writeHead(404);
      res.end('Patcher exe not found');
      return;
    }
    const stat = fs.statSync(exePath);
    console.log(`[download] MaplePatcher.exe (${(stat.size / 1024 / 1024).toFixed(1)} MB) → ${req.socket.remoteAddress}`);
    res.writeHead(200, {
      'Content-Type': 'application/octet-stream',
      'Content-Length': stat.size,
      'Content-Disposition': 'attachment; filename="MaplePatcher.exe"',
    });
    fs.createReadStream(exePath).pipe(res);
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

async function start() {
  await ensureManifest();
  watchDistDir();
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`\nMaple Patch Server running on http://0.0.0.0:${PORT}`);
    console.log(`  GET /manifest     — file list with hashes`);
    console.log(`  GET /files/<name> — download a client file`);
    console.log(`  GET /health       — server status\n`);
  });
}

start().catch(err => {
  console.error('Fatal:', err.message);
  process.exit(1);
});
