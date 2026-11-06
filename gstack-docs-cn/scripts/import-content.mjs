// 一次性内容迁移：从 ../gstack-main 快照拷贝收录文档到 src/content/docs/
// - 注入 frontmatter title（取源文件首个 H1，正文 H1 剥离避免与页面标题重复）
// - 站内收录互链 → /<slug>/（README.md → /）；fragment 原样保留（翻译后由 fix-links 回修）
// - 链向未收录文件 → GitHub blob/tree 绝对 URL（镜像不假装完整，指回官方仓库）
// - 本地图片 → 拷贝 public/images/，引用改 /images/<basename>（base-links 插件加前缀）
// 围栏代码块内的 ](...) 与 href/src 一律不动。
// 用法：node scripts/import-content.mjs   （可重复运行，覆盖写）
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.resolve(ROOT, '../gstack-main');
const DOCS = path.join(ROOT, 'src/content/docs');
const PUBLIC_IMG = path.join(ROOT, 'public/images');
const UPSTREAM = 'https://github.com/garrytan/gstack';

const SOURCES = {
  'README.md': 'index',
  'docs/why-gstack.md': 'why-gstack',
  'docs/install.md': 'install',
  'docs/releases.md': 'releases',
  'docs/uninstall.md': 'uninstall',
  'docs/support-tiers.md': 'support-tiers',
  'docs/skills.md': 'skills',
  'docs/recommended-harness.md': 'recommended-harness',
  'capy/README.md': 'capy',
  'docs/captain.md': 'captain',
  'BROWSER.md': 'browser',
  'docs/qa-without-a-webpage.md': 'qa-without-a-webpage',
  'docs/domain-skills.md': 'domain-skills',
  'docs/agent-ready-errors.md': 'agent-ready-errors',
  'docs/gbrain-quick-tour.md': 'gbrain-quick-tour',
  'USING_GBRAIN_WITH_GSTACK.md': 'gbrain-with-gstack',
  'docs/gbrain-sync.md': 'gbrain-sync',
  'docs/gbrain-sync-errors.md': 'gbrain-sync-errors',
  'docs/howto-diagrams-and-formats.md': 'howto-diagrams-and-formats',
  'docs/howto-bring-up-a-first-deploy.md': 'howto-bring-up-a-first-deploy',
  'docs/howto-document-a-shipped-feature.md': 'howto-document-a-shipped-feature',
  'docs/tutorial-document-generate.md': 'tutorial-document-generate',
  'docs/explanation-diataxis-in-gstack.md': 'explanation-diataxis-in-gstack',
  'docs/howto-ios-testing-with-gstack.md': 'howto-ios-testing-with-gstack',
  'docs/hosts.md': 'hosts',
  'docs/ADDING_A_HOST.md': 'adding-a-host',
  'docs/OPENCLAW.md': 'openclaw',
  'docs/standalone-binaries.md': 'standalone-binaries',
  'docs/privacy.md': 'privacy',
  'docs/voice-input.md': 'voice-input',
  'docs/memorable-workflow-memory.md': 'memorable-workflow-memory',
  'docs/troubleshooting.md': 'troubleshooting',
  'ARCHITECTURE.md': 'architecture',
  'ETHOS.md': 'ethos',
  'CONTRIBUTING.md': 'contributing',
};

const byRepoPath = new Map(Object.entries(SOURCES)); // 'docs/x.md' -> slug
const IMG_EXT = /\.(png|jpe?g|gif|svg|webp)$/i;
const stats = { pages: 0, internal: 0, externalized: 0, images: 0 };
const report = [];

