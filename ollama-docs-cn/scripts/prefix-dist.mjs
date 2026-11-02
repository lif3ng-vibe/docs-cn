#!/usr/bin/env node
/**
 * prefix-dist.mjs —— 给 Mintlify 导出产物加 GitHub Pages 子路径前缀
 *
 * 背景：`mintlify export` 产物是根路径站（href="/introduction"、src="/_next/…"、
 * 水合数据里的 assetPrefix 均不带前缀），部署到 lif3ng-vibe.github.io/docs-cn/ollama/
 * 子路径会全部 404。本脚本对 dist 做：
 *   1) html：href/src/content/srcset 里的根绝对路径 → 加前缀（排除 //、http、#、mailto、data:）
 *   2) js/json：水合数据 assetPrefix 修补（"" → 前缀，Next 运行时用它拼 _next URL）
 *   3) 删除 zip 附带的 Start Docs.* / serve.js（air-gap 启动器，Pages 用不上）
 *
 * 用法：node scripts/prefix-dist.mjs [dist目录]   （默认 dist；DOCS_BASE 可覆盖前缀）
 */
import { readdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';

const ROOT = process.cwd();
const DIST = join(ROOT, process.argv[2] || 'dist');
const BASE = (process.env.DOCS_BASE || '/docs-cn/ollama').replace(/\/+$/, '');
if (!BASE || BASE === '/') {
  console.log('[prefix] 无前缀，跳过');
  process.exit(0);
}
const P = BASE;

let changed = 0;
const skip = (u) =>
  !u ||
  u.startsWith('#') ||
  u.startsWith('//') ||
  /^(https?:|mailto:|data:|tel:)/.test(u) ||
  u === P ||
  u.startsWith(P + '/');

function reAttr(html) {
  return html.replace(/((?:href|src|content)=")([^"]*)"/g, (full, head, u) => {
    if (skip(u) || !u.startsWith('/')) return full;
    changed++;
    return `${head}${P}${u}"`;
  });
}
function reSrcset(html) {
  return html.replace(/(srcset=")([^"]*)"/g, (full, head, val) => {
    let any = false;
    const out = val
      .split(', ')
      .map((it) => {
        const parts = it.split(' ');
        const u = parts[0];
        if (skip(u) || !u.startsWith('/')) return it;
        any = true;
        parts[0] = P + u;
        return parts.join(' ');
      })
      .join(', ');
    if (any) changed++;
    return any ? `${head}"${out}"` : full;
  });
}
function reJs(s) {
  let out = s;
  const variants = [
    ['\\"assetPrefix\\":\\"', '\\"assetPrefix\\":\\"' + P], // RSC 字符串内转引号形态
    ['"assetPrefix":""', '"assetPrefix":"' + P + '"'],
    // 新版渲染客户端（mint 0.0.3794，Vite 形态）的水合基址字段：
    // 客户端路由用 basePath+pagePath 拼内部 URL，发现与地址栏不一致就
    // replaceState 规范化 → 子路径部署时整站被弹回站点根（404 之源）
    ['\\"basePath\\":\\"', '\\"basePath\\":\\"' + P],
    ['"basePath":""', '"basePath":"' + P + '"'],
    ['\\"mountPath\\":\\"', '\\"mountPath\\":\\"' + P],
    ['"mountPath":""', '"mountPath":"' + P + '"'],
    // 注意：chunk 里的 `/_mintlify/export-assets`、`/_mintlify/search-index.json`
    // 等路径常量【不要】加前缀——运行时消费会叠加水合 basePath（已带 P），
    // 再改常量就双前缀（/docs-cn/ollama/docs-cn/ollama/…，aihero 同款坑）。
  ];
  for (const [from, to] of variants) {
    const n = out.split(from).length - 1;
    if (n) {
      out = out.split(from).join(to);
      changed += n;
    }
  }
  return out;
}

/**
 * 飞行数据（RSC payload）修正：只处理 HTML 内嵌字符串，不动 .js 文件。
 * 静态导出的 hydration 恢复/懒加载会按 payload 里的路径插入 script 与
 * 预取 chunk——不带前缀就去站点根拉 404，交互（主题切换/搜索/软导航）全灭。
 * 同时把 flight 的资产前缀字段 `\"p\":\"\"` 补上（Next 运行时动态拼 chunk URL 用）。
 */
function reFlight(s) {
  let out = s;
  const variants = [
    ['\\"src\\":\\"/_next/', '\\"src\\":\\"' + P + '/_next/'],
    ['\\"/_next/static/', '\\"' + P + '/_next/static/'],
    ['"src":"/_next/', '"src":"' + P + '/_next/'],
    ['"/_next/static/', '"' + P + '/_next/static/'],
    ['\\"p\\":\\"\\"', '\\"p\\":\\"' + P + '\\"'],
  ];
  for (const [from, to] of variants) {
    const n = out.split(from).length - 1;
    if (n) {
      out = out.split(from).join(to);
      changed += n;
    }
  }
  return out;
}

