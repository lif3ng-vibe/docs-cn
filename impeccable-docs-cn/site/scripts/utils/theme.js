// Theme switcher — three-way: dark / light / auto with localStorage persistence.
// Dark is the first-visit default. Auto remains an explicit choice and follows
// the OS via prefers-color-scheme. Clicking cycles dark → light → auto → dark.

const STORAGE_KEY = 'impeccable-theme';

export function getStoredPref() {
  const v = localStorage.getItem(STORAGE_KEY);
  return v === 'light' || v === 'dark' || v === 'auto' ? v : 'dark';
}

export function setStoredPref(pref) {
  localStorage.setItem(STORAGE_KEY, pref);
}

function systemTheme() {
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches
    ? 'light'
    : 'dark';
}

export function resolveTheme(pref) {
  return pref === 'auto' ? systemTheme() : pref;
}

const LABELS = {
  dark: '主题：深色。点击切换到浅色模式。',
  light: '主题：浅色。点击切换到自动模式。',
  auto: '主题：自动，跟随系统。点击切换到深色模式。',
};

const TITLES = {
  auto: '主题：自动（跟随系统）',
  light: '主题：浅色',
  dark: '主题：深色',
};

export function applyTheme(pref) {
  const html = document.documentElement;
  const resolved = resolveTheme(pref);

  html.classList.remove('light', 'dark');
  html.classList.add(resolved);
  html.setAttribute('data-theme-pref', pref);

  const meta = document.querySelector('meta[name="theme-color"]');
  if (meta) {
    meta.setAttribute('content', resolved === 'light' ? '#f7f4ef' : '#010101');
  }

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.setAttribute('aria-label', LABELS[pref]);
    btn.setAttribute('title', TITLES[pref]);
  });
}

export function nextPref(pref) {
  return pref === 'dark' ? 'light' : pref === 'light' ? 'auto' : 'dark';
}

export function initThemeToggle() {
  applyTheme(getStoredPref());

  // While in auto, follow the OS as it flips.
  if (window.matchMedia) {
    const mq = window.matchMedia('(prefers-color-scheme: light)');
    const onChange = () => {
      if (getStoredPref() === 'auto') applyTheme('auto');
    };
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else if (mq.addListener) mq.addListener(onChange);
  }

  document.querySelectorAll('[data-theme-toggle]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const next = nextPref(getStoredPref());
      setStoredPref(next);
      applyTheme(next);
    });
  });
}
