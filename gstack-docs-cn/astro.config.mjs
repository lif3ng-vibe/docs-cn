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
  var lastSources = [];
  function renderAll() {
    var nodes = document.querySelectorAll('pre.mermaid:not([data-processed])');
    if (!nodes.length) return;
    var list = Array.prototype.slice.call(nodes);
    list.forEach(function (n) { if (!n.dataset.src) n.dataset.src = n.textContent; });
    lastSources = list.map(function (n) { return n.dataset.src; });
    var theme = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'default';
    window.mermaid.initialize({ startOnLoad: false, theme: theme, securityLevel: 'loose' });
    window.mermaid.run({ nodes: list }).then(postProcess).catch(function () {});
  }
  // 渲染产物包装：figure + 操作条（放大 / 新窗口打开 SVG）
  function postProcess() {
    document.querySelectorAll('figure.mermaid-figure > svg').forEach(function (svg) {
      if (svg.closest('.mermaid-lightbox')) return;
      wrapFigure(svg);
    });
    document.querySelectorAll('main svg[id^="mermaid-"]').forEach(function (svg) {
      if (svg.parentElement.classList.contains('mermaid-figure')) return;
      wrapFigure(svg);
    });
  }
  function wrapFigure(svg) {
    var fig = document.createElement('figure');
    fig.className = 'mermaid-figure';
    var bar = document.createElement('div');
    bar.className = 'mermaid-bar';
    bar.innerHTML = '<button type="button" data-act="zoom" title="放大查看（滚轮缩放）">＋</button>' +
      '<button type="button" data-act="open" title="新窗口打开 SVG">↗</button>';
    svg.replaceWith(fig);
    fig.appendChild(bar);
    fig.appendChild(svg);
    svg.removeAttribute('max-width');
    bar.addEventListener('click', function (e) {
      var act = e.target && e.target.dataset ? e.target.dataset.act : '';
      if (act === 'zoom') openLightbox(svg);
      if (act === 'open') openInNewWindow(svg);
    });
    svg.style.cursor = 'zoom-in';
    svg.addEventListener('click', function () { openLightbox(svg); });
  }
  function serializeSvg(svg) {
    var clone = svg.cloneNode(true);
    clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    if (!clone.getAttribute('width') && clone.viewBox.baseVal) {
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
    close.textContent = '×';
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
    lb.addEventListener('click', function (e) { if (e.target === lb) closeLightbox(); });
    close.addEventListener('click', closeLightbox);
    document.addEventListener('keydown', escClose);
  }
  function escClose(e) { if (e.key === 'Escape') closeLightbox(); }
  function closeLightbox() {
    document.removeEventListener('keydown', escClose);
    document.querySelectorAll('.mermaid-lightbox').forEach(function (n) { n.remove(); });
  }
  var pending = false;
  function scheduleRender() {
    if (pending) return;
    pending = true;
    requestAnimationFrame(function () { pending = false; renderAll(); });
  }
  function init() {
    if (!document.querySelector('pre.mermaid')) return;
    var s = document.createElement('script');
    s.src = '${DOCS_BASE}/vendor/mermaid.min.js'.replace('//', '/');
    s.onload = function () {
      renderAll();
      // Starlight 主题切换（html[data-theme]）→ svg 换回源码 pre 再重渲染。
      // svg 不携带 dataset，源码按渲染顺序存于 lastSources
      new MutationObserver(function () {
        document.querySelectorAll('figure.mermaid-figure svg[id^="mermaid-"]').forEach(function (svg, i) {
          var pre = document.createElement('pre');
          pre.className = 'mermaid';
          pre.dataset.src = lastSources[i] || '';
          if (pre.dataset.src) svg.closest('figure.mermaid-figure').replaceWith(pre);
        });
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
