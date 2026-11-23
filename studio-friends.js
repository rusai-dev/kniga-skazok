'use strict';

(() => {
  const directory = 'assets/author/friends/';
  const heroes = [
    ['squirrel','Белочка','Создание сказок', () => $('homeWrite').click()],
    ['rabbit','Зайчонок','Рисование', () => artRoom()],
    ['owl','Совёнок','Чтение и знания', () => $('readingEntry').click()],
    ['bat','Летучая мышка','Тайны ночного мира', () => world(5)],
    ['dragon','Дракончик','Фантазия и приключения', () => $('homeNewStory').click()],
    ['hedgehog','Ёжик','Моя книжная полка', () => $('homeBooks').click()],
    ['kitten','Котёнок','Путешествие в Египет', () => world(4)],
    ['raccoon','Енотик','Логика и открытия', () => $('homeLogic').click()],
    ['fawn','Оленёнок','Природа и вдохновение', () => world(1)]
  ];
  function world(area) { learningOrigin = 'home'; worldRoom(area); }
  const scenes = [1,2].flatMap(variant => heroes.map(([id,name]) => ({
    id, name, scene: id + '-scene0' + variant
  })));
  const file = (scene, small) => directory + 'hero-' + scene + (small ? '-288' : '') + '.webp';
  const key = 'skazki-friends-v1';
  let state = {};
  for (const store of ['localStorage','sessionStorage']) {
    try {
      const value = JSON.parse(window[store].getItem(key));
      if (value && typeof value === 'object' && (!state.savedAt || value.savedAt > state.savedAt)) state = value;
    } catch {}
  }
  let favorite = heroes.some(([id]) => id === state.favorite) ? state.favorite : '';
  let history = Array.isArray(state.history) ? state.history.filter(s => scenes.some(x => x.scene === s)).slice(-3) : [];
  function newQueue() {
    const ids = heroes.map(([id]) => id);
    for (let i = ids.length-1; i > 0; i--) {
      const j = Math.floor(Math.random()*(i+1));
      [ids[i],ids[j]] = [ids[j],ids[i]];
    }
    return [1,2].flatMap(n => ids.map(id => id+'-scene0'+n));
  }
  let queue = Array.isArray(state.queue) ? [...new Set(state.queue.filter(s => scenes.some(x => x.scene === s)))] : [];
  function save() {
    const value = JSON.stringify({favorite,history,queue,savedAt:Date.now()});
    for (const store of ['localStorage','sessionStorage']) {
      try { window[store].setItem(key,value); } catch {}
    }
  }
  let sequence = 0;
  async function choose() {
    const token = ++sequence;
    if (!queue.length) queue = newQueue();
    const last = history[history.length-1];
    const recentHeroes = history.map(s => s.split('-')[0]);
    const pool = favorite ? scenes.filter(x => x.id === favorite) :
      [...queue,...scenes.map(x => x.scene).filter(s => !queue.includes(s))].map(s => scenes.find(x => x.scene === s));
    const priority = x => {
      if (x.scene === last) return 4;
      if (history.includes(x.scene)) return 3;
      if (!favorite && recentHeroes.includes(x.id)) return 2;
      return 1;
    };
    const ordered = pool.slice().sort((a,b) => priority(a)-priority(b));
    for (const candidate of ordered) {
      const img = new Image();
      img.alt = candidate.name;
      img.decoding = 'async';
      img.src = file(candidate.scene,true);
      try { await img.decode(); } catch { if (token !== sequence) return; continue; }
      if (token !== sequence) return;
      img.dataset.hero = candidate.id;
      img.dataset.scene = candidate.scene;
      $('homeFox').replaceChildren(img);
      $('friendGreeting').textContent = 'Сегодня с тобой ' + candidate.name;
      history = [...history,candidate.scene].slice(-3);
      if (!favorite) queue = queue.filter(s => s !== candidate.scene);
      save();
      return;
    }
  }
  const dialog = document.createElement('dialog');
  dialog.id = 'friendsDialog';
  dialog.setAttribute('aria-labelledby','friendsTitle');
  document.body.append(dialog);
  function gallery() {
    dialog.innerHTML = '<header><h2 id="friendsTitle">Мои друзья</h2><button type="button" data-close>Закрыть</button></header><p>Выбери любимого героя или встречай нового при каждом входе.</p><button type="button" data-auto>Менять героя при входе</button><div class="friends-grid"></div>';
    const grid = dialog.querySelector('.friends-grid');
    function preferences() {
      dialog.querySelector('[data-auto]').setAttribute('aria-pressed',String(!favorite));
      for (const b of grid.querySelectorAll('[data-favorite]')) {
        b.setAttribute('aria-pressed',String(b.dataset.favorite === favorite));
        b.textContent = b.dataset.favorite === favorite ? '♥ Любимый герой' : '♡ В любимые';
      }
    }
    for (const [id,name,role,open] of heroes) {
      const card = document.createElement('article');
      const scene = id + '-scene01';
      card.innerHTML = '<a href="'+file(scene,false)+'" target="_blank" rel="noopener" aria-label="Рассмотреть: '+name+'"><img loading="lazy" decoding="async" width="120" height="120" src="'+file(scene,true)+'" alt="'+name+'"></a><h3>'+name+'</h3><button type="button" class="friend-route">'+role+' →</button><button type="button" data-favorite="'+id+'" aria-label="Любимый герой: '+name+'"></button>';
      const portrait = card.querySelector('img');
      portrait.onerror = () => {
        portrait.hidden = true;
        const fallback = document.createElement('span');
        fallback.className = 'friend-initial';
        fallback.textContent = name[0];
        portrait.after(fallback);
      };
      card.querySelector('.friend-route').onclick = () => { dialog.close(); open(); };
      card.querySelector('[data-favorite]').onclick = () => {
        if (favorite !== id) { favorite = id; save(); choose(); }
        preferences();
      };
      grid.append(card);
    }
    const bonus = document.createElement('details');
    bonus.innerHTML = '<summary>Ещё одна сказочная встреча</summary><a href="'+file('fox-scene02',false)+'" target="_blank" rel="noopener"><img loading="lazy" width="144" src="'+file('fox-scene02',true)+'" alt="Лисёнок">Лисёнок · Сказочные находки</a>';
    const art = document.createElement('details');
    art.innerHTML = '<summary>Альбом акварелей</summary>';
    for (const [id,name] of heroes) {
      const link = document.createElement('a');
      link.href = file(id+'-scene02',false);
      link.target = '_blank';
      link.rel = 'noopener';
      link.textContent = name;
      art.append(link);
    }
    bonus.insertAdjacentHTML('beforeend','<a target="_blank" rel="noopener" href="assets/author/studio/art-v02-hedgehog-fox.webp">Лисёнок и ёжик с фонарём</a>');
    dialog.append(art,bonus);
    dialog.querySelector('[data-close]').onclick = () => dialog.close();
    dialog.querySelector('[data-auto]').onclick = () => {
      if (favorite) { favorite = ''; save(); choose(); }
      preferences();
    };
    preferences();
    dialog.showModal();
  }
  // A first visit may display its image before the new worker controls the page.
  const worker = navigator.serviceWorker;
  if (worker && !worker.controller) worker.addEventListener('controllerchange', () => {
    const img = $('homeFox').querySelector('img[data-scene]');
    if (img) fetch(img.src).catch(() => {});
  }, {once:true});
  $('friendsOpen').onclick = gallery;
  $('friendsOpen').hidden = false;
  $('homePaint').onclick = artRoom;
  $('homePaint').hidden = false;
  choose();
})();
