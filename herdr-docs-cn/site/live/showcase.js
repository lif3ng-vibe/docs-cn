(() => {
  const { picks, looks } = JSON.parse(document.getElementById('showcase-data').textContent);
  const $ = id => document.getElementById(id);
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const box = $('showcase-box');
  let at = 0;
  function show(index) {
    at = (index + picks.length) % picks.length;
    const p = picks[at];
    // The img keeps showing the last picture until a new src loads, so start
    // from the tile (already on screen, so cached) and swap in the full size
    // once it's ready, unless another window was opened meanwhile.
    const img = $('box-image'), full = `/showcase/${p.id}.webp`;
    img.src = `/showcase/${p.id}-tile.webp`;
    const pre = new Image();
    pre.onload = () => { if (picks[at] === p) img.src = full; };
    pre.src = full;
    $('box-image').alt = `${p.name} by ${p.owner}`;
    $('box-name').textContent = p.name;
    $('box-avatar').src = `https://github.com/${encodeURIComponent(p.owner)}.png?size=44`;
    $('box-owner').textContent = p.owner;
    $('box-count').textContent = `${at + 1} / ${picks.length}`;
    $('box-get').href = p.url;
    if (!box.open) { box.showModal(); document.documentElement.style.overflow = 'hidden'; }
  }
  document.querySelector('.wall-hero').addEventListener('click', event => {
    const tile = event.target.closest('[data-i]');
    if (tile) show(Number(tile.dataset.i));
  });
  $('box-prev').onclick = () => show(at - 1);
  $('box-next').onclick = () => show(at + 1);
  $('box-close').onclick = () => box.close();
  $('box-image').onclick = () => box.close();
  box.addEventListener('click', event => { if (event.target === box) box.close(); });
  box.addEventListener('close', () => { document.documentElement.style.overflow = ''; });
  box.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
      event.preventDefault(); show(at + (event.key === 'ArrowRight' ? 1 : -1));
    }
  });

  const touchColumns = new Map();
  $('mobile-wall').addEventListener('touchstart', event => {
    for (const touch of event.changedTouches) {
      const col = touch.target.closest('.tile')?.closest('.col');
      if (col) { touchColumns.set(touch.identifier, col); col.classList.add('touched'); }
    }
  }, { passive: true });
  function releaseTouches(event) {
    for (const touch of event.changedTouches) {
      const col = touchColumns.get(touch.identifier);
      touchColumns.delete(touch.identifier);
      if (col && ![...touchColumns.values()].includes(col)) col.classList.remove('touched');
    }
  }
  $('mobile-wall').addEventListener('touchend', releaseTouches, { passive: true });
  $('mobile-wall').addEventListener('touchcancel', releaseTouches, { passive: true });
  addEventListener('blur', () => {
    touchColumns.forEach(col => col.classList.remove('touched')); touchColumns.clear();
  });

  addEventListener('DOMContentLoaded', () => {
    const ask = $('look-ask'), txt = ask.querySelector('.txt');
    const buttons = [...$('try').querySelectorAll('[data-look]')];
    const ui = HerdrLook.mount($('live'), { look: 'herdr' });
    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
    let current = 'herdr', busy = false, seen = false;
    async function remake(id) {
      if (busy || id === current) return;
      busy = true; current = id;
      const r = ask.getBoundingClientRect();
      if (r.top < 0 || r.bottom > innerHeight) ask.scrollIntoView({ behavior: reduced.matches ? 'instant' : 'smooth', block: 'center' });
      buttons.forEach(button => {
        const on = button.dataset.look === id;
        button.classList.toggle('on', on); button.setAttribute('aria-pressed', String(on));
      });
      const prompt = looks.find(look => look[0] === id)[2];
      txt.replaceChildren(); ask.classList.add('show');
      if (!reduced.matches) {
        const cursor = document.createElement('span'); cursor.className = 'cur';
        const text = document.createTextNode(''); txt.append(text, cursor);
        await sleep(250);
        for (let i = 1; i <= prompt.length; i++) { text.textContent = prompt.slice(0, i); await sleep(30 + Math.random() * 35); }
        await sleep(400);
        const work = document.createElement('span'); work.className = 'work'; work.textContent = '✻ Remaking your app…'; txt.replaceChildren(work);
        await sleep(950);
      }
      ui.setLook(id);
      await sleep(reduced.matches ? 0 : 450);
      ask.classList.remove('show'); busy = false;
    }
    buttons.forEach(button => { button.onclick = () => remake(button.dataset.look); });
    new IntersectionObserver(([entry]) => { seen = entry.isIntersecting; }).observe($('live'));
    addEventListener('keydown', event => {
      if (!seen || box.open || event.ctrlKey || event.metaKey || event.altKey || /INPUT|TEXTAREA|SELECT/.test(document.activeElement.tagName) || document.activeElement.isContentEditable) return;
      const look = looks[Number(event.key) - 1];
      if (look) remake(look[0]);
    });
  });

  // The page ships the build-time counts. The hero counters count up to them
  // from lower down, and keep counting to the live numbers once those load.
  function countUp(el) {
    const built = Number(el.textContent);
    let shown = reduced.matches ? built : Math.round(built * 0.6);
    let frame = 0, goal = built;
    const to = (target, ms) => {
      cancelAnimationFrame(frame);
      goal = target;
      if (reduced.matches) { el.textContent = shown = target; return; }
      const from = shown, start = performance.now();
      const step = now => {
        const t = Math.min(1, (now - start) / ms);
        el.textContent = shown = Math.round(from + (target - from) * (1 - (1 - t) ** 3));
        if (t < 1) frame = requestAnimationFrame(step);
      };
      frame = requestAnimationFrame(step);
    };
    el.textContent = shown;
    to(built, 1600);
    return n => { if (n !== goal) to(n, 900); };
  }
  const counters = ['layouts', 'mods', 'people'].map(kind => countUp($(`count-${kind}`)));

  Promise.all(['layouts', 'mods'].map(async kind => {
    const response = await fetch(`${['localhost', '127.0.0.1', '[::1]'].includes(location.hostname) ? '/gallery-index' : 'https://assets.herdr.dev'}/${kind}/index.json`);
    if (!response.ok) throw new Error('Gallery index unavailable');
    return (await response.json())[kind].filter(e => e.fullName !== 'herdrdev/herdr-layout-examples');
  })).then(([layouts, mods]) => {
    const people = new Set([...layouts, ...mods].map(e => e.owner.toLowerCase())).size;
    [layouts.length, mods.length, people].forEach((n, i) => counters[i](n));
    $('feature-mod-count').textContent = mods.length;
    $('n-layouts').textContent = `${layouts.length} layouts people built →`;
    $('n-mods').textContent = `${mods.length} mods people built →`;
    $('made').hidden = false;
  }).catch(() => {});
})();
