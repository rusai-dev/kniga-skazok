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

if (require.main === module) {
  const root = path.resolve(__dirname, '..');
  const file = path.join(root, 'sw.js');
  const source = fs.readFileSync(file, 'utf8');
  const next = buildShellIntegrity(source, name => fs.readFileSync(path.join(root, name)));
  if (process.argv.includes('--check')) {
    if (next !== source) throw Error('Shell integrity is out of date. Run node tools/shell-integrity.cjs');
  } else if (next !== source) {
    fs.writeFileSync(file, next);
  }
}

module.exports = {buildShellIntegrity, shellDefinition};
