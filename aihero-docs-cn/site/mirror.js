/* mirror.js — aihero.dev 中文镜像运行时增强
 * 职责：1) 内链点击降级为整页跳转（镜像无 RSC 端点，客户端路由会 404）
 *       2) Mux 视频替换为占位卡（保布局；hydration 后执行，无冲突）
 *       3) 拦截表单提交（订阅/购买流程未镜像）
 */
(function () {
  'use strict';
  var P = (window.__MIRROR_BASE__ || '').replace(/\/$/, '');
  var ORIGIN_SITE = 'https://www.aihero.dev';
  var origPath = location.pathname;
  if (P && origPath.indexOf(P) === 0) origPath = origPath.slice(P.length) || '/';
  var origUrl = ORIGIN_SITE + origPath + location.search;

  // ---------- 1) 内链 → 整页跳转 ----------
  function normalize(href) {
    if (href.indexOf(P + '/') === 0 || href === P) return href; // 已带前缀：原样（必须先于 '/' 分支，否则双前缀）
    if (href.charAt(0) === '/') return P + href;
    return P + '/' + href.replace(/^\.\//, '');
  }
  document.addEventListener('click', function (e) {
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    var el = e.target;
    while (el && el.nodeType === 1) {
      if (el.tagName === 'A') break;
      el = el.parentNode;
    }
    if (!el || el.nodeType !== 1 || el.tagName !== 'A') return;
    var href = el.getAttribute('href');
    if (!href || href.charAt(0) === '#') return;
    if (/^(https?:|mailto:|tel:)/i.test(href)) {
      // 指向原站的保留链接（报名/登录/支付占位）正常跳转
      return;
    }
    e.preventDefault();
    e.stopImmediatePropagation();
    location.assign(normalize(href));
  }, true);

  // ---------- 2) 视频占位 ----------
  var CSS = [
    '.aihero-cn-vph{position:relative;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:12px;',
    'width:100%;aspect-ratio:16/9;background:#141417;border:1px dashed #3f3f46;border-radius:12px;color:#a1a1aa;',
    'font-family:inherit;text-align:center;padding:16px;box-sizing:border-box}',
    '.aihero-cn-vph .ico{font-size:34px;line-height:1;opacity:.75}',
    '.aihero-cn-vph .tip{font-size:14px}',
    '.aihero-cn-vph a{color:#DD9637;font-size:13px;text-decoration:none;border:1px solid #DD9637;border-radius:8px;padding:6px 14px}',
    '.aihero-cn-vph a:hover{background:rgba(221,150,55,.12)}',
    '.aihero-cn-toast{position:fixed;left:50%;bottom:28px;transform:translateX(-50%);z-index:99999;',
    'background:#26262b;color:#e4e4e7;border:1px solid #3f3f46;border-radius:10px;padding:10px 18px;font-size:14px;',
    'box-shadow:0 8px 24px rgba(0,0,0,.35);max-width:90vw}',
  ].join('');
  var styleEl = document.createElement('style');
  styleEl.textContent = CSS;
  document.head.appendChild(styleEl);

  function makePlaceholder(watchEl) {
    var ph = document.createElement('div');
    ph.className = 'aihero-cn-vph';
    ph.innerHTML =
      '<div class="ico">▶</div>' +
      '<div class="tip">视频内容未收录进中文镜像</div>' +
      '<a href="' + origUrl + '" target="_blank" rel="noopener">前往原站观看</a>';
    return ph;
  }

  function isVideoish(el) {
    var t = el.tagName;
    return t === 'MUX-PLAYER' || t === 'VIDEO' ||
      (t === 'IFRAME' && /youtube|player\.mux|vimeo|wistia/i.test(el.getAttribute('src') || ''));
  }

  function scanVideos() {
    var all = document.querySelectorAll('mux-player, video, iframe');
    for (var i = 0; i < all.length; i++) {
      var el = all[i];
      if (el.getAttribute('data-cn-done')) continue;
      el.setAttribute('data-cn-done', '1');
      if (isVideoish(el)) {
        var ph = makePlaceholder(el);
        el.style.display = 'none';
        if (el.parentNode) el.parentNode.insertBefore(ph, el);
      }
    }
  }
  var mo = new MutationObserver(function () { scanVideos(); });
  function startObserve() {
    if (document.body) {
      scanVideos();
      mo.observe(document.body, { childList: true, subtree: true });
      // hydration 完成时机不定，兜底轮询一分钟
      var n = 0;
      var t = setInterval(function () { scanVideos(); if (++n > 60) clearInterval(t); }, 1000);
    } else {
      document.addEventListener('DOMContentLoaded', startObserve);
    }
  }
  startObserve();

  // ---------- 3) 表单拦截（订阅/购买未镜像） ----------
  document.addEventListener('submit', function (e) {
    e.preventDefault();
    e.stopImmediatePropagation();
    toast('订阅 / 购买流程未收录进中文镜像，请前往原站操作');
  }, true);

  var toastTimer = null;
  function toast(msg) {
    var t = document.createElement('div');
    t.className = 'aihero-cn-toast';
    t.textContent = msg;
    document.body.appendChild(t);
    if (toastTimer) clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.remove(); }, 4000);
  }
})();
