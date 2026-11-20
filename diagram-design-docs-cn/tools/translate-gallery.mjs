// upstream-gallery/ 官方画廊 → site/gallery/ 中文产物(幂等)
// 口径(用户决策):SVG 样张与样张页(eyebrow/h1)保留英文原版零改动;
// 双语只做画廊导航层——index.html 的 89 个类型按钮(英文旁加中文)、UI 文案、icons.html。
// example-*.html 原样拷贝;按钮双语后 diagramName() 读文本节点,搜索/当前名/iframe 标题自动双语。
import { readFileSync, writeFileSync, readdirSync, cpSync, rmSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UP = join(ROOT, 'upstream-gallery');
const SITE = join(ROOT, 'site', 'gallery');

// 89 类型按钮双语名(eyebrow 编号保留,英文名后加中文)
const NAMES = {
  'Architecture': '架构图', 'Architecture · data lake': '数据湖版', 'Import · draw.io': '导入 · draw.io',
  'Secure paved road · animated': '安全铺装路 · 动画', 'Architecture · containment': '包含结构版',
  'Architecture delta': '架构差异图', 'IT current-state': 'IT 现状图', 'Flowchart': '流程图',
  'Import · Mermaid': '导入 · Mermaid', 'Import · Excalidraw': '导入 · Excalidraw',
  'Policy trace · animated': '策略追踪 · 动画', 'Sequence': '时序图', 'Sequence · OAuth': 'OAuth 版',
  'Import · PlantUML': '导入 · PlantUML', 'State': '状态机', 'State · lifecycle': '生命周期版',
  'ER': 'ER / 数据模型', 'Timeline': '时间线', 'Swimlane': '泳道图', 'Quadrant': '四象限图',
  'Quadrant · consultant': '咨询顾问版', 'Radar': '雷达图', 'Polar': '极坐标图', 'Loop': '循环 / 飞轮',
  'Loop · terminal': '终端风格版', 'Nested': '嵌套图', 'Tree': '树形图',
  'Tree · block decomposition': '块分解版', 'Org chart': '组织架构图', 'Layers': '层叠图',
  'Exploded axonometric': '分解轴测图', 'Exploded · phone': '手机拆解', 'Exploded · unboxing': '开箱',
  'Exploded · AI agent stack': 'AI 智能体栈', 'Exploded · keyboard': '键盘拆解',
  'Exploded · phone, animated': '手机拆解 · 动画', 'Exploded · unboxing, animated': '开箱 · 动画',
  'Exploded · AI agent stack, animated': 'AI 智能体栈 · 动画', 'Exploded · keyboard, animated': '键盘拆解 · 动画',
  'Axonometric plan': '轴测平面图', 'Axonometric plan · campus': '校园版',
  'Axonometric plan · coffee shop': '咖啡店版', 'Axonometric plan · warehouse': '仓储版',
  'Axonometric plan · campus, animated': '校园版 · 动画', 'Axonometric plan · coffee shop, animated': '咖啡店版 · 动画',
  'Axonometric plan · warehouse, animated': '仓储版 · 动画',
  'Venn': '维恩图', 'Pyramid': '金字塔 / 漏斗', 'Bar': '条形图', 'Waterfall': '瀑布图',
  'Treemap': '矩形树图', 'Marimekko': 'Marimekko 图', 'Heatmap': '热力图', 'Line': '折线图',
  'Line · slopegraph': '斜率图版', 'Line · ridgeline': '山脊图版', 'Line · streamgraph': '河流图版',
  'Line · bump': '凹凸图版', 'Gantt': '甘特图', 'Scatter': '散点图', 'Scatter · bubble': '气泡图版',
  'Scatter · beeswarm': '蜂群图版', 'Scatter · box plot': '箱线图版', 'High-Level': '总览架构',
  'High-Level / Parametric': '总览架构 / 参数化', 'Process': '过程图', 'Medallion': 'Medallion 分层',
  'Data flow': '数据流图', 'Fan-in queue · animated': '扇入队列 · 动画', 'DP integration': '数据平台集成',
  'DP security matrix': '数据平台安全矩阵', 'Sankey': '桑基图', 'Fishbone': '鱼骨图',
  'Wardley map': 'Wardley 地图', 'Kanban': '看板', 'User journey': '用户旅程图', 'Deployment': '部署图',
  'Dependency graph': '依赖图', 'Dependency · arc diagram': '弧线图版', 'UML class': 'UML 类图',
  'Story map': '用户故事地图', 'Database schema': '数据库结构', 'Service blueprint': '服务蓝图',
  'SBGN': 'SBGN 图', 'Requirement traceability': '需求追溯图', 'Event modeling': '事件建模图',
  'Steps': '步骤图', 'Unit Grid': '单元网格', 'Schedule network': '进度网络图',
};

const misses = [];
let totalHits = 0;
function apply(html, pairs, file) {
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sorted) {
    const n = html.split(from).length - 1;
    if (n === 0) { misses.push(`${file} :: ${from.slice(0, 70)}`); continue; }
    html = html.split(from).join(to);
    totalHits += n;
  }
  return html;
}
const esc = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// ---------- 中文变体词典(zh-merge.mjs 合并产物:core 定译 > 子代理批次) ----------
const dict = JSON.parse(readFileSync(join(ROOT, 'tools', 'gallery-zh-dict.json'), 'utf8'));

