'use strict';

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const DIST_DIR = 'C:/Users/rdiol/sela/workspace/v83-client-patched';
const MANIFEST_PATH = path.join(__dirname, 'patch-manifest.json');

function hashFile(filePath) {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);
    stream.on('data', (d) => hash.update(d));
    stream.on('end', () => resolve(hash.digest('hex')));
    stream.on('error', reject);
  });
}

async function generateManifest(distDir = DIST_DIR, outputPath = MANIFEST_PATH) {
  const allFiles = fs.readdirSync(distDir).filter(f => {
    return f.endsWith('.wz') || f.endsWith('.exe') || f.endsWith('.dll') || f.endsWith('.png') || f === 'Settings';
  }).sort();

  // Load existing manifest for version tracking
  let oldManifest = null;
  let version = 0;
  if (fs.existsSync(outputPath)) {
    try {
      oldManifest = JSON.parse(fs.readFileSync(outputPath, 'utf-8'));
      version = oldManifest.version || 0;
    } catch (_) {}
  }

  const oldHashes = {};
  if (oldManifest?.files) {
    for (const f of oldManifest.files) oldHashes[f.name] = f.sha256;
  }

  console.log(`Hashing ${allFiles.length} files...`);
  const files = [];
  let changed = false;

  for (const name of allFiles) {
    const filePath = path.join(distDir, name);
    const stat = fs.statSync(filePath);
    const sha256 = await hashFile(filePath);
    files.push({ name, sha256, size: stat.size });

    if (oldHashes[name] !== sha256) {
      changed = true;
      console.log(`  [CHANGED] ${name} (${(stat.size / 1024 / 1024).toFixed(1)} MB)`);
    } else {
      console.log(`  [OK]      ${name}`);
    }
  }

  if (changed || !oldManifest) version++;

  const manifest = {
    version,
    generatedAt: new Date().toISOString(),
    files,
  };

  fs.writeFileSync(outputPath, JSON.stringify(manifest, null, 2));
  console.log(`\nManifest v${version} written (${files.length} files)`);
  return manifest;
}

module.exports = { generateManifest };

if (require.main === module) {
  generateManifest().catch(err => {
    console.error('Fatal:', err.message);
    process.exit(1);
  });
}
