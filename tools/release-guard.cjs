'use strict';

const assert = require('node:assert/strict');
const { execFileSync } = require('node:child_process');
const { createHash } = require('node:crypto');
const fs = require('node:fs');
const path = require('node:path');

const SITE = 'https://rusai-dev.github.io/kniga-skazok/';
const BOOTSTRAP = '3f24ecb06db8adc678fbbc2d91d1107e00bdca21';
const PROOF = 'release-proof.json';
const REQUIRED = ['index.html', 'release.json', 'sw.js', 'studio-layout.css', 'studio-engine-208.js', 'studio-project-store.js'];
const SMOKE = ['studio', 'storage', 'offline', 'viewport', 'portrait', 'landscape'];
const SHA = /^[a-f0-9]{40}$/;
const HASH = /^[a-f0-9]{64}$/;
const VERSION = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/;
const MAX_PACKAGE = 64 * 1024 * 1024;

const digest = bytes => createHash('sha256').update(bytes).digest('hex');
function output(name, value) {
  if (process.env.GITHUB_OUTPUT) fs.appendFileSync(process.env.GITHUB_OUTPUT, `${name}=${value}\n`);
}
function git(...args) {
  return execFileSync('git', ['-c', 'safe.directory=' + process.cwd(), ...args], {maxBuffer: MAX_PACKAGE});
}
function publishable(file) {
  return /^[a-zA-Z0-9._/-]+$/.test(file) && !file.split('/').some(piece => !piece || piece === '..' || piece === '.')
    && (file === '.nojekyll' || file === 'PEERJS-LICENSE.txt' || file === 'family-cloud-config.json'
      || file === 'release.json' || /^[\w.-]+\.(html|css|js)$/.test(file) || /^(assets|content)\//.test(file));
}
function versionParts(version) {
  assert.match(version, VERSION);
  const parts = version.split('.').map(Number);
  assert.ok(parts.every(Number.isSafeInteger), 'Invalid release version');
  return parts;
}
function newer(candidate, stable) {
  const left = versionParts(candidate), right = versionParts(stable);
  const i = left.findIndex((part, index) => part !== right[index]);
  return i !== -1 && left[i] > right[i];
}
function filesOnDisk(root, prefix = '') {
  return fs.readdirSync(path.join(root, prefix), {withFileTypes: true}).flatMap(entry => {
    const name = prefix + entry.name;
    if (entry.isDirectory()) return filesOnDisk(root, name + '/');
    assert.ok(entry.isFile(), 'Unsupported file in package: ' + name);
    return [name];
  }).sort();
}
function makeProof(root, sha) {
  assert.match(sha, SHA);
  const files = filesOnDisk(root);
  assert.ok(files.every(publishable) && REQUIRED.every(file => files.includes(file)), 'Unexpected or missing runtime file');
  const read = file => fs.readFileSync(path.join(root, file));
  const {version} = JSON.parse(read('release.json'));
  versionParts(version);
  assert.ok(read('index.html').includes(Buffer.from("const APP_RELEASE='" + version + "'")), 'HTML version mismatch');
  assert.ok(read('sw.js').includes(Buffer.from("const REV='" + version + "'")), 'Worker version mismatch');
  const hashes = Object.fromEntries(files.map(file => [file, digest(read(file))]));
  return {schema: 1, sha, version, build: digest(JSON.stringify(hashes)), files: hashes};
}
function stage(sha, root) {
  assert.match(sha, SHA);
  const tree = git('ls-tree', '-rz', sha).toString().split('\0').filter(Boolean);
  const files = tree.flatMap(entry => {
    const [mode, file] = entry.split('\t');
    if (!publishable(file)) return [];
    assert.match(mode, /^100(644|755) blob [a-f0-9]{40}$/, 'Runtime entries must be ordinary blobs');
    return [file];
  });
  assert.ok(files.length && !fs.existsSync(root), 'Package directory must be new');
  fs.mkdirSync(root, {recursive: true});
  const archive = git('archive', '--format=tar', sha, '--', ...files);
  execFileSync('tar', ['-xf', '-', '-C', root], {input: archive});
  const proof = makeProof(root, sha);
  fs.writeFileSync(path.join(root, PROOF), JSON.stringify(proof, null, 2) + '\n');
  return proof;
}
function validateProof(proof) {
  assert.equal(proof?.schema, 1);
  assert.match(proof.sha, SHA);
  versionParts(proof.version);
  assert.match(proof.build, HASH);
  const keys = Object.keys(proof.files);
  assert.ok(keys.length > 0 && keys.length <= 1024 && REQUIRED.every(file => keys.includes(file)), 'Incomplete manifest');
  assert.ok(keys.every(file => publishable(file) && HASH.test(proof.files[file])), 'Invalid runtime manifest');
  assert.equal(proof.build, digest(JSON.stringify(proof.files)), 'Build manifest digest mismatch');
  return proof;
}
function verifyCheckout(proof, root) {
  validateProof(proof);
  assert.equal(git('rev-parse', 'HEAD').toString().trim(), proof.sha, 'Wrong checkout for candidate');
  for (const [file, hash] of Object.entries(proof.files)) {
    assert.equal(digest(fs.readFileSync(path.join(root, file))), hash, 'Test checkout differs from package: ' + file);
  }
}
function pack(root, dest) {
  execFileSync('tar', ['--sort=name', '--mtime=@0', '--owner=0', '--group=0', '--numeric-owner',
    '-C', root, '-cf', dest, '.'], {stdio: 'inherit'});
  return digest(fs.readFileSync(dest));
}
async function fetchPublic(site, file, token) {
  const url = new URL(file, site);
  url.searchParams.set('_release_guard', token);
  const response = await fetch(url, {cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000)});
  if (!response.ok) {
    const error = new Error(`HTTP ${response.status} ${url.pathname}`);
    error.status = response.status;
    throw error;
  }
  return response;
}
async function checkLive(proof, site = SITE, full = false, now = String(Date.now())) {
  validateProof(proof);
  const files = full ? Object.keys(proof.files).filter(file => file !== '.nojekyll') : REQUIRED;
  await Promise.all(Array.from({length: Math.min(12, files.length)}, async (_, worker) => {
    for (let i = worker; i < files.length; i += 12) {
      const file = files[i];
      const response = await fetchPublic(site, file, now);
      assert.equal(digest(Buffer.from(await response.arrayBuffer())), proof.files[file], 'Published bytes mismatch: ' + file);
    }
  }));
  const front = await fetchPublic(site, './', now);
  assert.equal(digest(Buffer.from(await front.arrayBuffer())), proof.files['index.html'], 'Homepage does not match the build');
}
async function liveIdentity(site = SITE) {
  const stamp = String(Date.now());
  const release = await (await fetchPublic(site, 'release.json', stamp)).json();
  versionParts(release.version);
  let proof;
  try {
    proof = validateProof(await (await fetchPublic(site, PROOF, stamp)).json());
  } catch (error) {
    if (error.status !== 404 || release.version !== '1.5.208') throw error;
  }
  if (proof) assert.equal(proof.version, release.version, 'Published version and proof differ');
  return {sha: proof?.sha || BOOTSTRAP, version: release.version, proof};
}
async function prepare(directory) {
  const sha = git('rev-parse', 'HEAD').toString().trim();
  const live = await liveIdentity();
  const root = path.resolve(directory);
  const stable = stage(live.sha, path.join(root, 'stable'));
  const candidate = stage(sha, path.join(root, 'candidate'));
  assert.equal(stable.version, live.version);
  if (live.proof) assert.deepEqual(stable, live.proof, 'Stable Git commit does not match the published proof');
  await checkLive(stable);
  const upgrade = newer(candidate.version, stable.version);
  if (!upgrade) assert.deepEqual(candidate.files, stable.files, 'Changed runtime requires a newer release version');
  const record = {candidate, stable, upgrade};
  fs.writeFileSync(path.join(root, 'receipt.json'), JSON.stringify(record));
  for (const [name, value] of Object.entries({sha, version: candidate.version, stable_sha: stable.sha, stable_version: stable.version, upgrade})) output(name, value);
  console.log(`ПРОВЕРКА ${candidate.version} ${candidate.sha} ${candidate.build}. База ${stable.version} ${stable.sha}.`);
}
function visualLimit(before, after, screen, width, height) {
  const defaultLimit = screen === 'egypt-cat.png' ? 0 : 0.6;
  if (before !== '1.5.208' || after !== '1.5.209') return defaultLimit;
  const limits = {
    // Reviewed new version/status controls in the parent panel.
    'parent-version.png': {'390x700': 18, '390x844': 16, '600x800': 10, '844x390': 16, tablet: 8},
    // Reviewed removal of the common owl overlay and restored theme cover.
    'shelf.png': {'390x700': 6, '390x844': 10, '600x800': 10, '844x390': 25, tablet: 9},
    // Reviewed short-landscape sizing of the shelf header and actions.
    'personal-library.png': {'844x390': 25}
  };
  const limit = limits[screen];
  return limit?.[width + 'x' + height] ?? (width >= 768 && height > 480 ? limit?.tablet : undefined) ?? defaultLimit;
}
function expectedJobs(upgrade) {
  return ['prepare', 'regression', 'release-ready', ...['chromium', 'webkit'].flatMap(engine => [
    ...SMOKE.map(shard => `browser (${engine}, ${shard})`), ...['tablet', 'mobile'].map(group => `screens (${engine}, ${group})`),
    ...(upgrade ? [`legacy-upgrade (${engine})`] : [])
  ])];
}
function validateRun(run, jobs, sha, repository) {
  assert.match(sha, SHA);
  assert.equal(run.name, 'Quality checks');
  assert.equal(run.path, '.github/workflows/quality.yml');
  assert.equal(run.head_repository?.full_name, repository);
  assert.equal(run.head_sha, sha, 'Stale candidate SHA');
  assert.ok(run.event === 'workflow_dispatch' || (run.event === 'push' && run.head_branch === 'main'), 'Expected an exact candidate run');
  assert.equal(run.status, 'completed');
  assert.equal(run.conclusion, 'success');
  for (const name of expectedJobs(true)) {
    assert.equal(jobs.filter(job => job.name === name && job.conclusion === 'success').length, 1, 'Missing successful job: ' + name);
  }
}
function checkedTar(file, hash) {
  assert.match(hash, HASH);
  assert.equal(digest(fs.readFileSync(file)), hash, 'Package tar checksum mismatch');
}
function seal(root, target) {
  const receipt = JSON.parse(fs.readFileSync(path.join(root, 'receipt.json')));
  assert.ok(receipt.upgrade, 'No new application version');
  fs.mkdirSync(target, {recursive: true});
  for (const side of ['candidate', 'stable']) {
    const dest = path.resolve(target, side + '.tar');
    receipt[side + 'Tar'] = pack(path.join(root, side), dest);
  }
  fs.writeFileSync(path.join(target, 'receipt.json'), JSON.stringify(receipt, null, 2) + '\n');
  console.log('ПОДГОТОВКА — архив ' + receipt.candidate.sha + ' ' + receipt.candidate.build);
}
async function select(directory, runFile, jobsFile, sha, repository) {
  const receipt = JSON.parse(fs.readFileSync(path.join(directory, 'receipt.json')));
  for (const side of ['candidate', 'stable']) {
    validateProof(receipt[side]);
    checkedTar(path.join(directory, side + '.tar'), receipt[side + 'Tar']);
  }
  assert.equal(receipt.candidate.sha, sha);
  assert.equal(receipt.upgrade, true);
  assert.ok(newer(receipt.candidate.version, receipt.stable.version));
  validateRun(JSON.parse(fs.readFileSync(runFile)), JSON.parse(fs.readFileSync(jobsFile)), sha, repository);
  const live = await liveIdentity();
  assert.equal(live.sha, receipt.stable.sha, 'Live base has changed');
  assert.equal(live.version, receipt.stable.version, 'Live version has changed');
  if (live.proof) assert.deepEqual(receipt.stable, live.proof, 'Rollback package differs from live proof');
  await checkLive(receipt.stable, SITE, true);
  output('version', receipt.candidate.version);
  output('build', receipt.candidate.build);
  output('rollback', rollbackAllowed(receipt.candidate, receipt.stable));
}
function rollbackAllowed(candidate, stable) {
  // The 208/209 pair shares the same project store and storage schema. Every later pair defaults to blocked.
  return candidate.version === '1.5.209' && stable.version === '1.5.208'
    && candidate.files['studio-project-store.js'] === stable.files['studio-project-store.js'];
}
async function recheck(directory, side) {
  assert.ok(['candidate', 'stable'].includes(side));
  const receipt = JSON.parse(fs.readFileSync(path.join(directory, 'receipt.json')));
  assert.equal(receipt.upgrade, true);
  for (const key of ['candidate', 'stable']) validateProof(receipt[key]);
  checkedTar(path.join(directory, side + '.tar'), receipt[side + 'Tar']);
  if (side === 'stable') assert.ok(rollbackAllowed(receipt.candidate, receipt.stable), 'Rollback data compatibility is unverified');
  const expected = receipt[side === 'candidate' ? 'stable' : 'candidate'];
  const live = await liveIdentity();
  assert.equal(live.sha, expected.sha, 'Live deployment has changed');
  assert.equal(live.version, expected.version, 'Live release has changed');
  if (live.proof) assert.deepEqual(live.proof, expected, 'Live build has changed');
  await checkLive(expected);
}
async function verifyPublished(directory, side) {
  assert.ok(['candidate', 'stable'].includes(side));
  const receipt = JSON.parse(fs.readFileSync(path.join(directory, 'receipt.json')));
  const proof = validateProof(receipt[side]);
  let failure;
  for (let attempt = 0; attempt < 10; attempt++) {
    try {
      await checkLive(proof);
      const result = await (await fetchPublic(SITE, PROOF, String(Date.now()))).json();
      assert.deepEqual(result, proof, 'Published build identity differs');
      output('version', proof.version);
      console.log(`${proof.version} ${proof.sha} ${proof.build}`);
      return;
    } catch (error) {
      failure = error;
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
  throw failure;
}

module.exports = {digest, newer, validateProof, validateRun, expectedJobs, rollbackAllowed, checkLive, visualLimit};

if (require.main === module) {
  const [command, ...args] = process.argv.slice(2);
  Promise.resolve().then(() => {
    switch (command) {
      case 'prepare': return prepare(...args);
      case 'verify': return verifyCheckout(JSON.parse(fs.readFileSync(args[0])).candidate, process.cwd());
      case 'seal': return seal(...args);
      case 'select': return select(...args);
      case 'published': return verifyPublished(...args);
      case 'recheck': return recheck(...args);
      default: throw new Error('Unknown Release Guard command');
    }
  }).catch(error => { console.error('ЗАБЛОКИРОВАНО', error.message); process.exitCode = 1; });
}