// ---------- 组装:upstream-gallery 全量拷贝 → index/icons 翻译 → example 原样 + -zh 变体 ----------
rmSync(SITE, { recursive: true, force: true });
cpSync(UP, SITE, { recursive: true });

// 中文样张变体:example-X.html → example-X-zh.html(SVG text 按词典译;技术词无映射自然保留)
let zhFiles = 0, zhText = 0;
for (const f of readdirSync(UP).filter(f => f.startsWith('example-') && f.endsWith('.html'))) {
  let h = readFileSync(join(UP, f), 'utf8');
  let hit = 0;
  h = h.replace(/<html lang="en">/, '<html lang="zh-CN">')
    .replace("--font-sans:     'Geist', system-ui, sans-serif", "--font-sans:     'Geist', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif")
    .replace("--font-serif:    'Instrument Serif', serif", "--font-serif:    'Instrument Serif', 'Songti SC', 'SimSun', serif")
    .replace("--font-mono:     'Geist Mono', ui-monospace, monospace", "--font-mono:     'Geist Mono', ui-monospace, 'PingFang SC', 'Microsoft YaHei', monospace")
    .replace(/<text([^>]*)>([^<]{1,150})<\/text>/g, (full, attrs, content) => {
      const t = content.trim();
      const zh = dict[t];
      if (!zh) return full;
      hit++;
      return `<text${attrs}>${content.replace(t, zh)}</text>`;
    });
  if (hit) { writeFileSync(join(SITE, f.replace(/\.html$/, '-zh.html')), h); zhFiles++; zhText += hit; }
}
console.log(`zh variants: ${zhFiles} files, ${zhText} text nodes translated`);

