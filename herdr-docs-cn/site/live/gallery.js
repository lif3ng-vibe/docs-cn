import { reconcileCommunity } from './gallery-cards.js';

(() => {
  const $ = id => document.getElementById(id);
  const grid = $('grid'), q = $('q'), sort = $('sort'), drawer = $('drawer');
  const cards = [...grid.children];
  let type = 'layouts', filter = 'community', returnFocus;
  const within = selector => drawer.querySelector(selector);
  const fromURL = () => new URL(location.href).searchParams.get('type') === 'mods' ? 'mods' : 'layouts';
  function apply() {
    const text = q.value.trim().toLowerCase();
    cards.forEach(card => { card.hidden = card.dataset.type !== type || card.dataset.kind !== filter || !card.dataset.text.includes(text); });
    $('empty').hidden = cards.some(card => !card.hidden);
    const by = sort.value === 'new' ? (a, b) => b.dataset.updated.localeCompare(a.dataset.updated) : (a, b) => Number(b.dataset.stars) - Number(a.dataset.stars);
    cards.sort((a, b) => Number(a.classList.contains('text')) - Number(b.classList.contains('text')) || by(a, b)).forEach(card => grid.append(card));
    for (const kind of ['community', 'example']) $(kind === 'community' ? 'n-community' : 'n-examples').textContent = cards.filter(card => card.dataset.type === type && card.dataset.kind === kind).length;
  }
  function sync() {
    type = fromURL();
    document.querySelectorAll('button[data-type]').forEach(button => {
      const on = button.dataset.type === type; button.classList.toggle('on', on); button.setAttribute('aria-selected', String(on));
    });
    $('gallery-heading').textContent = type === 'layouts' ? 'Whole new windows.' : 'Pieces for your window.';
    $('gallery-description').textContent = type === 'layouts'
      ? 'A layout is a whole window: what goes where and how it looks. Copy one line and your agent adds it next to yours. Yours stays as it is.'
      : 'A mod is a piece you add to the layout you have, like a key prefix or a panel. Copy one line and your agent adds it to yours.';
    q.placeholder = `Search ${type}`;
    document.querySelectorAll('[data-share]').forEach(section => { section.hidden = section.dataset.share !== type; });
    apply();
    const card = history.state?.galleryCard && cards.find(c => c.dataset.key === history.state.galleryCard);
    if (card) openCard(card, false); else hideCard();
  }
  document.querySelectorAll('button[data-type]').forEach(button => button.onclick = () => {
    const url = new URL(location.href);
    if (button.dataset.type === 'mods') url.searchParams.set('type', 'mods'); else url.searchParams.delete('type');
    if (url.href !== location.href) history.pushState({}, '', url);
    sync();
  });
  document.querySelectorAll('[data-filter]').forEach(button => button.onclick = () => {
    filter = button.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(other => { const on = button === other; other.classList.toggle('on', on); other.setAttribute('aria-selected', String(on)); });
    apply();
  });
  // Tab groups also work without a pointer.
  document.querySelectorAll('[role=tablist]').forEach(group => group.onkeydown = event => {
    if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault(); const buttons = [...group.querySelectorAll('button')], at = buttons.indexOf(document.activeElement);
    const next = event.key === 'Home' ? 0 : event.key === 'End' ? buttons.length - 1 : (at + (event.key === 'ArrowRight' ? 1 : -1) + buttons.length) % buttons.length;
    buttons[next].focus(); buttons[next].click();
  });
  q.oninput = apply; sort.onchange = apply;
  addEventListener('keydown', event => {
    if (event.key === '/' && !drawer.open && !/INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName)) { event.preventDefault(); q.focus(); }
  });
  document.addEventListener('click', async event => {
    const button = event.target.closest('[data-copy]');
    if (!button) return;
    try {
      await navigator.clipboard.writeText(button.dataset.copy);
      const label = button.dataset.label ??= button.textContent;
      button.textContent = 'Copied'; setTimeout(() => { button.textContent = label; }, 1400);
    } catch { button.textContent = 'Copy failed'; }
  });
  function openCard(card, push = true) {
    const d = card.dataset;
    within('.crumb').textContent = `${d.type} / ${d.owner}`;
    within('h3').textContent = d.name;
    within('.dby img').src = `https://github.com/${encodeURIComponent(d.owner)}.png?size=64`;
    within('.dby .o').textContent = d.owner;
    within('.dby .s').textContent = Number(d.stars) > 0 ? `★ ${d.stars}` : '';
    within('.full').hidden = !d.pic;
    if (d.pic) { within('.full img').src = d.pic; within('.full img').alt = d.name; } else within('.full img').removeAttribute('src');
    within('.dblurb').textContent = d.blurb;
    within('.dadd code').textContent = d.line;
    within('.dadd button').dataset.copy = d.line;
    within('.gh').href = d.gh;
    within('.page').hidden = !d.page;
    if (d.page) within('.page').href = d.page; else within('.page').removeAttribute('href');
    const reset = !drawer.open || returnFocus !== card;
    if (!drawer.open) drawer.showModal();
    returnFocus = card;
    if (reset) drawer.scrollTop = 0;
    document.documentElement.classList.add('drawer-open');
    document.documentElement.style.overflow = 'hidden';
    if (reset) within('#dclose').focus({ preventScroll: true });
    if (push) history.pushState({ ...history.state, galleryCard: d.key }, '');
  }
  function hideCard() {
    if (drawer.open) { drawer.close(); (returnFocus?.isConnected ? returnFocus : q).focus({ preventScroll: true }); }
    document.documentElement.classList.remove('drawer-open');
    document.documentElement.style.overflow = '';
  }
  function closeCard() { if (history.state?.galleryCard) history.back(); else hideCard(); }
  grid.addEventListener('click', event => { const card = event.target.closest('.card'); if (card) openCard(card); });
  grid.addEventListener('keydown', event => {
    const card = event.target.closest('.card');
    if (card && (event.key === 'Enter' || event.key === ' ')) { event.preventDefault(); openCard(card); }
  });
  $('dclose').onclick = closeCard;
  drawer.addEventListener('cancel', event => { event.preventDefault(); closeCard(); });
  drawer.addEventListener('click', event => {
    const r = drawer.getBoundingClientRect();
    if (event.target === drawer && (event.clientX < r.left || event.clientX > r.right || event.clientY < r.top || event.clientY > r.bottom)) closeCard();
  });
  addEventListener('popstate', sync);
  sync();

  const element = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };
  const pages = new Map(cards.filter(card => card.dataset.page).map(card => [card.dataset.key, card.dataset.page]));
  function renderCard(data, card) {
    if (!card) { card = element('div'); card.hidden = true; grid.append(card); }
    card.className = data.pic ? 'card' : 'card text'; card.role = 'button'; card.tabIndex = 0;
    Object.assign(card.dataset, data);
    const shot = element('div', data.pic ? 'shot' : 'shot none');
    if (data.pic) {
      const image = element('img'); image.loading = 'lazy'; image.src = data.pic; image.alt = ''; image.width = 960; image.height = 600; shot.append(image);
    } else shot.append(element('p', '', data.blurb));
    const meta = element('div', 'meta'), avatar = element('img', 'av'), who = element('div', 'who');
    avatar.loading = 'lazy'; avatar.src = `https://github.com/${encodeURIComponent(data.owner)}.png?size=64`; avatar.alt = ''; avatar.width = avatar.height = 32;
    who.append(element('b', '', data.name), element('span', '', data.owner)); meta.append(avatar, who);
    if (Number(data.stars) > 0) meta.append(element('span', 'stars', `★ ${data.stars}`));
    card.replaceChildren(shot, meta);
    return card;
  }
  function reconcile(kind, listings) {
    reconcileCommunity(cards, kind, listings, pages, renderCard);
    apply();
    if (drawer.open) {
      const active = cards.find(card => card.dataset.key === history.state?.galleryCard);
      if (active) openCard(active, false);
      else {
        const { galleryCard, ...state } = history.state || {};
        history.replaceState(state, ''); hideCard();
      }
    }
  }
  for (const kind of ['layouts', 'mods']) fetch(`${['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '/gallery-index' : 'https://assets.herdr.dev'}/${kind}/index.json`)
    .then(response => { if (!response.ok) throw new Error('Index unavailable'); return response.json(); })
    .then(index => reconcile(kind, index[kind]))
    .catch(() => {});
})();