// 0. 扁平化 <dir>/index/ 页面到 <dir>/（Mintlify 把 xxx/index 渲染在 /xxx）
import { renameSync, existsSync } from 'node:fs';
function flattenIndex(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (!e.isDirectory()) continue;
    const idx = join(p, 'index', 'index.html');
    if (existsSync(idx)) {
      renameSync(idx, join(p, 'index.html'));
      try {
        rmSync(join(p, 'index'), { recursive: true });
      } catch {}
    }
    flattenIndex(p);
  }
}
flattenIndex(DIST);

for (const f of ['Start Docs.bat', 'Start Docs.command', 'serve.js']) {
  try {
    unlinkSync(join(DIST, f));
  } catch {}
}

/**
 * 正文相对链接解析（HTML only）：Mintlify 导出对正文 markdown 链接与
 * <img> 相对 src 一概原样放行——浏览器按当前页 URL 目录解析
 * （/page/ 下的 keybindings.md → /page/keybindings.md → 404）。
 * 文档源是扁平根结构（所有 .md 与 images/ 都在站点根），故相对路径
 * 一律按站点根解析：x.md → {P}/x（剥扩展名，Pages 对目录 /x → /x/ 跳转），
 * images/x.png → {P}/images/x.png。外链/锚点/已前缀的不动。
 */
function reRelLinks(html) {
  return html.replace(/((?:href|src)=")([^"#]+?)\.md(#[^"]*)?"/g, (full, head, p, anchor) => {
    if (/^(https?:|mailto:|data:|tel:)/.test(p) || p.startsWith(P)) return full;
    const abs = '/' + p.replace(/^\.\//, '').replace(/\.md$/, '').replace(/^\/+/, '');
    changed++;
    return `${head}${P}${abs}${anchor || ''}"`;
  });
}

/** 相对资产（images/…）：按站点根解析 + 加前缀（src 与包着它的 href 都要） */
function reRelAssets(html) {
  return html.replace(/((?:src|href)=")(images\/[^"]+)(")/g, (full, head, p) => {
    changed++;
    return `${head}${P}/${p}"`;
  });
}

/**
 * 新版渲染客户端（mint 0.0.3794+，Vite 产物）的内嵌资产前缀：HTML 内嵌
 * <script> 里的 "/_mintlify/assets/" 字符串（资产加载器 primary 与入口
 * chunk 拼接基址）。属性形态的引用已被 reAttr 处理，HTML 里残留的该串
 * 全是内嵌 JS 字符串——只改 HTML，assets 文件本体不动（坑 3）。
 */
function reMintAssets(html) {
  return html.replace(/"(\/_mintlify\/assets\/)/g, (full, a) => {
    changed++;
    return `"${P}${a}`;
  });
}

/**
 * HTML 属性内转义形态的 CSS url（inline style 的 mask-image 引
 * fontawesome/export-assets 图标）：url(&quot;/_mintlify/…&quot;) 按站点根
 * 解析，需加前缀。只出现在属性/style 文本（payload 内是 \" 形态，由
 * basePath 机制处理），加 P 不会二次前缀（已前缀串无此子串）。
 */
function reQuotAssets(html) {
  return html.replace(/(&quot;\/_mintlify\/)/g, (full, a) => {
    changed++;
    return `&quot;${P}${a}`;
  });
}

/**
 * Mintlify 无 site 配置时导出的 canonical/og:url 是 https://local./<path>
 * 占位域（HTML 属性与内嵌 payload 转义形态各一处）。改写为部署站 URL。
 */
const SITE = (process.env.DOCS_SITE_URL || 'https://lif3ng-vibe.github.io').replace(/\/+$/, '');
function reLocalUrl(html) {
  // 带路径形态（…local./quickstart）与根形态（…local."）分别补全
  html = html.replace(/https:\/\/local\.\//g, `${SITE}${P}/`);
  return html.replace(/https:\/\/local\./g, `${SITE}${P}/`);
}

function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (!/\.(html|js)$/.test(e.name)) continue;
    else {
      const src = readFileSync(p, 'utf8');
      let out = src;
      // 顺序敏感：reRelLinks/reRelAssets 要在 reAttr 之前吃原始相对路径
      if (e.name.endsWith('.html')) out = reLocalUrl(reQuotAssets(reMintAssets(reFlight(reJs(reRelAssets(reAttr(reRelLinks(reSrcset(src)))))))));
      else out = reJs(out);
      if (out !== src) writeFileSync(p, out);
    }
  }
}
walk(DIST);
console.log(`[prefix] rewrote ${changed} refs → ${P}`);