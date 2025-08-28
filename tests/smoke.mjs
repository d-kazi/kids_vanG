import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';

const root = process.cwd();

// 1) Manifest sanity
const manifestPath = path.join(root, 'templates', 'manifest.json');
assert.ok(fs.existsSync(manifestPath), 'templates/manifest.json should exist');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
assert.ok(Array.isArray(manifest.templates), 'manifest.templates must be an array');
assert.ok(manifest.templates.length >= 1, 'manifest should list at least one template');

// 2) Each manifest entry should have required metadata and file present
for (const t of manifest.templates) {
  assert.ok(t.id && t.file, 'template entry must include id and file');
  assert.ok(typeof t.stage === 'number', 'template.stage must be a number');
  assert.ok(typeof t.difficulty === 'number', 'template.difficulty must be a number');
  assert.ok(typeof t.guideType === 'string', 'template.guideType must be a string');
  const templateFile = path.join(root, 'templates', t.file);
  assert.ok(fs.existsSync(templateFile), `template file missing: ${t.file}`);
}

// 3) Server presence
const serverFile = path.join(root, 'server.js');
assert.ok(fs.existsSync(serverFile), 'server.js should exist');

console.log('Smoke tests passed.');

