'use strict';

const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { spawn } = require('child_process');

// Load config
const CONFIG_PATH = path.join(__dirname, 'patcher-config.json');
if (!fs.existsSync(CONFIG_PATH)) {
  console.error('Missing patcher-config.json! Create it next to patcher.js with:');
  console.error(JSON.stringify({
    serverUrl: 'http://YOUR_SERVER_IP:3500',
    maplePath: 'C:\\MapleStory',
    mapleExe: 'HeavenMS-localhost-WINDOW.exe',
  }, null, 2));
  process.exit(1);
}

const config = JSON.parse(fs.readFileSync(CONFIG_PATH, 'utf-8'));
const { serverUrl, maplePath, mapleExe } = config;

// ── Helpers ───────────────────────────────────────────────────────────────────

function httpGet(url) {
  return new Promise((resolve, reject) => {
    const mod = url.startsWith('https') ? https : http;
    mod.get(url, (res) => {
      if (res.statusCode !== 200) {
        reject(new Error(`HTTP ${res.statusCode} for ${url}`));
        res.resume();
        return;
      }
      const chunks = [];
      res.on('data', (d) => chunks.push(d));
      res.on('end', () => resolve(Buffer.concat(chunks)));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

function downloadFile(url, destPath, expectedSize) {
  return new Promise((resolve, reject) => {
    const tmpPath = destPath + '.download';
    const file = fs.createWriteStream(tmpPath);
    const mod = url.startsWith('https') ? https : http;

    mod.get(url, (res) => {
      if (res.statusCode !== 200) {
        file.close();
        fs.unlinkSync(tmpPath);
        reject(new Error(`HTTP ${res.statusCode}`));
        return;
      }

      const total = parseInt(res.headers['content-length'] || expectedSize, 10);
      let downloaded = 0;
      let lastPct = -1;

      res.on('data', (chunk) => {
        downloaded += chunk.length;
        const pct = Math.floor((downloaded / total) * 100);
        if (pct !== lastPct) {
          lastPct = pct;
          const bar = '='.repeat(Math.floor(pct / 2)).padEnd(50);
          const dlMB = (downloaded / 1024 / 1024).toFixed(1);
          const totalMB = (total / 1024 / 1024).toFixed(1);
          process.stdout.write(`\r  [${bar}] ${pct}%  ${dlMB} / ${totalMB} MB`);
        }
      });

      res.pipe(file);

      file.on('finish', () => {
        file.close();
        process.stdout.write('\n');
        // Replace target file — retry if locked
        const maxRetries = 5;
        for (let i = 0; i < maxRetries; i++) {
          try {
            if (fs.existsSync(destPath)) fs.unlinkSync(destPath);
            fs.renameSync(tmpPath, destPath);
            resolve();
            return;
          } catch (err) {
            if (i < maxRetries - 1 && (err.code === 'EBUSY' || err.code === 'EPERM')) {
              const backupPath = destPath + '.old';
              try {
                // Try rename instead of delete
                if (fs.existsSync(destPath)) fs.renameSync(destPath, backupPath);
                fs.renameSync(tmpPath, destPath);
                try { fs.unlinkSync(backupPath); } catch {}
                resolve();
                return;
              } catch {
                console.log(`  File locked, retrying in 3s... (${i + 1}/${maxRetries})`);
                const wait = Date.now() + 3000;
                while (Date.now() < wait) {} // sync wait
              }
            } else {
              reject(err);
              return;
            }
          }
        }
        reject(new Error('File is locked. Close MapleStory and try again.'));
      });

      res.on('error', (err) => {
        file.close();
        if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
        reject(err);
      });
    }).on('error', (err) => {
      file.close();
      if (fs.existsSync(tmpPath)) fs.unlinkSync(tmpPath);
      reject(err);
    });
  });
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function run() {
  console.log('=== Maple Patcher ===\n');
  console.log(`Server: ${serverUrl}`);
  console.log(`Client: ${maplePath}\n`);

  // Ensure maple directory exists
  if (!fs.existsSync(maplePath)) {
    console.error(`MapleStory directory not found: ${maplePath}`);
    waitForKey();
    return;
  }

  // Fetch manifest
  console.log('Checking for updates...');
  let manifest;
  try {
    const data = await httpGet(`${serverUrl}/manifest`);
    manifest = JSON.parse(data.toString());
  } catch (err) {
    console.error(`Cannot reach patch server: ${err.message}`);
    console.log('\nLaunching game without updating...');
    launchGame();
    return;
  }

  console.log(`Server version: ${manifest.version} (${manifest.files.length} files)\n`);

  // Compare local files
  const toDownload = [];
  for (const remote of manifest.files) {
    const localPath = path.join(maplePath, remote.name);
    if (!fs.existsSync(localPath)) {
      console.log(`  [NEW]     ${remote.name}`);
      toDownload.push(remote);
      continue;
    }
    const localHash = await hashFile(localPath);
    if (localHash !== remote.sha256) {
      console.log(`  [UPDATE]  ${remote.name}`);
      toDownload.push(remote);
    } else {
      console.log(`  [OK]      ${remote.name}`);
    }
  }

  // Download changed files
  if (toDownload.length === 0) {
    console.log('\nAll files up to date!');
  } else {
    console.log(`\n${toDownload.length} file(s) to download:\n`);
    for (const file of toDownload) {
      const destPath = path.join(maplePath, file.name);
      console.log(`Downloading ${file.name} (${(file.size / 1024 / 1024).toFixed(1)} MB)...`);
      try {
        await downloadFile(`${serverUrl}/files/${file.name}`, destPath, file.size);
        // Verify download integrity
        const dlHash = await hashFile(destPath);
        if (dlHash !== file.sha256) {
          console.error(`  HASH MISMATCH! Expected ${file.sha256.slice(0,16)}... got ${dlHash.slice(0,16)}...`);
          console.error(`  File may be corrupted. Re-run the patcher.`);
        } else {
          console.log(`  Done! (verified)`);
        }
      } catch (err) {
        console.error(`  FAILED: ${err.message}`);
        console.error(`  You may need to re-run the patcher.`);
      }
    }
    console.log('\nUpdate complete!');
  }

  // Launch game
  console.log('\nPress any key to launch game...');
  await new Promise(r => { process.stdin.setRawMode(true); process.stdin.resume(); process.stdin.once('data', r); });
  launchGame();
}

function launchGame() {
  const exePath = path.join(maplePath, mapleExe);
  if (!fs.existsSync(exePath)) {
    console.log(`\nGame exe not found: ${exePath}`);
    console.log('Press any key to exit...');
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.once('data', () => process.exit(0));
    return;
  }

  console.log(`\nLaunching ${mapleExe}...`);
  const child = spawn(exePath, [], {
    cwd: maplePath,
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  setTimeout(() => process.exit(0), 1000);
}

function waitForKey(msg = 'Press any key to exit...') {
  console.log(`\n${msg}`);
  process.stdin.setRawMode(true);
  process.stdin.resume();
  process.stdin.once('data', () => process.exit(0));
}

process.on('uncaughtException', (err) => {
  console.error('\n\nUNCAUGHT ERROR:', err.message);
  console.error(err.stack);
  waitForKey();
});

run().catch(err => {
  console.error('Fatal:', err.message);
  console.error(err.stack);
  waitForKey();
});