// index.html:UI + 按钮 + 当前名
let idx = readFileSync(join(UP, 'index.html'), 'utf8');
// 按钮双语:eyebrow span 闭合后的类型名行(换行锚定,防误伤 h1/aria)
const buttonPairs = [];
for (const [en, zh] of Object.entries(NAMES)) buttonPairs.push([`</span>${en}\n`, `</span>${en} ${zh}\n`]);
idx = apply(idx, [
  ['<html lang="en">', '<html lang="zh-CN">'],
  ['<title>Diagram Design · Gallery</title>', '<title>Diagram Design · 画廊</title>'],
  // 顶部标题右侧 中/EN 切换(默认中文,localStorage 记忆;切换保持 type/variant)
  ['<div class="header-actions">',
   `<div class="header-actions">
          <div class="tabs variants" id="lang-tabs" role="radiogroup" aria-label="图表语言">
            <button class="tab" data-lang="en" type="button">EN</button>
            <button class="tab active" data-lang="zh" type="button">中文</button>
          </div>`],
  ['const state = { type: "architecture", variant: "" };',
   'const state = { type: "architecture", variant: "", lang: (() => { try { return localStorage.getItem("dd-gallery-lang") || "zh"; } catch { return "zh"; } })() };'],
  ['src="example-architecture.html"', 'src="example-architecture-zh.html"'],
  ['search.addEventListener("input", filterDiagrams);',
   `search.addEventListener("input", filterDiagrams);
      document.querySelectorAll("#lang-tabs .tab").forEach((tab) => {
        tab.addEventListener("click", () => {
          if (state.lang === tab.dataset.lang) return;
          state.lang = tab.dataset.lang;
          try { localStorage.setItem("dd-gallery-lang", state.lang); } catch {}
          update();
        });
      });`],
  ['const src = `example-${state.type}${state.variant}.html`;',
   `const src = \`example-\${state.type}\${state.variant}\${state.lang === "zh" ? "-zh" : ""}.html\`;
        document.querySelectorAll("#lang-tabs .tab").forEach((tab) => {
          const on = tab.dataset.lang === state.lang;
          tab.classList.toggle("active", on);
          tab.setAttribute("aria-checked", String(on));
        });`],
  ['>· gallery</span', '>· 画廊</span'],
  ['>icon library ↗</a', '>图标库 ↗</a'],
  ['>open in new tab ↗</a', '>新标签页打开 ↗</a'],
  ['aria-label="Variant"', 'aria-label="变体"'],
  ['>Minimal light</button>', '>极简 · 浅色</button>'],
  ['>Minimal dark</button>', '>极简 · 深色</button>'],
  ['>Full editorial</button>', '>完整杂志风</button>'],
  ['aria-label="Diagram catalog"', 'aria-label="图表目录"'],
  ['>Find a diagram', '>查找图表'],
  ['placeholder="Search diagrams…"', 'placeholder="搜索图表…"'],
  ['>Click the preview to hide navigation</span>', '>点击预览可收起导航</span>'],
  ['No diagrams found. Try another search.', '没有找到图表。换个词试试。'],
  ['aria-label="Diagram type"', 'aria-label="图表类型"'],
  ['title="Preview"', 'title="预览"'],
  ['iframe.title = `${name} preview`;', 'iframe.title = `${name} 预览`;'],
  ['<p class="current-diagram" id="current-diagram">Architecture</p>', '<p class="current-diagram" id="current-diagram">Architecture 架构图</p>'],
  // CJK fallback(双引号 8 空格形态)
  ['--sans: "Geist", system-ui, sans-serif;', '--sans: "Geist", system-ui, "PingFang SC", "Microsoft YaHei", sans-serif;'],
  ['--serif: "Instrument Serif", serif;', '--serif: "Instrument Serif", "Songti SC", "SimSun", serif;'],
  ['--mono: "Geist Mono", ui-monospace, monospace;', '--mono: "Geist Mono", ui-monospace, "PingFang SC", "Microsoft YaHei", monospace;'],
  // nav-toggle 按钮文本(缩进换行形态)
  ['aria-controls="diagram-nav">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>\n            Diagrams\n          </button>',
   'aria-controls="diagram-nav">\n            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M4 6h16M4 12h16M4 18h16"/></svg>\n            图表目录\n          </button>'],
  ...buttonPairs,
], 'gallery/index.html');
writeFileSync(join(SITE, 'index.html'), idx);

// icons.html:页面级文案(87 个图标 SVG <title> 是产品名,不译;subtitle 含 <a> 链接整段替换)
let icons = readFileSync(join(UP, 'icons.html'), 'utf8');
icons = apply(icons, [
  ['<html lang="en">', '<html lang="zh-CN">'],
  ['<title>Icon library · Diagram Design</title>', '<title>图标库 · Diagram Design</title>'],
  ['>Icons · Diagram Design</p>', '>图标库 · Diagram Design</p>'],
  ['<h1>Icon library</h1>', '<h1>图标库</h1>'],
  ['<p class="subtitle">A small, monochrome library for IT/cloud illustrations. Stroked icons from <a href="https://tabler.io/icons" style="color:inherit">Tabler Icons</a> (MIT); brand silhouettes from <a href="https://simpleicons.org" style="color:inherit">Simple Icons</a> (CC0). Every icon uses <code>currentColor</code> so it inherits ink from its parent.</p>',
   '<p class="subtitle">一套小巧的单色 IT / 云插画图标库。描边图标来自 <a href="https://tabler.io/icons" style="color:inherit">Tabler Icons</a>(MIT),品牌剪影来自 <a href="https://simpleicons.org" style="color:inherit">Simple Icons</a>(CC0)。每个图标使用 <code>currentColor</code>,继承父级的墨色。</p>'],
  ["--font-sans:     'Geist', system-ui, sans-serif", "--font-sans:     'Geist', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"],
  ["--font-serif:    'Instrument Serif', serif", "--font-serif:    'Instrument Serif', 'Songti SC', 'SimSun', serif"],
  ["--font-mono:     'Geist Mono', ui-monospace, monospace", "--font-mono:     'Geist Mono', ui-monospace, 'PingFang SC', 'Microsoft YaHei', monospace"],
], 'gallery/icons.html');
writeFileSync(join(SITE, 'icons.html'), icons);

console.log(`done: ${totalHits} replacements, ${readdirSync(SITE).length} files in site/gallery`);
if (misses.length) {
  console.log(`\n${misses.length} MISS:`);
  for (const m of misses) console.log('  ' + m);
  process.exitCode = 1;
} else console.log('all pairs hit, no misses');
