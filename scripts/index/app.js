/* docs-cn 入口页交互层 — 单文件内联，零外部依赖。
   注册表 ID（{{…}} 占位）由 gen-index 装配时注入。 */
(function () {
	'use strict';
	var STORAGE_KEY = 'docs-cn-prefs';
	var SKIN_IDS = {{SKIN_IDS}};
	var CARD_STYLE_IDS = {{CARD_STYLE_IDS}};
	var TAG_LANG_IDS = {{TAG_LANG_IDS}};
	var SEARCH_MODE_IDS = {{SEARCH_MODE_IDS}};
	var SHOW_KEYS = ['desc', 'tags', 'meta', 'btns'];
	var DEFAULTS = {
		skin: 'mdn',
		cardStyle: 'standard',
		tagLang: 'zh',
		searchMode: 'filter',
		showDesc: true,
		showTags: true,
		showMeta: true,
		showBtns: true
	};
	var root = document.documentElement;

	// 注册表白名单回落：防手改 localStorage 出脏值（旧 theme 键不在 DEFAULTS，自动丢弃）。
	function loadPrefs() {
		var out = {};
		var p = {};
		try {
			p = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
		} catch (e) {}
		Object.keys(DEFAULTS).forEach(function (k) {
			out[k] = k in p ? p[k] : DEFAULTS[k];
		});
		if (SKIN_IDS.indexOf(out.skin) === -1) out.skin = DEFAULTS.skin;
		if (CARD_STYLE_IDS.indexOf(out.cardStyle) === -1) out.cardStyle = DEFAULTS.cardStyle;
		if (TAG_LANG_IDS.indexOf(out.tagLang) === -1) out.tagLang = DEFAULTS.tagLang;
		if (SEARCH_MODE_IDS.indexOf(out.searchMode) === -1) out.searchMode = DEFAULTS.searchMode;
		SHOW_KEYS.forEach(function (k) {
			var key = 'show' + k.charAt(0).toUpperCase() + k.slice(1);
			out[key] = k in p ? p[key] === true : DEFAULTS[key];
		});
		return out;
	}

	var prefs = loadPrefs();

	function savePrefs() {
		try {
			localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
		} catch (e) {}
	}

	function applyPrefs() {
		root.dataset.skin = prefs.skin;
		root.dataset.cardStyle = prefs.cardStyle;
		if (prefs.tagLang === 'zh') delete root.dataset.tagLang;
		else root.dataset.tagLang = prefs.tagLang;
		SHOW_KEYS.forEach(function (k) {
			var key = 'show' + k.charAt(0).toUpperCase() + k.slice(1);
			root.dataset[key] = prefs[key] ? '1' : '0';
		});
	}

	// —— 设置弹窗 ——
	var dialog = document.getElementById('settings');
	var settingsBtn = document.getElementById('settings-btn');
	var closeBtn = document.getElementById('settings-close');

	function syncSettingsUi() {
		var r;
		r = root.querySelector('input[name="skin"][value="' + prefs.skin + '"]');
		if (r) r.checked = true;
		r = root.querySelector('input[name="card-style"][value="' + prefs.cardStyle + '"]');
		if (r) r.checked = true;
		r = root.querySelector('input[name="tag-lang"][value="' + prefs.tagLang + '"]');
		if (r) r.checked = true;
		r = root.querySelector('input[name="search-mode"][value="' + prefs.searchMode + '"]');
		if (r) r.checked = true;
		root.querySelectorAll('input[data-show]').forEach(function (cb) {
			var key = 'show' + cb.dataset.show.charAt(0).toUpperCase() + cb.dataset.show.slice(1);
			cb.checked = !!prefs[key];
		});
	}
	settingsBtn.addEventListener('click', function () {
		syncSettingsUi();
		dialog.showModal();
	});
	closeBtn.addEventListener('click', function () {
		dialog.close();
	});
	// 点遮罩关闭
	dialog.addEventListener('click', function (e) {
		if (e.target === dialog) dialog.close();
	});

	function bindRadios(name, onPick) {
		root.querySelectorAll('input[name="' + name + '"]').forEach(function (r) {
			r.addEventListener('change', function () {
				onPick(r.value);
				applyPrefs();
				savePrefs();
				syncSettingsUi();
			});
		});
	}
	bindRadios('skin', function (v) {
		prefs.skin = v;
	});
	bindRadios('card-style', function (v) {
		prefs.cardStyle = v;
	});
	bindRadios('tag-lang', function (v) {
		prefs.tagLang = v;
	});
	bindRadios('search-mode', function (v) {
		prefs.searchMode = v;
		apply(); // 模式切换立即生效（过滤↔高亮）
	});
	root.querySelectorAll('input[data-show]').forEach(function (cb) {
		cb.addEventListener('change', function () {
			var key = 'show' + cb.dataset.show.charAt(0).toUpperCase() + cb.dataset.show.slice(1);
			prefs[key] = cb.checked;
			applyPrefs();
			savePrefs();
		});
	});

	// —— 列表数据与筛选状态 ——
	var list = document.getElementById('list');
	var searchInput = document.getElementById('search');
	var emptyEl = document.getElementById('empty');
	var emptyMsg = document.getElementById('empty-msg');
	var summaryEl = document.getElementById('summary');
	var sumParts = document.getElementById('sum-parts');
	var countEl = document.getElementById('count');
	var toTop = document.getElementById('to-top');
	autoAnimate(list);

	var items = Array.prototype.map.call(list.querySelectorAll('.item'), function (el) {
		var nameEl = el.querySelector('.name');
		var descEl = el.querySelector('.desc');
		var nameText = nameEl.textContent;
		var descText = descEl ? descEl.textContent : '';
		var tagText = Array.prototype.map
			.call(el.querySelectorAll('.tag'), function (t) {
				return t.textContent;
			})
			.join(' ');
		return {
			el: el,
			nameEl: nameEl,
			descEl: descEl,
			nameText: nameText,
			descText: descText,
			tags: el.dataset.tags ? el.dataset.tags.split(',').filter(Boolean) : [],
			hay: (nameText + ' ' + descText + ' ' + tagText).toLowerCase()
		};
	});
	var chips = Array.prototype.slice.call(document.querySelectorAll('.chip'));
	var active = new Set();

	// —— URL 状态：?tags=a,b&q=词（刷新/分享不丢；replaceState 不推历史栈）——
	(function initFromUrl() {
		var sp, q, tags;
		try {
			sp = new URLSearchParams(location.search);
		} catch (e) {
			return;
		}
		q = (sp.get('q') || '').trim();
		tags = (sp.get('tags') || '')
			.split(',')
			.filter(function (t) {
				return t && t !== 'all' && !!document.querySelector('.chip[data-filter="' + t + '"]');
			});
		if (q) searchInput.value = q;
		tags.forEach(function (t) {
			active.add(t);
		});
	})();

	function chipName(slug) {
		var c = document.querySelector('.chip[data-filter="' + slug + '"]');
		if (!c) return slug;
		var n = c.querySelector(prefs.tagLang === 'en' ? '.chip-en' : '.chip-zh');
		return n ? n.textContent : slug;
	}

	function condText() {
		var parts = [];
		active.forEach(function (t) {
			parts.push(chipName(t));
		});
		var kw = searchInput.value.trim();
		if (kw) parts.push('搜索：「' + kw + '」');
		return parts.join(' × ');
	}

	// 高亮：清空重建文本节点，命中片段包 mark（textContent 先还原避免嵌套）
	function setHighlighted(el, original, kw) {
		el.textContent = original;
		var needle = kw.toLowerCase();
		var idx = original.toLowerCase().indexOf(needle);
		if (idx === -1) return;
		var frag = document.createDocumentFragment();
		var pos = 0;
		while (idx !== -1) {
			if (idx > pos) frag.appendChild(document.createTextNode(original.slice(pos, idx)));
			var mark = document.createElement('mark');
			mark.textContent = original.slice(idx, idx + needle.length);
			frag.appendChild(mark);
			pos = idx + needle.length;
			idx = original.toLowerCase().indexOf(needle, pos);
		}
		if (pos < original.length) frag.appendChild(document.createTextNode(original.slice(pos)));
		el.textContent = '';
		el.appendChild(frag);
	}

	function syncUrl(kw) {
		try {
			var p = new URLSearchParams();
			if (active.size) p.set('tags', Array.from(active).join(','));
			if (kw) p.set('q', kw);
			var qs = p.toString();
			history.replaceState(null, '', qs ? '?' + qs : location.pathname);
		} catch (e) {}
	}

	function apply() {
		var sel = Array.from(active);
		var kw = searchInput.value.trim();
		var searching = kw.length > 0;
		var lowKw = kw.toLowerCase();
		var highlightOnly = searching && prefs.searchMode === 'highlight';
		var matched = 0;
		// 交集：卡片须命中全部选中标签；过滤模式下还须命中关键词
		var desired = items.filter(function (it) {
			var tagOk = sel.every(function (t) {
				return it.tags.indexOf(t) !== -1;
			});
			var kwOk = !searching || it.hay.indexOf(lowKw) !== -1;
			if (tagOk && kwOk) matched++;
			return tagOk && (highlightOnly || kwOk);
		});
		// 先移出不再命中的卡片，再按原顺序补回（auto-animate 负责过渡）
		items.forEach(function (it) {
			if (desired.indexOf(it) === -1 && it.el.parentNode) it.el.remove();
		});
		desired.forEach(function (it, i) {
			if (list.children[i] !== it.el) list.appendChild(it.el);
		});
		// 关键词高亮：命中片段标 mark；无关键词还原纯文本
		items.forEach(function (it) {
			if (searching) {
				setHighlighted(it.nameEl, it.nameText, kw);
				if (it.descEl) setHighlighted(it.descEl, it.descText, kw);
			} else {
				it.nameEl.textContent = it.nameText;
				if (it.descEl) it.descEl.textContent = it.descText;
			}
		});
		// 空态（仅过滤模式零命中）：回显当前条件 + 恢复动作
		var dead = !highlightOnly && desired.length === 0;
		emptyEl.hidden = !dead;
		if (dead) emptyMsg.textContent = '没有匹配（' + condText() + '）的站点';
		// chips 置灰：未选中标签在当前命中卡片中一个都没有 → disabled
		chips.forEach(function (c) {
			var f = c.dataset.filter;
			if (f === 'all') {
				c.classList.toggle('active', active.size === 0);
				c.disabled = false;
				return;
			}
			c.classList.toggle('active', active.has(f));
			c.disabled =
				!active.has(f) &&
				!desired.some(function (it) {
					return it.tags.indexOf(f) !== -1;
				});
		});
		// 摘要条 + 命中计数（两种模式都按「站」计）
		var filtering = active.size > 0 || searching;
		summaryEl.hidden = !filtering;
		if (filtering) {
			sumParts.innerHTML = '';
			active.forEach(function (t) {
				var pill = document.createElement('span');
				pill.className = 'sum-tag';
				pill.textContent = chipName(t);
				sumParts.appendChild(pill);
			});
			if (searching) {
				var sp2 = document.createElement('span');
				sp2.className = 'sum-tag';
				sp2.textContent = '搜索：' + kw;
				sumParts.appendChild(sp2);
			}
			countEl.innerHTML = '';
			var b = document.createElement('b');
			countEl.appendChild(document.createTextNode('命中 '));
			b.textContent = highlightOnly ? matched : desired.length;
			countEl.appendChild(b);
			countEl.appendChild(
				document.createTextNode(highlightOnly ? ' 站' : ' / ' + items.length + ' 站')
			);
		}
		syncUrl(kw);
	}

	// —— 事件 ——
	chips.forEach(function (c) {
		c.addEventListener('click', function () {
			if (c.disabled) return;
			var f = c.dataset.filter;
			if (f === 'all') active.clear();
			else if (active.has(f)) active.delete(f);
			else active.add(f);
			apply();
		});
	});
	searchInput.addEventListener('input', apply);
	document.getElementById('empty-clear-search').addEventListener('click', function () {
		searchInput.value = '';
		apply();
	});
	document.getElementById('empty-clear-filters').addEventListener('click', function () {
		active.clear();
		apply();
	});
	document.getElementById('clear-all').addEventListener('click', function () {
		active.clear();
		searchInput.value = '';
		apply();
	});
	// `/` 与 ⌘K/Ctrl+K（Vercel 皮肤语汇）聚焦搜索；输入框内不拦 `/`
	document.addEventListener('keydown', function (e) {
		if ((e.ctrlKey || e.metaKey) && !e.altKey && e.key.toLowerCase() === 'k') {
			e.preventDefault();
			searchInput.focus();
			return;
		}
		if (e.key !== '/' || e.ctrlKey || e.metaKey || e.altKey) return;
		var t = e.target;
		if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
		e.preventDefault();
		searchInput.focus();
	});
	// 返回顶部
	window.addEventListener(
		'scroll',
		function () {
			toTop.hidden = window.scrollY < 600;
		},
		{ passive: true }
	);
	toTop.addEventListener('click', function () {
		var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
		window.scrollTo({ top: 0, behavior: reduced ? 'auto' : 'smooth' });
	});

	applyPrefs();
	apply();
})();
