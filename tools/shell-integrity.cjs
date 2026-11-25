'use strict';

const fs = require('node:fs');
const path = require('node:path');
const {createHash} = require('node:crypto');
const digest = bytes => createHash('sha256').update(bytes).digest('hex');
const marker = /\/\/ BEGIN GENERATED SHELL INTEGRITY[\s\S]*?\/\/ END GENERATED SHELL INTEGRITY/;

function shellDefinition(source) {
  // Only the repository's own service worker is evaluated. Event handlers are not run.
  const scope = 'https://shell.invalid/kniga-skazok/';
  const read = new Function('self', source + '\nreturn {REV, RELEASE_URLS, SHELL_FINGERPRINT};');
  const worker = read({registration: {scope}, addEventListener() {}});
  return {
    version: worker.REV,
    fingerprint: worker.SHELL_FINGERPRINT,
    resources: worker.RELEASE_URLS.map(url => url.slice(scope.length))
  };
}

function buildShellIntegrity(source, readResource) {
  if (!marker.test(source)) throw Error('Integrity marker is missing in sw.js');
  const {version, resources} = shellDefinition(source);
  const targets = new Map(resources.map(url => [url, readResource(url.split('?')[0])]));
  if (!targets.get('index.html').toString().includes('<footer>Книга сказок · версия ' + version + '</footer>')) {
    throw Error('HTML and service worker versions differ');
  }
  const checksums = Object.fromEntries([...targets].map(([url, bytes]) => [url, digest(bytes)]));
  const fingerprint = digest(JSON.stringify(checksums)).slice(0, 24);
  return source.replace(marker, [
    '// BEGIN GENERATED SHELL INTEGRITY',
    `const SHELL_FINGERPRINT='${fingerprint}';`,
    'const SHELL_SHA256=' + JSON.stringify(checksums, null, 2) + ';',
    '// END GENERATED SHELL INTEGRITY'
  ].join('\n'));
}

function releaseSources(html, worker, version) {
  if (!/^[0-9]+\.[0-9]+\.[0-9]+$/.test(version)) throw Error('Invalid release.json version');
  const token = '[0-9]+\\.[0-9]+\\.[0-9]+';
  const replace = (source, prefix, flags = '') => source.replace(new RegExp('(' + prefix + ')' + token, flags), (_whole, start) => start + version);
  let nextHtml = replace(html, "const APP_RELEASE='");
  nextHtml = replace(nextHtml, 'Книга сказок · версия ');
  nextHtml = replace(nextHtml, 'id="currentRelease">Версия на устройстве: ');
  nextHtml = replace(nextHtml, 'class="release-version-label">v');
  nextHtml = replace(nextHtml, '[?]v=|_nav=', 'g');
  return {html: nextHtml, worker: replace(worker, "const REV='")};
}

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const file = path.join(root, 'sw.js');
  const htmlFile = path.join(root, 'index.html');
  const source = fs.readFileSync(file, 'utf8'), html = fs.readFileSync(htmlFile, 'utf8');
  const {version} = JSON.parse(fs.readFileSync(path.join(root, 'release.json')));
  const synced = releaseSources(html, source, version);
  const sync = process.argv.includes('--sync-version');
  const check = process.argv.includes('--check');
  if (!sync && (synced.html !== html || synced.worker !== source)) {
    throw Error('Runtime version differs from release.json. Run node tools/shell-integrity.cjs --sync-version');
  }
  const next = buildShellIntegrity(synced.worker, name => name === 'index.html'
    ? Buffer.from(synced.html) : fs.readFileSync(path.join(root, name)));
  if (check) {
    if (next !== source || synced.html !== html) throw Error('Shell integrity or release version is out of date');
  } else {
    if (synced.html !== html) fs.writeFileSync(htmlFile, synced.html);
    if (next !== source) fs.writeFileSync(file, next);
  }
}

module.exports = {buildShellIntegrity, shellDefinition, releaseSources};