function resolveRepoRel(fromFile, target) {
  const clean = target.replace(/^\.\//, '');
  const joined = path.posix.normalize(path.posix.join(path.posix.dirname(fromFile), clean));
  return joined;
}

function rewriteTarget(fromFile, target, copyImage) {
  if (!target || target.startsWith('#')) return target;
  if (/^(https?:|mailto:|data:)/i.test(target)) return target;
  const hashIdx = target.indexOf('#');
  const pathPart = hashIdx === -1 ? target : target.slice(0, hashIdx);
  const frag = hashIdx === -1 ? '' : target.slice(hashIdx);

  if (IMG_EXT.test(pathPart)) {
    const srcAbs = path.join(SRC, pathPart);
    if (fs.existsSync(srcAbs)) {
      copyImage(srcAbs);
      stats.images++;
      return `/images/${path.posix.basename(pathPart)}`;
    }
  }

  if (!pathPart) return target; // 纯 fragment（页内锚点），留给回修
  const repoRel = resolveRepoRel(fromFile, pathPart);

  if (IMG_EXT.test(repoRel)) {
    const srcAbs = path.join(SRC, repoRel);
    if (fs.existsSync(srcAbs)) {
      copyImage(srcAbs);
      stats.images++;
      return `/images/${path.posix.basename(repoRel)}`;
    }
    return `${UPSTREAM}/blob/main/${repoRel}`;
  }

  const noExt = repoRel.replace(/\.md$/i, '') + '.md';
  const key = byRepoPath.has(repoRel) ? repoRel : byRepoPath.has(noExt) ? noExt : null;
  if (key) {
    stats.internal++;
    const slug = byRepoPath.get(key);
    return (slug === 'index' ? '/' : `/${slug}/`) + frag;
  }

  // 未收录：指回 GitHub（.md 走 blob 渲染页，目录走 tree）
  stats.externalized++;
  report.push(`  ${fromFile}: ${target} -> ${repoRel}`);
  // ../ 逃出仓库根 = GitHub 站内相对链接（如 ../../pull/205），直接拼官方站路径
  if (repoRel.startsWith('../')) return `${UPSTREAM}/${repoRel.replace(/^(\.\.\/)+/, '')}`;
  const base = /\.md$/i.test(repoRel)
    ? `${UPSTREAM}/blob/main/${repoRel}`
    : `${UPSTREAM}/tree/main/${repoRel}`;
  return base + frag;
}

for (const [srcRel, slug] of Object.entries(SOURCES)) {
  const srcAbs = path.join(SRC, srcRel);
  let text = fs.readFileSync(srcAbs, 'utf8');

  // 取首个 H1 作 title，并从正文剥离（Starlight 用 frontmatter title 渲染页头）
  const lines = text.split('\n');
  let title = slug;
  let h1Idx = -1;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i].match(/^# (.+?)\s*$/);
    if (m) {
      title = m[1].trim();
      h1Idx = i;
      break;
    }
  }
  if (h1Idx >= 0) lines.splice(h1Idx, 1);
  text = lines.join('\n');

  const copied = [];
  const copyImage = (abs) => {
    const name = path.basename(abs);
    fs.mkdirSync(PUBLIC_IMG, { recursive: true });
    fs.copyFileSync(abs, path.join(PUBLIC_IMG, name));
    copied.push(name);
  };

  // 逐行改写，跳过围栏代码块
  let inFence = false;
  const out = [];
  for (const line of text.split('\n')) {
    if (/^\s*(```|~~~)/.test(line)) {
      inFence = !inFence;
      out.push(line);
      continue;
    }
    if (inFence) {
      out.push(line);
      continue;
    }
    let next = line
      // [text](target)
      .replace(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g, (m, t) => `](${rewriteTarget(srcRel, t, copyImage)})`)
      // <a href="t"> / <img src="t">
      .replace(/(\s(?:href|src)=")([^"]+)(")/g, (m, pre, t, post) => `${pre}${rewriteTarget(srcRel, t, copyImage)}${post}`);
    out.push(next);
  }

  const frontmatter = `---\ntitle: ${JSON.stringify(title)}\n---\n\n`;
  const dest = path.join(DOCS, `${slug}.md`);
  fs.mkdirSync(DOCS, { recursive: true });
  fs.writeFileSync(dest, frontmatter + out.join('\n'));
  stats.pages++;
  if (copied.length) report.push(`  ${srcRel}: 图片 ${copied.join(', ')}`);
}

fs.writeFileSync(path.join(ROOT, 'scripts/source-map.json'), JSON.stringify(SOURCES, null, 2));
console.log(`pages=${stats.pages} internal=${stats.internal} externalized=${stats.externalized} images=${stats.images}`);
if (report.length) console.log(report.join('\n'));
