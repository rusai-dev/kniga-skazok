'use strict';

const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const {setTimeout: sleep} = require('node:timers/promises');
const {validateRun} = require('./release-guard.cjs');

const repository = 'rusai-dev/kniga-skazok';
const owner = repository.split('/')[0];
const root = 'repos/' + repository;
const [command, pullNumber, extra] = process.argv.slice(2);

function gh(args, options = {}) {
  return execFileSync('gh', args, {encoding:'utf8', timeout:45000, ...options});
}
function api(path, method = 'GET', body) {
  const args = ['api', '--method', method, path];
  if (body) args.push('--input', '-');
  const value = gh(args, body ? {input:JSON.stringify(body)} : {});
  return value ? JSON.parse(value) : null;
}
function mainSha() {
  return api(root + '/git/ref/heads/main').object.sha;
}
function runs(workflow, branch, sha) {
  const query = new URLSearchParams({branch, head_sha:sha, per_page:'30'});
  return api(root + '/actions/workflows/' + workflow + '/runs?' + query).workflow_runs;
}
async function waitFor(predicate, label, timeout = 12*60000) {
  const end = Date.now() + timeout;
  do {
    const result = predicate();
    if (result) return result;
    await sleep(8000);
  } while (Date.now() < end);
  throw Error('Истекло время ожидания: ' + label);
}
async function checkedRun(workflow, run) {
  console.log(run.html_url);
  const finished = await waitFor(()=>{
    const current = api(root + '/actions/runs/' + run.id);
    return current.status === 'completed' && current;
  }, workflow);
  assert.equal(finished.conclusion, 'success', 'Проверка завершилась с ошибкой: ' + finished.html_url);
  return finished;
}
async function checkQuality(sha, branch, allowPullRequest) {
  const relevant = run=>run.event === 'workflow_dispatch'
    || (branch === 'main' && run.event === 'push') || (allowPullRequest && run.event === 'pull_request');
  const selected = await waitFor(()=>runs('quality.yml', branch, sha).find(relevant), 'автоматический CI ' + sha, 90000);
  const run = await checkedRun('Quality checks', selected);
  const {jobs} = api(root + `/actions/runs/${run.id}/attempts/${run.run_attempt}/jobs?per_page=100`);
  validateRun(run, jobs, sha, repository, allowPullRequest);
}
async function dispatch(operation, ref, sha) {
  const title = operation + ' · Release Guard';
  const matching = ()=>runs('release.yml', ref, sha).filter(run=>run.event === 'workflow_dispatch' && run.display_title === title);
  const recent = matching();
  const active = recent.find(run=>run.status !== 'completed');
  if (active) return checkedRun('Release Guard', active);
  const known = new Set(recent.map(run=>run.id));
  api(root + '/actions/workflows/release.yml/dispatches', 'POST', {ref, inputs:{operation,expected_sha:sha}});
  const run = await waitFor(()=>matching().find(value=>!known.has(value.id)), 'новый запуск Release Guard', 90000);
  return checkedRun('Release Guard', run);
}
function readPull() {
  const pull = api(root + '/pulls/' + pullNumber);
  assert.equal(pull.base.ref, 'main');
  assert.equal(pull.head.repo?.full_name, repository);
  return pull;
}
async function release() {
  assert.ok(['Публикуй','Проверь','Восстанови'].includes(command) && !extra, 'Использование: Публикуй <PR>, Проверь [PR], Восстанови');
  assert.ok(!pullNumber || /^[1-9]\d*$/.test(pullNumber), 'Укажи номер pull request');
  assert.ok(command !== 'Восстанови' || !pullNumber, 'Восстановление выбирает текущий рабочий выпуск');
  if (command === 'Проверь' && !pullNumber) return dispatch(command, 'main', mainSha());
  if (command !== 'Проверь') {
    assert.equal(api('user').login, owner, 'Нужна действующая авторизация владельца GitHub');
    assert.equal(api(root + '/pages').build_type, 'workflow', 'Источник Pages должен быть GitHub Actions');
  }
  if (command === 'Восстанови') return dispatch(command, 'main', mainSha());
  assert.ok(pullNumber, 'Для публикации укажи pull request кандидата');
  const pull = readPull();
  const {sha,ref} = pull.head;
  if (command === 'Проверь') {
    assert.equal(pull.state, 'open', 'Кандидат должен быть открыт');
    await checkQuality(sha, ref, true);
    return dispatch(command, ref, sha);
  }
  let mergedSha = pull.merge_commit_sha;
  if (!pull.merged) {
    assert.equal(pull.state, 'open', 'Кандидат должен быть открыт');
    await checkQuality(sha, ref, true);
    const base = mainSha();
    const comparison = api(root + `/compare/${base}...${sha}`);
    assert.equal(comparison.merge_base_commit.sha, base, 'Кандидат должен включать действующий main');
    assert.equal(readPull().head.sha, sha, 'SHA кандидата изменился');
    if (pull.draft) gh(['pr','ready',pullNumber,'--repo',repository]);
    assert.equal(mainSha(), base, 'Ветка main изменилась');
    const merge = api(root + '/pulls/' + pullNumber + '/merge', 'PUT', {sha, merge_method:'merge'});
    assert.ok(merge.merged, merge.message);
    mergedSha = merge.sha;
  }
  assert.equal(mainSha(), mergedSha, 'Итоговый SHA PR должен быть вершиной main');
  await checkQuality(mergedSha, 'main', false);
  assert.equal(mainSha(), mergedSha, 'Ветка main изменилась после тестирования');
  return dispatch(command, 'main', mergedSha);
}

release().catch(error=>{console.error('ЗАБЛОКИРОВАНО', error.message);process.exitCode=1});
