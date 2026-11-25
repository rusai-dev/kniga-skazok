'use strict';

const assert = require('node:assert/strict');
const {digest, newer, validateProof, validateRun, expectedJobs, rollbackAllowed, visualLimit, checkLive, PublishedIntegrityError} = require('../tools/release-guard.cjs');

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

// Exercise the actual workflow authorization shell, not a duplicate policy.
{
  const fs = require('node:fs'), path = require('node:path'), os = require('node:os');
  const {spawnSync} = require('node:child_process');
  const yaml = fs.readFileSync(path.join(__dirname, '../.github/workflows/release.yml'), 'utf8');
  const section = yaml.split('      - name: Авторизованная команда\n')[1].split('      - uses: actions/checkout@v4')[0];
  const shell = section.split('        run: |\n')[1].split('\n').map(line=>line.replace(/^ {10}/,'')).join('\n');
  assert.ok(shell.includes('ISSUE_TITLE') && shell.includes('GITHUB_RUN_ATTEMPT'));
  assert.equal(spawnSync('bash',['-n','-c',shell]).status,0);
  const dir=fs.mkdtempSync(path.join(os.tmpdir(),'release-request-'));
  try {
    const env={...process.env,GITHUB_EVENT_NAME:'issues',GITHUB_RUN_ATTEMPT:'1',
      COMMAND:'Публикуй',OWNER:'rusai-dev',ACTOR:'rusai-dev',TRIGGER:'rusai-dev',
      ISSUE_AUTHOR:'rusai-dev',ISSUE_SENDER:'rusai-dev',ISSUE_BODY:'Release Guard owner command v1',
      ISSUE_TITLE:'Публикуй: '+sha,EXPECTED_SHA:'',GITHUB_SHA:sha,GITHUB_REF:'refs/heads/main',
      GITHUB_OUTPUT:path.join(dir,'output'),GITHUB_STEP_SUMMARY:path.join(dir,'summary')};
    const runAuth=override=>spawnSync('bash',['-c',shell],{env:{...env,...override},encoding:'utf8'}).status;
    assert.equal(runAuth({}),0,'Owner exact SHA release');
    assert.equal(runAuth({COMMAND:'Проверь',ISSUE_TITLE:'Проверь: '+sha}),0,'Read-only diagnostic');
    for(const override of [{ACTOR:'other'},{TRIGGER:'other'},{ISSUE_AUTHOR:'other'},{ISSUE_SENDER:'other'},
      {ISSUE_TITLE:'Публикуй: '+oldSha},{ISSUE_TITLE:'Публикуй: '+sha+' extra'},
      {ISSUE_BODY:'other'},{GITHUB_RUN_ATTEMPT:'2'},{GITHUB_REF:'refs/heads/other'}])
      assert.notEqual(runAuth(override),0,'Reject '+JSON.stringify(override));
    assert.equal(runAuth({GITHUB_EVENT_NAME:'workflow_dispatch',EXPECTED_SHA:sha}),0,'Existing manual path');
    assert.notEqual(runAuth({GITHUB_EVENT_NAME:'workflow_dispatch',EXPECTED_SHA:oldSha}),0,'Existing stale SHA block');
  } finally {fs.rmSync(dir,{recursive:true,force:true})}
}

async function verifyPublishedIntegrity() {
  const original = global.fetch;
  try {
    global.fetch = async url=>new Response(new URL(url).pathname.slice(1)||'index.html');
    await checkLive(candidate, 'https://example.test/', true);
    global.fetch = async ()=>new Response('damaged');
    await assert.rejects(checkLive(candidate, 'https://example.test/'), PublishedIntegrityError);
    global.fetch = async ()=>new Response(null, {status:404});
    await assert.rejects(checkLive(candidate, 'https://example.test/'), PublishedIntegrityError);
    global.fetch = async ()=>new Response(null, {status:503});
    await assert.rejects(checkLive(candidate, 'https://example.test/'), error=>!(error instanceof PublishedIntegrityError));
  } finally {global.fetch = original}
}
verifyPublishedIntegrity().then(()=>console.log('PASS release guard version, proof, stale candidate, coverage, integrity and rollback policy'))
  .catch(error=>{console.error(error);process.exitCode=1});
