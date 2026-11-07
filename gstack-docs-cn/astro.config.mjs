// @ts-check
import starlight from '@astrojs/starlight';
import { defineConfig } from 'astro/config';

import { rehypeBaseLinks } from './src/plugins/base-links.mjs';
import { rehypeMermaidBlocks } from './src/plugins/rehype-mermaid-blocks.mjs';

// hub Pages 部署注入（无 env 时本地开发走根路径）
const DOCS_SITE = process.env.DOCS_SITE || 'http://localhost:4321';
const DOCS_BASE = (process.env.DOCS_BASE || '/').replace(/\/+$/, '') || '/';

// mermaid 客户端渲染：页面有 pre.mermaid 才按需加载自托管单文件
// （public/vendor/mermaid.min.js，不走 CDN——国内访问不稳），Starlight
// 明暗主题切换时重渲染。
const MERMAID_INIT = `
(function () {
  var ICON_PLUS = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M5 1v8M1 5h8"/></svg>';
  var ICON_OPEN = '<svg width="10" height="10" viewBox="0 0 10 10" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 8l6-6M3.5 2H8v4.5"/></svg>';

  function themeName() {
    return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';
  }
  var pending = null;
  function scheduleRender() {
    if (pending) return;
    pending = requestAnimationFrame(function () { pending = null; renderAll(); });
  }

  // 把 markdown 产出的 pre.mermaid（与紧随的隐藏 pre.mermaid-zh）聚拢进 figure 容器
  function bootstrap() {
    document.querySelectorAll('pre.mermaid').forEach(function (pre) {
      if (pre.closest('figure.mermaid-figure')) return;
      var fig = document.createElement('figure');
      fig.className = 'mermaid-figure';
      fig.dataset.lang = 'en';
      fig.dataset.mermaidEn = pre.textContent;
      var zh = pre.nextElementSibling;
      if (zh && zh.classList.contains('mermaid-zh')) {
        fig.dataset.mermaidZh = zh.textContent;
        zh.remove();
      }
      pre.replaceWith(fig);
      fig.appendChild(buildBar(fig));
      pre.removeAttribute('hidden');
      fig.appendChild(pre);
    });
  }

  function buildBar(fig) {
    var bar = document.createElement('div');
    bar.className = 'mermaid-bar';
    function btn(act, title, inner) {
      var b = document.createElement('button');
      b.type = 'button';
      b.dataset.act = act;
      b.title = title;
      b.innerHTML = inner;
      bar.appendChild(b);
      return b;
    }
    btn('zoom', '放大查看（滚轮缩放）', ICON_PLUS);
    if (fig.dataset.mermaidZh) btn('zh', '查看中文版流程图', '<span class="mermaid-zh-label">中</span>');
    btn('open', '新窗口打开 SVG', ICON_OPEN);
    bar.addEventListener('click', function (e) {
      var b = e.target.closest && e.target.closest('button');
      if (!b) return;
      var svg = fig.querySelector('svg[id^="mermaid-"]');
      if (b.dataset.act === 'zoom' && svg) openLightbox(svg);
      else if (b.dataset.act === 'open' && svg) openInNewWindow(svg);
      else if (b.dataset.act === 'zh') toggleLang(fig);
    });
    return bar;
  }

  function toggleLang(fig) {
    fig.dataset.lang = fig.dataset.lang === 'zh' ? 'en' : 'zh';
    var b = fig.querySelector('[data-act="zh"]');
    if (b) b.classList.toggle('active', fig.dataset.lang === 'zh');
    rerenderFigure(fig);
    scheduleRender();
  }

  function rerenderFigure(fig) {
    var src = fig.dataset.lang === 'zh' ? fig.dataset.mermaidZh : fig.dataset.mermaidEn;
    if (!src) return;
    // 清掉旧 svg 与 pre（mermaid.run 会把 svg 插进 pre 内部，结构不定），
    // 再插一枚全新 pre 作 figure 直接子节点，保证 renderAll 的选择器永远命中
    fig.querySelectorAll('svg[id^="mermaid-"], pre.mermaid').forEach(function (n) { n.remove(); });
    var pre = document.createElement('pre');
    pre.className = 'mermaid';
    pre.textContent = src;
    fig.appendChild(pre);
  }

  function renderAll() {
    var nodes = document.querySelectorAll('figure.mermaid-figure > pre.mermaid:not([data-processed])');
    if (!nodes.length) return;
    var list = Array.prototype.slice.call(nodes);
    window.mermaid.initialize({ startOnLoad: false, theme: themeName(), securityLevel: 'loose' });
    window.mermaid.run({ nodes: list }).catch(function () {});
  }

  function serializeSvg(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (clone.viewBox && clone.viewBox.baseVal) {
      clone.setAttribute('width', clone.viewBox.baseVal.width);
      clone.setAttribute('height', clone.viewBox.baseVal.height);
    }
    clone.style.maxWidth = 'none';
    return clone;
  }
  function openInNewWindow(svg) {
    var src = new XMLSerializer().serializeToString(serializeSvg(svg));
    var url = URL.createObjectURL(new Blob([src], { type: 'image/svg+xml' }));
    var w = window.open(url, '_blank');
    // 兜底：弹窗被拦时退回下载
    if (!w) {
      var a = document.createElement('a');
      a.href = url; a.download = 'mermaid.svg'; a.click();
    }
    setTimeout(function () { URL.revokeObjectURL(url); }, 60000);
  }
  function openLightbox(svg) {
    closeLightbox();
    var lb = document.createElement('div');
    lb.className = 'mermaid-lightbox';
    var body = document.createElement('div');
    body.className = 'mermaid-lb-body';
    var clone = serializeSvg(svg);
    clone.style.transform = 'scale(1)';
    clone.style.transformOrigin = '0 0';
    body.appendChild(clone);
    var close = document.createElement('button');
    close.className = 'mermaid-lb-close';
    close.type = 'button';
    close.innerHTML = '<svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M2 2l8 8M10 2l-8 8"/></svg>';
    lb.appendChild(body);
    lb.appendChild(close);
    document.body.appendChild(lb);
    var scale = 1;
    function apply() { clone.style.transform = 'scale(' + scale + ')'; }
    body.addEventListener('wheel', function (e) {
      e.preventDefault();
      scale = Math.min(5, Math.max(0.2, scale * (e.deltaY < 0 ? 1.12 : 0.89)));
      apply();
    }, { passive: false });
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === body) closeLightbox(); });
    close.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') closeLightbox(); }
  function closeLightbox() {
    document.removeEventListener('keydown', escClose);
    document.querySelectorAll('.mermaid-lightbox').forEach(function (n) { n.remove(); });
  }
  // 委托：点击图本体（非操作条）也开放大层
  document.addEventListener('click', function (e) {
    var t = e.target;
    var svg = t.closest && t.closest('svg[id^="mermaid-"]');
    if (!svg || svg.closest('.mermaid-lightbox')) return;
    if (svg.closest('figure.mermaid-figure')) openLightbox(svg);
  });

  function init() {
    if (!document.querySelector('pre.mermaid')) return;
    var s = document.createElement('script');
    s.src = '${DOCS_BASE}/vendor/mermaid.min.js'.replace('//', '/');
    s.onload = function () {
      bootstrap();      // 先聚拢 figure（含中文源吸收），再渲染
      scheduleRender();
      // Starlight 主题切换（html[data-theme]）→ 每个 figure 按当前语言重渲染
      new MutationObserver(function () {
        document.querySelectorAll('figure.mermaid-figure').forEach(rerenderFigure);
        scheduleRender();
      }).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
    };
    document.head.appendChild(s);
  }
  // head 内联脚本执行时 body 尚未解析，必须等 DOM 就绪
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
`;

