'use strict';

const assert = require('node:assert/strict');
const {digest, newer, validateProof, validateRun, expectedJobs, rollbackAllowed, visualLimit} = require('../tools/release-guard.cjs');

const {releaseSources} = require('../tools/shell-integrity.cjs');
const synced = releaseSources("const APP_RELEASE='1.5.208'; a?v=1.5.208; Книга сказок · версия 1.5.208", "const REV='1.5.208';", '1.5.209');
assert.deepEqual(synced, {html: "const APP_RELEASE='1.5.209'; a?v=1.5.209; Книга сказок · версия 1.5.209", worker: "const REV='1.5.209';"});
assert.throws(() => releaseSources('', '', 'invalid'));

const repository = 'rusai-dev/kniga-skazok';
const sha = 'a'.repeat(40), oldSha = 'b'.repeat(40);
const files = Object.fromEntries(['index.html', 'release.json', 'studio-layout.css', 'sw.js',
  'studio-engine-208.js', 'studio-project-store.js'].map(file => [file, digest(file)]));
const candidate = {schema: 1, sha, version: '1.5.209', build: digest(JSON.stringify(files)), files};
const stable = {...candidate, sha: oldSha, version: '1.5.208'};
const run = {name: 'Quality checks', path: '.github/workflows/quality.yml', head_repository: {full_name: repository},
  head_sha: sha, event: 'workflow_dispatch', status: 'completed', conclusion: 'success'};
const jobs = expectedJobs(true).map(name => ({name, conclusion: 'success'}));

assert.ok(newer('1.5.210', '1.5.209'));
assert.ok(newer('1.6.0', '1.5.209'));
assert.ok(!newer('1.5.208', '1.5.209'));
assert.ok(!newer('1.5.209','1.5.209'));
assert.throws(() => newer('1.05.209', '1.5.208'));
assert.equal(validateProof(candidate), candidate);
assert.throws(() => validateProof({...candidate, files: {...files, 'sw.js': 'f'.repeat(64)}}), /digest mismatch/);
const badFiles = {...files, 'assets/../personal.json': files['sw.js']};
assert.throws(() => validateProof({...candidate, files: badFiles, build: digest(JSON.stringify(badFiles))}), /Invalid runtime manifest/);
validateRun(run, jobs, sha, repository);
validateRun({...run, event: 'push', head_branch: 'main'}, jobs, sha, repository);
assert.throws(() => validateRun({...run, head_sha: oldSha}, jobs, sha, repository), /Stale candidate/);
assert.throws(() => validateRun({...run, head_repository: {full_name: 'other/repo'}}, jobs, sha, repository));
assert.throws(() => validateRun({...run, event: 'pull_request'}, jobs, sha, repository), /exact candidate run/);
validateRun({...run, event: 'pull_request'}, jobs, sha, repository, true);
assert.throws(() => validateRun({...run, event: 'pull_request', head_repository: {full_name: 'other/repo'}}, jobs, sha, repository, true));
assert.throws(() => validateRun({...run, event: 'push', head_branch: 'other'}, jobs, sha, repository), /exact candidate run/);
assert.throws(() => validateRun({...run, conclusion: 'cancelled'}, jobs, sha, repository));
assert.throws(() => validateRun(run, jobs.filter(job => job.name !== 'screens (webkit, mobile)'), sha, repository), /Missing successful job/);
assert.throws(() => validateRun(run, [...jobs, jobs[0]], sha, repository), /Missing successful job/);
assert.ok(rollbackAllowed(candidate, stable));
assert.ok(!rollbackAllowed({...candidate, version: '1.5.210'}, stable));
assert.ok(!rollbackAllowed(candidate, {...stable, files: {...files, 'studio-project-store.js': digest('changed')}}));
assert.equal(visualLimit('1.5.208','1.5.209','shelf.png',844,390),25);
assert.ok(22 > visualLimit('1.5.208','1.5.210','shelf.png',844,390));
assert.ok(0.7 > visualLimit('1.5.208','1.5.209','canvas.png',844,390));
assert.equal(visualLimit('1.5.208','1.5.209','egypt-cat.png',844,390),0);
console.log('PASS release guard version, proof, stale candidate, coverage and rollback policy');
