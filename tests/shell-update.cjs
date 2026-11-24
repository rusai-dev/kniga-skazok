'use strict';

const assert = require('node:assert/strict');
const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const {buildShellIntegrity, shellDefinition} = require('../tools/shell-integrity.cjs');
const root = path.resolve(__dirname, '..');
const types = {'.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css', '.json': 'application/json', '.webp': 'image/webp'};
const libraryKey = 'skazki-library-v1';

function storedDraft(page) {
  return page.evaluate(key => {
    const library = JSON.parse(localStorage.getItem(key));
    const draft = library.drafts[library.draft.draftRef];
    return {body: draft.body, drawing: draft.studio.sheets[0].src};
  }, libraryKey);
}

function releases() {
  const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
  const sw = fs.readFileSync(path.join(root, 'sw.js'), 'utf8');
  const {version} = shellDefinition(sw);
  const versionParts = version.split('.').map(Number);
  versionParts[2]++;
  const next = versionParts.join('.');
  return [version, next].map(revision => {
    const read = name => {
      if (name === 'release.json') return JSON.stringify({version: revision});
      if (name === 'index.html') return html.replaceAll(version, revision);
      const raw = fs.readFileSync(path.join(root, name));
      if (name === 'studio-layout.css') return Buffer.concat([raw, Buffer.from('\n/* test release ' + revision + ' */')]);
      return raw;
    };
    const worker = buildShellIntegrity(sw.replace("const REV='" + version + "'", "const REV='" + revision + "'"), read);
    const {fingerprint} = shellDefinition(worker);
    return {version: revision, worker, read, cache: 'skazki-shell-' + revision + '-' + fingerprint};
  });
}