export default defineConfig({
  site: DOCS_SITE,
  base: DOCS_BASE,
  devToolbar: {
    enabled: false,
  },
  // 站内 /slug/ 绝对链接与 raw HTML 资源在构建期统一加 base 前缀（CI 免 sed）。
  // Astro 顶层 markdown rehype 作用于所有内容渲染（含 Starlight 页面）；
  // Starlight 0.42.4 的 markdown.processor 在本版本组合上未生效，故不用 worktrunk 的写法。
  // rehypeMermaidBlocks 依赖"用户 rehype 先于 syntaxHighlight 运行"的管线顺序。
  markdown: {
    rehypePlugins: [rehypeMermaidBlocks, [rehypeBaseLinks, DOCS_BASE]],
  },
  integrations: [
    starlight({
      title: 'gstack',
      head: [{ tag: 'script', attrs: { isInline: true }, content: MERMAID_INIT }],
      description:
        'gstack 中文文档（非官方翻译）：Garry Tan 开源的 Claude Code 虚拟工程团队——CEO、设计、工程经理、评审、QA、安全与发布的全套 slash command 技能集。',
      // 单语言中文：必须 root + lang（写 'zh' 会强制 /zh/ URL 前缀导致 slug 失配）
      defaultLocale: 'root',
      locales: {
        root: { label: '简体中文', lang: 'zh-CN' },
      },
      logo: {
        src: './src/assets/icon.png',
      },
      favicon: 'favicon.png',
      social: [
        {
          icon: 'github',
          label: 'GitHub',
          href: 'https://github.com/garrytan/gstack',
        },
      ],
      sidebar: [
        { label: '首页', slug: 'index' },
        {
          label: '开始',
          items: [
            { label: '为什么是 gstack', slug: 'why-gstack' },
            { label: '安装细节', slug: 'install' },
            { label: '发布与更新渠道', slug: 'releases' },
            { label: '卸载', slug: 'uninstall' },
            { label: '支持层级', slug: 'support-tiers' },
          ],
        },
        {
          label: '核心指南',
          items: [
            { label: '技能深度指南', slug: 'skills' },
            { label: '推荐工作流（gstack + Capy）', slug: 'recommended-harness' },
            { label: 'gstack + Capy：软件工厂', slug: 'capy' },
            { label: '运行 Captain 编队', slug: 'captain' },
          ],
        },
        {
          label: '浏览器与 QA',
          items: [
            { label: '浏览器', slug: 'browser' },
            { label: '无网页 QA', slug: 'qa-without-a-webpage' },
            { label: '域名技能', slug: 'domain-skills' },
            { label: 'Agent 友好报错', slug: 'agent-ready-errors' },
          ],
        },
        {
          label: 'GBrain 持久记忆',
          items: [
            { label: '快速上手', slug: 'gbrain-quick-tour' },
            { label: 'gstack 集成全指南', slug: 'gbrain-with-gstack' },
            { label: '跨机同步', slug: 'gbrain-sync' },
            { label: '同步错误索引', slug: 'gbrain-sync-errors' },
          ],
        },
        {
          label: '实战指南',
          items: [
            { label: '图表与文档格式', slug: 'howto-diagrams-and-formats' },
            { label: '首次生产部署', slug: 'howto-bring-up-a-first-deploy' },
            { label: '为已上线功能写文档', slug: 'howto-document-a-shipped-feature' },
            { label: '文档生成教程', slug: 'tutorial-document-generate' },
            { label: '为什么用 Diataxis', slug: 'explanation-diataxis-in-gstack' },
            { label: 'iOS 真机测试', slug: 'howto-ios-testing-with-gstack' },
          ],
        },
        {
          label: '多 Agent 支持',
          items: [
            { label: '其他 Agent 平台', slug: 'hosts' },
            { label: '新增 Host', slug: 'adding-a-host' },
            { label: 'OpenClaw 集成', slug: 'openclaw' },
          ],
        },
        {
          label: '参考',
          items: [
            { label: '独立二进制', slug: 'standalone-binaries' },
            { label: '隐私与遥测', slug: 'privacy' },
            { label: '语音输入别名', slug: 'voice-input' },
            { label: 'Memorable 记忆桥接', slug: 'memorable-workflow-memory' },
            { label: '故障排查', slug: 'troubleshooting' },
          ],
        },
        {
          label: '项目内幕',
          items: [
            { label: '架构', slug: 'architecture' },
            { label: 'Builder 心法', slug: 'ethos' },
            { label: '参与贡献', slug: 'contributing' },
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