module.exports = async function verifyShellUpdate(browser) {
  const [previous, next] = releases();
  let serving = previous;
  let fault;
  let brokenRequests = 0;
  const server = http.createServer((req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    if (pathname === '/control.html') {
      res.setHeader('Content-Type', 'text/html');
      return res.end('<!doctype html><title>QA</title>');
    }
    if (!pathname.startsWith('/book/')) { res.statusCode = 404; return res.end(); }
    const name = pathname.slice('/book/'.length) || 'index.html';
    try {
      const bytes = name === 'sw.js' ? serving.worker : serving.read(name);
      const type = types[path.extname(name)] || 'application/octet-stream';
      res.setHeader('Content-Type', type);
      if (name === 'sw.js' && fault === 'quota') return res.end(bytes + `
        const putForFixture = Cache.prototype.put;
        Cache.prototype.put = async function(request, response) {
          if (String(request).includes('studio-engine-208.js')) throw new DOMException('fixture quota', 'QuotaExceededError');
          return putForFixture.call(this, request, response);
        };`);
      if (name === 'studio-layout.css' && fault) {
        brokenRequests++;
        if (fault === 'network') return res.destroy();
        if (fault === 'mime') res.setHeader('Content-Type', 'text/html');
        if (fault === 'bytes') return res.end('/* wrong stylesheet for this release */');
      }
      res.end(bytes);
    } catch (error) { res.statusCode = 404; res.end(); }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  const origin = 'http://127.0.0.1:' + server.address().port;
  const url = origin + '/book/?view=personal';
  const context = await browser.newContext({serviceWorkers: 'allow', viewport: {width: 1024, height: 768}});
  try {
    const control = await context.newPage();
    await control.goto(origin + '/control.html');
    const expectActive = async page => {
      const registration = await page.waitForFunction(async scope => {
        const reg = await navigator.serviceWorker.getRegistration(scope);
        return reg?.active?.state === 'activated' && !reg.waiting && !reg.installing;
      }, url);
      await registration.dispose();
    };
    const expectRevision = async (page, release) => {
      assert.equal(await page.locator('footer').textContent(), 'Книга сказок · версия ' + release.version);
      assert.equal(await page.evaluate(() => APP_RELEASE), release.version);
    };
    const update = async (page, outcome) => {
      const state = await page.evaluate(async () => {
        const registration = await navigator.serviceWorker.getRegistration();
        const installed = new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(Error('Worker did not settle')), 15000);
          registration.addEventListener('updatefound', () => {
            const worker = registration.installing;
            const check = () => {
              if (!['installed', 'redundant', 'activated'].includes(worker.state)) return;
              clearTimeout(timeout);
              resolve(worker.state);
            };
            worker.addEventListener('statechange', check);
            check();
          }, {once: true});
        });
        await registration.update();
        return installed;
      });
      assert.equal(state, outcome);
    };
    const page = await context.newPage();
    await page.goto(url);
    await page.evaluate(async () => {
      await navigator.serviceWorker.register('./sw.js', {updateViaCache: 'none'});
      await navigator.serviceWorker.ready;
    });
    await page.waitForFunction(() => !!navigator.serviceWorker.controller);
    await expectRevision(page, previous);
    await page.locator('#homeNewStory').click();
    await page.locator('#storyBody').fill('Синтетическая сказка для проверки обновления.');
    await page.locator('#drawStory').click();
    await page.locator('#drawingCanvas').click();
    await page.evaluate(() => {
      window.switches = 0;
      navigator.serviceWorker.addEventListener('controllerchange', () => window.switches++);
    });
    const original = await storedDraft(page);

    serving = next;
    for (fault of ['bytes', 'mime', 'network', 'quota']) {
      await update(page, 'redundant');
      assert.equal(await page.evaluate(name => caches.has(name), next.cache), false);
    }
    assert.ok(brokenRequests >= 3);
    fault = undefined;
    await update(page, 'installed');
    const sibling = await context.newPage();
    await sibling.goto(url);
    await expectRevision(sibling, previous);
    assert.equal(await page.evaluate(() => window.switches), 0);
    assert.equal(await page.locator('#storyBody').inputValue(), original.body);
    await sibling.evaluate(() => checkRelease(true));
    assert.match(await sibling.locator('#releaseText').textContent(), /закрой все вкладки/);

    // A missing file of the running version must fail closed while the server has newer bytes.
    const oldCss = './studio-layout.css?v=' + previous.version;
    const intactCss = await sibling.evaluate(async url => (await fetch(url)).text(), oldCss);
    assert.equal(intactCss, previous.read('studio-layout.css').toString());
    await sibling.evaluate(async ({name, url}) => (await caches.open(name)).delete(new URL(url, location.href)), {name: previous.cache, url: oldCss});
    assert.equal(await sibling.evaluate(async url => (await fetch(url)).status, oldCss), 503);
    // The fixture restores the verified old entry to exercise rollback without redownloading it.
    await sibling.evaluate(async ({name, url, body}) => (await caches.open(name)).put(new URL(url, location.href), new Response(body, {headers: {'Content-Type': 'text/css'}})), {name: previous.cache, url: oldCss, body: intactCss});

    await page.close();
    assert.ok(await sibling.evaluate(async () => !!(await navigator.serviceWorker.getRegistration()).waiting));
    await sibling.close();
    await expectActive(control);
    await context.setOffline(true);
    const updated = await context.newPage();
    await updated.goto(url);
    await expectRevision(updated, next);
    assert.equal(await updated.evaluate(async url => (await fetch(url)).text(), oldCss), intactCss);
    assert.deepEqual(await storedDraft(updated), original);

    await context.setOffline(false);
    serving = previous;
    fault = 'network';
    const requestsBeforeRollback = brokenRequests;
    await update(updated, 'installed');
    assert.equal(brokenRequests, requestsBeforeRollback, 'a verified rollback reuses the old shell');
    await updated.close();
    await expectActive(control);
    await context.setOffline(true);
    const rolledBack = await context.newPage();
    await rolledBack.goto(url);
    await expectRevision(rolledBack, previous);
    assert.deepEqual(await storedDraft(rolledBack), original);
  } finally {
    await context.close();
    await new Promise(resolve => server.close(resolve));
  }
  console.log('PASS G25–G28 two releases, install failures, waiting editor, verified assets, offline update and rollback');
};
