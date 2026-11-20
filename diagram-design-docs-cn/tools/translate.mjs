// upstream/ 英文底稿 → site/ 中文产物（幂等：每次从 upstream 全量重跑）
// 替换器：精确子串替换，按 from 长度降序应用（长串永远先换，杜绝子串误伤）；
// 按文件分组注入映射，0 命中即 miss 打印——分组后 miss 应为 0，非 0 必是原文核对问题。
// SVG 短标签一律用 >X</text> 或 data-name="X" 锚定，避免 "Data" 误伤 "Database"。
// 注意：原文撇号全部是直撇 '（0x27），引号是弯引号 “ ”。
import { readFileSync, writeFileSync, readdirSync, cpSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const UP = join(ROOT, 'upstream');
const SITE = join(ROOT, 'site');

// ---------- 基础块 ----------
const LANG = [['<html lang="en">', '<html lang="zh-CN">']];

// index 首页 CSS（紧凑形态）
const FONT_INDEX = [
  ['--serif:"Instrument Serif",Georgia,"Times New Roman",serif;', '--serif:"Instrument Serif",Georgia,"Times New Roman","Songti SC","SimSun",serif;'],
  ['--sans:"Geist",system-ui,-apple-system,sans-serif;', '--sans:"Geist",system-ui,-apple-system,"PingFang SC","Hiragino Sans GB","Microsoft YaHei",sans-serif;'],
  ['--mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,monospace;', '--mono:"Geist Mono",ui-monospace,"SF Mono",Menlo,"PingFang SC","Microsoft YaHei",monospace;'],
];
// examples 静态页 CSS（5 空格缩进形态）
const FONT_EX = [
  ["--font-mono:     'Geist Mono', ui-monospace, monospace", "--font-mono:     'Geist Mono', ui-monospace, 'PingFang SC', 'Microsoft YaHei', monospace"],
  ["--font-sans:     'Geist', system-ui, sans-serif", "--font-sans:     'Geist', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"],
  ["--font-serif:    'Instrument Serif', serif", "--font-serif:    'Instrument Serif', 'Songti SC', 'SimSun', serif"],
];
// examples 动画页 CSS（单空格形态，serif 已带 Noto Serif KR）
const FONT_ANIM = [
  ["--font-sans: 'Geist', system-ui, sans-serif", "--font-sans: 'Geist', system-ui, 'PingFang SC', 'Microsoft YaHei', sans-serif"],
  ["--font-serif: 'Instrument Serif', 'Noto Serif', 'Noto Serif KR', serif", "--font-serif: 'Instrument Serif', 'Noto Serif', 'Noto Serif KR', 'Songti SC', 'SimSun', serif"],
  ["--font-mono: 'Geist Mono', ui-monospace, monospace", "--font-mono: 'Geist Mono', ui-monospace, 'PingFang SC', 'Microsoft YaHei', monospace"],
];
// 动画控件（3 个 animated 页共用；步数 3/4 按页注入）
const MOTION = [
  ['aria-label="Diagram playback controls"', 'aria-label="图表播放控件"'],
  ['>Play<', '>播放<'],
  ['>Pause<', '>暂停<'],
  ['>Next<', '>下一帧<'],
  ['>Previous<', '>上一帧<'],
  ['>Replay<', '>重播<'],
  ['>Step <span data-motion-step-label>', '>第 <span data-motion-step-label>'],
  ['←/→ step · Space play/pause · R replay · Home/End jump', '←/→ 逐帧 · 空格 播放/暂停 · R 重播 · Home/End 跳转'],
];
const OF3 = [['</span> of 3', '</span> 步 / 共 3 步']];
const OF4 = [['</span> of 4', '</span> 步 / 共 4 步']];
// eyebrow 按类型/形态拆开（每页只有一条）
const EY_EXPLODED_DD = [['>Exploded axonometric · Diagram Design</p>', '>分解轴测图 · Diagram Design</p>']];
const EY_AXON_DD = [['>Axonometric plan · Diagram Design</p>', '>轴测平面图 · Diagram Design</p>']];
const EY_EXPLODED_OM = [['>Exploded axonometric · Optional motion</p>', '>分解轴测图 · 可选动效</p>']];
const EY_AXON_OM = [['>Axonometric plan · Optional motion</p>', '>轴测平面图 · 可选动效</p>']];

// ---------- examples 内容块 ----------
const C_EXPLODED = [
  ['App stack · Three layers, one product', '应用栈 · 三层，一个产品'],
  ['Exploded view of a three-layer app stack: data at the base, logic in the middle, interface on top, with logic as the focal layer.', '三层应用栈的分解视图：数据在底、逻辑居中、界面在顶，逻辑为焦点层。'],
  ['>Data</text>', '>数据</text>'], ['data-name="Data"', 'data-name="数据"'],
  ['>postgres, object store</text>', '>postgres、对象存储</text>'],
  ['>Logic</text>', '>逻辑</text>'], ['data-name="Logic"', 'data-name="逻辑"'],
  ['>api, workers, queue</text>', '>api、workers、队列</text>'],
  ['>Interface</text>', '>界面</text>'], ['data-name="Interface"', 'data-name="界面"'],
  ['>web app, mobile</text>', '>Web 应用、移动端</text>'],
  ['>FOCAL LAYER</text>', '>焦点层</text>'],
  ['Logic is where the product decisions live; the other two layers are swappable.', '逻辑层承载产品决策；另外两层皆可替换。'],
];
const C_PHONE = [
  ['Phone teardown · What sits under the glass', '手机拆解 · 玻璃之下有什么'],
  ['Exploded view of a phone: the display lifts off the housing to show the logic board and battery inside, with the logic board as the focal part.', '一部手机的分解视图：屏幕从外壳上掀起，露出里面的主板与电池，主板为焦点部件。'],
  ['>Housing</text>', '>外壳</text>'], ['>aluminium frame</text>', '>铝合金边框</text>'],
  ['>Logic board</text>', '>主板</text>'], ['>soc, cameras</text>', '>SoC、摄像头</text>'],
  ['>Battery</text>', '>电池</text>'], ['>li-ion cell</text>', '>锂离子电芯</text>'],
  ['>Display</text>', '>屏幕</text>'], ['>oled, cover glass</text>', '>OLED、盖板玻璃</text>'],
];
// 仅 animated 版出现的部件 aria
const C_PHONE_ARIA = [
  ['Housing stays put; trace lines show where each part sat', '外壳固定不动；trace 线标出各部件原位'],
  ['Logic board lifts clear', '主板升起脱离'],
  ['Battery lifts clear', '电池升起脱离'],
  ['Display lifts clear', '屏幕掀起脱离'],
  ['Animation controls require JavaScript. The complete exploded diagram is shown above.', '动画控件需要 JavaScript。上方已展示完整的分解图。'],
];
const C_UNBOX = [
  ['Unboxing · What you see, in the order you see it', '开箱 · 按你看到的顺序呈现'],
  ['Exploded view of product packaging: printed lid, the speaker and its cable, the moulded insert that holds them, and the rigid box, with the speaker as the focal part.', '产品包装的分解视图：印刷盒盖、音箱与线缆、承托它们的纸浆内衬与硬质包装盒，音箱为焦点部件。'],
  ['>Box</text>', '>包装盒</text>'], ['>rigid board</text>', '>硬纸板</text>'],
  ['>Insert</text>', '>内衬</text>'], ['>moulded pulp</text>', '>纸浆模塑</text>'],
  ['>Cable</text>', '>线缆</text>'], ['>usb-c, 1 m</text>', '>USB-C，1 米</text>'],
  ['>Speaker</text>', '>音箱</text>'], ['>the product</text>', '>产品本体</text>'],
  ['>Lid</text>', '>盒盖</text>'], ['>printed sleeve</text>', '>印刷封套</text>'],
];
// 仅 animated 版出现的部件 aria
const C_UNBOX_ARIA = [
  ['Box stays put; trace lines show where each part sat', '包装盒固定不动；trace 线标出各部件原位'],
  ['Insert lifts clear', '内衬升起脱离'],
  ['Cable lifts clear', '线缆升起脱离'],
  ['Speaker lifts clear', '音箱升起脱离'],
  ['Animation controls require JavaScript. The complete exploded diagram is shown above.', '动画控件需要 JavaScript。上方已展示完整的分解图。'],
];
const C_PLAN = [
  ['Level 3 office · Where the team actually sits', '三层办公区 · 团队真正落座的地方'],
  ['Axonometric floor plan of an office level with an open office, meeting room, kitchen, lobby, and phone booth, with the meeting room as the focal room.', '一层办公室的轴测平面图：开放办公区、会议室、厨房、前台与电话亭，会议室为焦点房间。'],
  ['>Open office</text>', '>开放办公区</text>'], ['>24 desks</text>', '>24 工位</text>'],
  ['>Meeting room</text>', '>会议室</text>'], ['>12 seats</text>', '>12 座</text>'],
  ['>Kitchen</text>', '>厨房</text>'], ['>café, lockers</text>', '>咖啡角、储物柜</text>'],
  ['>Lobby</text>', '>前台大厅</text>'], ['>reception</text>', '>接待</text>'],
  ['>Booth</text>', '>电话亭</text>'], ['>1 person</text>', '>1 人</text>'],
  ['>FOCAL ROOM</text>', '>焦点房间</text>'],
  ['Walls cut at desk height so every room reads from one view; the meeting room is the one under discussion.', '墙体在桌面高度剖切，所有房间一个视图读全；会议室正是本次讨论的对象。'],
];
const C_CAMPUS = [
  ['North campus · Three phases, six buildings', '北区校园 · 三期建设，六栋楼宇'],
  ['Campus site plan with the library and labs in phase 1, two dorms in phase 2, and the sports hall and parking in phase 3, with the library as the focal building.', '校园总平面：一期建图书馆与实验楼，二期两栋宿舍，三期体育馆与停车场，图书馆为焦点建筑。'],
  ['>Library</text>', '>图书馆</text>'], ['>Dorm A</text>', '>宿舍 A</text>'],
  ['>Labs</text>', '>实验楼</text>'], ['>Dorm B</text>', '>宿舍 B</text>'],
  ['>Parking</text>', '>停车场</text>'], ['>Sports hall</text>', '>体育馆</text>'],
  ['>phase 1</text>', '>一期</text>'], ['>phase 2</text>', '>二期</text>'], ['>phase 3</text>', '>三期</text>'],
  ['>FOCAL BUILDING</text>', '>焦点建筑</text>'],
  ['The library opens in phase 1 and anchors the quad; housing and sport follow as enrolment grows.', '图书馆一期开放并锚定庭院；宿舍与体育馆随招生规模陆续跟进。'],
];
// 仅 animated 版出现的建筑 aria
const C_CAMPUS_ARIA = [
  ['aria-label="Library, phase 1"', 'aria-label="图书馆，一期"'],
  ['aria-label="Dorm A, phase 2"', 'aria-label="宿舍 A，二期"'],
  ['aria-label="Labs, phase 1"', 'aria-label="实验楼，一期"'],
  ['aria-label="Dorm B, phase 2"', 'aria-label="宿舍 B，二期"'],
  ['aria-label="Parking, phase 3"', 'aria-label="停车场，三期"'],
  ['aria-label="Sports hall, phase 3"', 'aria-label="体育馆，三期"'],
  ['Animation controls require JavaScript. The complete site plan is shown above.', '动画控件需要 JavaScript。上方已展示完整的校园总平面。'],
];

const FILE_MAP = {
  'exploded.html': [...LANG, ...FONT_EX, ...EY_EXPLODED_DD, ...C_EXPLODED],
  'exploded-phone.html': [...LANG, ...FONT_EX, ...EY_EXPLODED_DD, ...C_PHONE],
  'exploded-phone-animated.html': [...LANG, ...FONT_ANIM, ...EY_EXPLODED_OM, ...MOTION, ...OF3, ...C_PHONE, ...C_PHONE_ARIA],
  'exploded-unboxing.html': [...LANG, ...FONT_EX, ...EY_EXPLODED_DD, ...C_UNBOX],
  'exploded-unboxing-animated.html': [...LANG, ...FONT_ANIM, ...EY_EXPLODED_OM, ...MOTION, ...OF4, ...C_UNBOX, ...C_UNBOX_ARIA],
  'axonometric-plan.html': [...LANG, ...FONT_EX, ...EY_AXON_DD, ...C_PLAN],
  'axonometric-plan-campus.html': [...LANG, ...FONT_EX, ...EY_AXON_DD, ...C_CAMPUS],
  'axonometric-plan-campus-animated.html': [...LANG, ...FONT_ANIM, ...EY_AXON_OM, ...MOTION, ...OF3, ...C_CAMPUS, ...C_CAMPUS_ARIA],
};

// ---------- index.html ----------
const INDEX = [
  ...LANG, ...FONT_INDEX,
  // head
  ['<title>Diagram Design: editorial diagrams your designer won\'t hate</title>', '<title>Diagram Design：让你的设计师不再嫌弃的杂志级图表</title>'],
  ['Diagram Design: editorial diagrams your designer won\'t hate', 'Diagram Design：让你的设计师不再嫌弃的杂志级图表'],
  ['An agent skill for Claude Code, Codex, Pi and other agent hosts that turns plain English into editorial-quality diagrams. 50 types, self-contained HTML + SVG, brand-matched to your site in ~60s. No Figma, no rounded-box slop.', '一项面向 Claude Code、Codex、Pi 及其他智能体宿主的技能，把大白话变成杂志级品质的图表。50 种类型，自包含 HTML + SVG，约 60 秒匹配你的网站品牌。不用 Figma，没有圆角框俗套。'],
  ['50 editorial diagram types for Claude Code, Codex, Pi and other agent hosts. Self-contained HTML + SVG, brand-matched in ~60s.', '面向 Claude Code、Codex、Pi 及其他智能体宿主的 50 种杂志级图表类型。自包含 HTML + SVG，约 60 秒完成品牌匹配。'],
  // header
  ['aria-label="Diagram Design home"', 'aria-label="Diagram Design 首页"'],
  ['aria-label="Sections"', 'aria-label="页面分区"'],
  ['<a href="#what">What</a>', '<a href="#what">是什么</a>'],
  ['<a href="#install">Install</a>', '<a href="#install">安装</a>'],
  ['<a href="#use">Use</a>', '<a href="#use">使用</a>'],
  ['<a href="#gallery">Gallery</a>', '<a href="#gallery">画廊</a>'],
  ['aria-label="Light mode"', 'aria-label="切换浅色模式"'],
  ['<span class="d">Dark</span><span class="l">Light</span>', '<span class="d">深色</span><span class="l">浅色</span>'],
  ['aria-label="GitHub stars"', 'aria-label="GitHub star 数"'],
  // hero
  ['<div>Drawing<b>Editorial diagrams</b></div>', '<div>绘制<b>杂志级图表</b></div>'],
  ['<div>Runs on<b>Claude Code · Codex · Pi</b></div>', '<div>运行于<b>Claude Code · Codex · Pi</b></div>'],
  ['<div>Output<b>HTML + inline SVG</b></div>', '<div>产出<b>HTML + 内联 SVG</b></div>'],
  ['Editorial diagrams<br>your designer <span class="em">won\'t hate</span>.', '杂志级图表，<br>你的设计师<span class="em">不再嫌弃</span>。'],
  ['<b>50 diagram types</b>, drawn by your coding agent as self-contained HTML&nbsp;+&nbsp;SVG, then brand-matched to your own site in about a minute. No Figma. No rounded-box slop.', '<b>50 种图表类型</b>，由你的编码智能体绘成自包含的 HTML&nbsp;+&nbsp;SVG，再花约一分钟匹配你自己网站的品牌。不用 Figma，没有圆角框俗套。'],
  ['50 types · 6 agents · 0 build steps', '50 种类型 · 6 个智能体 · 0 构建步骤'],
  ['Install the skill', '安装技能'],
  ['View on GitHub', '在 GitHub 上查看'],
  ['Hit #1 on GitHub Trending', '曾登顶 GitHub Trending'],
  ['</span> stars</span>', '</span> star</span>'],
  ['Open source · MIT', '开源 · MIT'],
  ['<span>Fig. 01 · the skill, drawn by the skill</span><span>exploded axonometric</span>', '<span>图 01 · 技能自绘自画像</span><span>分解轴测图</span>'],
  // hero SVG（dark/light 两份同串）
  ['>From a sentence to a finished diagram</title>', '>从一句话到一张成品图表</title>'],
  ['Exploded view of how the diagram-design skill works: your prompt at the base, then SKILL.md picking one of 50 types, the type reference with layout and density rules as the focal layer, your style tokens, and a single HTML and SVG file on top.', 'diagram-design 技能工作原理的分解视图：底层是你的提示词，往上是 SKILL.md 从 50 种类型中选出一种，焦点层是带布局与密度规则的类型参考，再往上是你的风格令牌，顶端是一个单独的 HTML 与 SVG 文件。'],
  ['>Your prompt</text>', '>你的提示词</text>'],
  ['>“draw our deploy flow”</text>', '>“画一下我们的部署流程”</text>'],
  ['>picks 1 of 50 types</text>', '>从 50 种类型中选 1 种</text>'],
  ['>Type reference</text>', '>类型参考</text>'],
  ['>layout and density rules</text>', '>布局与密度规则</text>'],
  ['>Style tokens</text>', '>风格令牌</text>'],
  ['>your brand, one accent</text>', '>你的品牌，单一强调色</text>'],
  ['>one file, no build step</text>', '>一个文件，零构建步骤</text>'],
  ['>FIG. 01 · EXPLODED AXONOMETRIC</text>', '>图 01 · 分解轴测图</text>'],
  ['>5 LAYERS · 1 ACCENT</text>', '>5 层 · 1 强调色</text>'],
  // demo
  ['<span>Fig. 00 · the skill at work</span><span>17s · no sound</span>', '<span>图 00 · 技能实战</span><span>17 秒 · 无声</span>'],
  ['Demo: a prompt typed in an agent session becomes an architecture diagram, then a before and after, then the 44 diagram types.', '演示：在智能体会话里输入一句提示词变成一张架构图，随后是改造前后对比，再是 44 种图表类型。'],
  // why
  ['The model had the content.<br>It was missing the taste.', '模型不缺内容，<br>缺的是品味。'],
  ['Same content, two passes: Claude on its own, then Claude with the skill.', '同样的内容画两遍：先是 Claude 自己画，再是 Claude 带着本技能画。'],
  ['aria-label="View the first-pass diagram full size"', 'aria-label="查看第一遍图表全尺寸"'],
  ['<span>Fig. 02a</span><span class="n">First pass · no skill</span>', '<span>图 02a</span><span class="n">第一遍 · 无技能</span>'],
  ['<span>REDRAWN</span>', '<span>重绘</span>'],
  ['aria-label="View the redrawn diagram full size"', 'aria-label="查看重绘图表全尺寸"'],
  ['<span>Fig. 02b</span><span class="n">Redrawn with the skill</span>', '<span>图 02b</span><span class="n">用技能重绘</span>'],
  ['A first-pass lifecycle diagram from Claude with no skill: six identical white cards in a row with blue number badges, and a dark bar underneath reading AI plus Governance plus Humans.', 'Claude 无技能时画的第一遍生命周期图：六张一模一样的白色卡片排成一行，带蓝色数字角标，下方一条深色横条写着 AI、治理与人工。'],
  ['The same lifecycle redrawn with the skill: six stages from Idea to Run and Change, each with an Intent, Guardrail and Outcome row, Triage as the one highlighted stage, and an operating model strip underneath.', '用技能重绘的同一张生命周期图：从构想到运行与变更的六个阶段，每阶段带意图、护栏、结果三行，分诊是唯一高亮阶段，下方附运营模式条。'],
  ['Enlarge', '放大'],
  ['<b>One accent, not six.</b> Color points at the single node that matters, nothing else.', '<b>一个强调色，不是六个。</b>颜色只指向唯一重要的那个节点，别无其他。'],
  ['<b>Real hierarchy.</b> Type weight and grouping carry the meaning, not a rainbow of fills.', '<b>真实的层级。</b>字重与分组承载语义，而非一道彩虹填充。'],
  ['<b>Structure you can read.</b> Every stage answers the same three questions: intent, guardrail, outcome. Read across a row and you see the whole system.', '<b>可读的结构。</b>每个阶段回答同样的三个问题：意图、护栏、结果。横着读完一行，整个系统尽收眼底。'],
  ['“The model already understood the content. What it was missing was taste, so I wrote the taste down.”', '“模型早已理解内容。它缺的是品味，于是我把品味写了下来。”'],
  ['Cathryn Lavery · a generic tool asks “where should this box go?” This one asks “does this box deserve to exist?”', 'Cathryn Lavery · 通用工具问的是“这个框放哪儿？”，它问的是“这个框配存在吗？”'],
  // what
  ['<h2 class="rise">What you get</h2>', '<h2 class="rise">你能得到什么</h2>'],
  ['It runs inside the agent you already use. Nothing new to open, nothing to export.', '它运行在你已经在用的智能体里。不用打开新工具，不用导出任何东西。'],
  ['<h3>50 visual types</h3>', '<h3>50 种视觉类型</h3>'],
  ['Architecture, Sankey, heatmap, exploded axonometric, database schema and more. Each is a real type with its own rules, not one box style restyled 50 ways.', '架构图、桑基图、热力图、分解轴测图、数据库结构等等。每一种都是有自身规则的真实类型，而不是同一种框样式换 50 张皮。'],
  ['<h3>Brand-matched in ~60s</h3>', '<h3>约 60 秒品牌匹配</h3>'],
  ['Point it at your site. It reads your colors and fonts and applies them to every diagram it draws.', '把它指向你的网站。它读取你的配色与字体，并应用到它画的每一张图上。'],
  ['<h3>Self-contained HTML + SVG</h3>', '<h3>自包含 HTML + SVG</h3>'],
  ['One file. Opens double-clicked, offline. No build step, no dashboard, nothing to host.', '一个文件。双击即开，离线可用。没有构建步骤、没有控制台、没有任何要托管的东西。'],
  ['<h3>Imports draw.io, Mermaid &amp; Excalidraw</h3>', '<h3>导入 draw.io、Mermaid 与 Excalidraw</h3>'],
  ['Point it at a source and it <em>redraws</em> (not converts) at the size, detail and audience your destination needs.', '把它指向来源文件，它会按目标场合需要的尺寸、细节与受众<em>重绘</em>（而非转换）。'],
  ['<h3>Optional accessible motion</h3>', '<h3>可选的无障碍动效</h3>'],
  ['Diagrams can animate when it helps the explanation. Static is the default.', '当动效有助于讲解时，图表可以动起来。默认保持静态。'],
  ['<h3>Accessible by default</h3>', '<h3>默认无障碍</h3>'],
  ['Screen readers announce each diagram’s title and description, not a blank rectangle.', '屏幕阅读器会读出每张图表的标题与描述，而不是一块空白矩形。'],
  // axonometric（alt/aria 与 gallery 卡同串，由 CARDS 统一处理，此处不重复列）
  ['<h2 class="rise">New: two axonometric types</h2>', '<h2 class="rise">新增：两种轴测类型</h2>'],
  ['One 2:1 projection, two jobs. Static by default, with animated examples.', '一套 2:1 投影，两种用途。默认静态，附动画示例。'],
  ['<span class="t">Exploded axonometric</span><span>Fig. 04a</span>', '<span class="t">分解轴测图</span><span>图 04a</span>'],
  ['<h3>Exploded axonometric</h3>', '<h3>分解轴测图</h3>'],
  ['Parts of one object pulled apart along one axis: a teardown, an unboxing, assembly order. Every part sits at an equal gap, and every coordinate comes from one projection function.', '把一个物体的各部分沿同一根轴拉开：拆解、开箱、装配顺序。每个部件间距相等，每个坐标都出自同一个投影函数。'],
  ['>App stack</a>', '>应用栈</a>'],
  ['>Phone teardown</a>', '>手机拆解</a>'],
  ['>Unboxing</a>', '>开箱</a>'],
  ['>Phone, animated</a>', '>手机（动画）</a>'],
  ['>Unboxing, animated</a>', '>开箱（动画）</a>'],
  ['<span class="t">Axonometric plan</span><span>Fig. 04b</span>', '<span class="t">轴测平面图</span><span>图 04b</span>'],
  ['<h3>Axonometric plan</h3>', '<h3>轴测平面图</h3>'],
  ['One floor or site seen from above at an angle: rooms with furniture, buildings by phase. Walls are cut at desk height so every room reads from a single view.', '从斜上方俯瞰的一层楼或一个园区：带家具的房间、按阶段标注的楼宇。墙体在桌面高度剖切，让所有房间在一个视图里一览无余。'],
  ['>Office floor</a>', '>办公楼层</a>'],
  ['>Campus</a>', '>园区</a>'],
  ['>Campus by phase, animated</a>', '>园区分期（动画）</a>'],
  // gallery 头尾
  ['<h2 class="rise">Fifty diagrams, one system</h2>', '<h2 class="rise">五十种图表，一套体系</h2>'],
  ['Browse the live gallery →', '浏览线上画廊 →'],
  ['Show all 50 types', '展示全部 50 种类型'],
  // install
  ['<h2 class="rise">Install</h2>', '<h2 class="rise">安装</h2>'],
  ['Start with the first card. Click any card to copy.', '从第一张卡开始。点击任意卡片即可复制。'],
  ['Any agent · Cursor and more', '任意智能体 · Cursor 等'],
  ['aria-label="Copy the npx skills install command"', 'aria-label="复制 npx skills 安装命令"'],
  ['<span class="c"># one command, every skills host</span>', '<span class="c"># 一条命令，适配所有技能宿主</span>'],
  ['For Cursor, Cline, Gemini CLI, Windsurf and other skills hosts. Update with <b>npx skills update diagram-design</b>.', '适用于 Cursor、Cline、Gemini CLI、Windsurf 等技能宿主。用 <b>npx skills update diagram-design</b> 更新。'],
  ['aria-label="Copy Claude Code install commands"', 'aria-label="复制 Claude Code 安装命令"'],
  ['<span class="c"># add + install</span>', '<span class="c"># 添加 + 安装</span>'],
  ['Then enable auto-update once in <b>/plugin → Marketplaces</b>.', '然后在 <b>/plugin → Marketplaces</b> 里开启一次自动更新。'],
  ['aria-label="Copy Codex install commands"', 'aria-label="复制 Codex 安装命令"'],
  ['Codex refreshes Git marketplaces at startup.', 'Codex 会在启动时刷新 Git 插件市场。'],
  ['aria-label="Copy Pi install command"', 'aria-label="复制 Pi 安装命令"'],
  ['<span class="c"># install from GitHub</span>', '<span class="c"># 从 GitHub 安装</span>'],
  ['Run <b>/reload</b> in an open Pi session.', '在已打开的 Pi 会话里运行 <b>/reload</b>。'],
  ['aria-label="Copy GitHub Copilot install commands"', 'aria-label="复制 GitHub Copilot 安装命令"'],
  ['Confirm with <b>copilot skill list</b>, then ask for a diagram.', '用 <b>copilot skill list</b> 确认，然后直接开口要图。'],
  ['aria-label="Copy Factory Droid install commands"', 'aria-label="复制 Factory Droid 安装命令"'],
  ['Droid tracks updates by commit. Start a new session after updating.', 'Droid 按 commit 跟踪更新。更新后请开启新会话。'],
  ['aria-label="Copy Qoder install commands"', 'aria-label="复制 Qoder 安装命令"'],
  ['<span class="c"># clone + install</span>', '<span class="c"># 克隆 + 安装</span>'],
  ['Start a new task after installing. Qoder IDE takes a ZIP upload, see the README.', '安装后开启新任务。Qoder IDE 走 ZIP 上传，见 README。'],
  ['">Copy</button>', '">复制</button>'],
  ['>Codex, Pi, Copilot, Droid, Qoder</button>', '>Codex、Pi、Copilot、Droid、Qoder</button>'],
  ['Kiro and OpenCode take the <b>skills/diagram-design</b> folder directly, see the README. Editable install? <b>git clone</b> the repo and symlink <b>skills/diagram-design</b>. Saved profiles in <b>~/.diagram-design/profiles/</b> survive updates.', 'Kiro 和 OpenCode 直接使用 <b>skills/diagram-design</b> 目录，见 README。想要可编辑安装？<b>git clone</b> 本仓库并软链 <b>skills/diagram-design</b>。保存在 <b>~/.diagram-design/profiles/</b> 的配置档案更新后依然保留。'],
  // use
  ['<h2 class="rise">Then just ask</h2>', '<h2 class="rise">然后，开口要就行</h2>'],
  ['Describe what you want in a sentence. No syntax, no config.', '一句话描述你想要什么。没有语法，没有配置。'],
  ['“Make me an <b>architecture diagram</b> of my app: frontend, backend, database, Redis cache.”', '“给我的应用画一张<b>架构图</b>：前端、后端、数据库、Redis 缓存。”'],
  ['“I need a <b>quadrant</b> of Q2 projects by impact vs effort.”', '“我要一张二季度项目的<b>四象限图</b>，按影响力对比工作量。”'],
  ['“<b>onboard</b> diagram-design to <em>https://yoursite.com</em>”', '“把 diagram-design <b>接入</b> <em>https://yoursite.com</em>”'],
  ['“<b>redraw</b> this <em>.drawio</em> file for my deck.”', '“<b>重绘</b>这个 <em>.drawio</em> 文件，用在我的演示文稿里。”'],
  ['<span>or start from a template</span>', '<span>或从模板开始</span>'],
  ['<span class="c"># copy a scaffold and edit</span>', '<span class="c"># 复制一份脚手架再修改</span>'],
  ['<figcaption>Fig. 03 · one turn<span>no syntax · one file</span></figcaption>', '<figcaption>图 03 · 一轮对话<span>无语法 · 一个文件</span></figcaption>'],
  ['<div class="term-bar">agent session', '<div class="term-bar">智能体会话'],
  [' make me an architecture diagram of my app', ' 给我的应用画一张架构图'],
  ['reads your brand · picks type: architecture', '读取你的品牌 · 选定类型：架构图'],
  ['  states the plan, then draws', '  先说明计划，再动笔'],
  ['<span class="ok">wrote</span> architecture.html', '<span class="ok">写出</span> architecture.html'],
  ['  one file, opens offline', '  一个文件，离线可开'],
  // modal + footer + JS 可见串
  ['aria-label="Diagram, full size"', 'aria-label="图表，全尺寸"'],
  ['<span>Esc or click outside to close</span>', '<span>按 Esc 或点击空白处关闭</span>'],
  ['aria-label="Close image"', 'aria-label="关闭图片"'],
  ['Made by <a href="https://littlemight.com?utm_source=diagramdesign.dev&utm_medium=site&utm_campaign=footer">Cathryn Lavery</a>.', '由 <a href="https://littlemight.com?utm_source=diagramdesign.dev&utm_medium=site&utm_campaign=footer">Cathryn Lavery</a> 制作。'],
  ['<p class="m">Editorial diagrams, written down as a skill.</p>', '<p class="m">杂志级图表，写成一项技能。</p>'],
  ['<h4>Project</h4>', '<h4>项目</h4>'],
  ['<h4>Elsewhere</h4>', '<h4>别处</h4>'],
  ['>GitHub repository</a>', '>GitHub 仓库</a>'],
  ['>Live gallery</a>', '>线上画廊</a>'],
  ['>Documentation</a>', '>文档</a>'],
  ['<span>Sheet 1 of 1</span>', '<span>图页 1 / 1</span>'],
  ["btn.textContent='Copied';", "btn.textContent='已复制';"],
  ["(label||'Diagram')+', full size'", "(label||'图表')+'，全尺寸'"],
];

// ---------- gallery 50 卡（title / aria / alt / desc；含 axonometric 区共用串） ----------
const CARDS = [
  ['Architecture', '架构图', 'Components + connections in one system snapshot', '一个系统快照中的组件与连接', 'Architecture diagram showing reader requests moving through Cloudflare to an Astro origin, MDX bundle, and content CMS.', '架构图：读者请求经 Cloudflare 到 Astro 源站、MDX 打包与内容 CMS。'],
  ['Architecture delta', '架构差异图', 'Structural change between synchronized Before / After topologies, with a Changes ledger', '同步的前后拓扑之间的结构变化，附变更台账', 'Architecture delta for order fulfilment: a durable order queue replaces the legacy dispatcher, Orders API moves from v1 to v2, and seven component and relationship changes are listed between the before and after snapshots.', '订单履约的架构差异：持久化订单队列取代遗留派发器，Orders API 从 v1 迁到 v2，前后快照之间列出七项组件与关系变更。'],
  ['IT current-state', 'IT 现状图', 'Legacy IT landscape by phase or department; shows the before state', '按阶段或部门绘制的遗留 IT 全景；呈现改造前的现状', 'Three zones show collection, processing, and dissemination through manual file handoffs.', '三个区域展示采集、加工与分发，全程靠人工交接文件。'],
  ['Flowchart', '流程图', 'Decision logic with branches', '带分支的决策逻辑', 'Flowchart showing when a new workflow should stay manual, become a project note, or be written as a reusable skill.', '流程图：一个新工作流何时保持人工、何时记为项目备忘、何时写成可复用的技能。'],
  ['Sequence', '时序图', 'Time-ordered messages between actors', '参与者之间按时间排序的消息', 'Sequence diagram showing a cold-cache article request moving from reader and browser through Cloudflare to an Astro origin and analytics beacon.', '时序图：一次冷缓存文章请求从读者与浏览器经 Cloudflare 到 Astro 源站与分析信标。'],
  ['State machine', '状态机', 'States + transitions + guards', '状态 + 迁移 + 守卫条件', 'State machine showing an article moving from Draft through In Review and Published to Archived, including rejection and revision.', '状态机：一篇文章从草稿经评审中、已发布到归档，含驳回与退回修改。'],
  ['ER / data model', 'ER / 数据模型', 'Entities + fields + relationships', '实体 + 字段 + 关系', 'Entity-relationship diagram showing authors writing articles and articles connecting to tags and categories.', '实体关系图：作者撰写文章，文章关联标签与分类。'],
  ['Timeline', '时间线', 'Events positioned in time', '按时间定位的事件', 'Timeline showing product milestones from the first post in February 2025 through three design versions and the schematic skill in April 2026.', '时间线：从 2025 年 2 月第一篇文章到三个设计版本，再到 2026 年 4 月的图表技能。'],
  ['Swimlane', '泳道图', 'Cross-functional process with handoffs', '带交接的跨职能流程', 'Swimlane diagram showing an article moving from MDX draft through review, editing, approval, build, and Cloudflare Pages deployment.', '泳道图：一篇文章从 MDX 草稿经评审、编辑、批准、构建到 Cloudflare Pages 部署。'],
  ['Quadrant', '四象限图', 'Two-axis positioning / prioritization', '双轴定位 / 优先级排序', 'Impact-effort matrix showing eight content projects across do first, major projects, quick wins, and avoid quadrants.', '影响-工作量矩阵：八个内容项目分布于立即做、重大工程、速赢与不做四个象限。'],
  ['Radar / spider', '雷达图 / 蛛网图', 'Multiple entities scored across 3 to 5 quantitative criteria', '多个实体在 3–5 项量化指标上的打分', 'Radar chart comparing MinIO, Amazon S3, Ceph, and Google Cloud Storage across five storage capabilities.', '雷达图：MinIO、Amazon S3、Ceph 与 Google Cloud Storage 在五项存储能力上的对比。'],
  ['Polar chart', '极坐标图', 'One quantitative series across cyclic categories; angle=category, radius=magnitude', '一个量化序列跨循环类别；角度=类别，半径=数值', 'Polar chart of request demand across eight UTC windows on a 0 to 100 percent scale, with 12:00 to 15:00 UTC as the peak.', '极坐标图：八个 UTC 时段的需求，0–100 百分比刻度，12:00–15:00 UTC 为峰值。'],
  ['Loop / flywheel', '循环 / 飞轮', 'Reinforcing cycle; the last step feeds the first and a hub accumulates state', '自增强循环；末步滋养首步，中心枢纽累积状态', 'Six stations flow clockwise from Capture through Learn and back to Capture. Each station writes shared state into one central memory hub, with Decide highlighted as the human approval gate.', '六个站点从捕获顺时针经学习回到捕获。每个站点把共享状态写入中央记忆枢纽，「决策」是唯一高亮的人工审批关口。'],
  ['Nested', '嵌套图', 'Hierarchy through containment / scope', '以包含 / 作用域表达的层级', 'Nested diagram showing how project guidance inherits broader scopes from the global, vault, business, and marketing levels.', '嵌套图：项目级指引如何继承全局、仓库、业务与市场层的更广作用域。'],
  ['Tree', '树形图', 'Parent → children relationships', '父 → 子关系', 'Tree diagram showing a Skills root branching into Design, Engineering, and Research categories and their leaf skills.', '树形图：技能根节点分出设计、工程与研究三类及其叶技能。'],
  ['Org chart', '组织架构图', 'Human/agent/team ownership, reporting, routing, escalation', '人 / 智能体 / 团队的归属、汇报、路由与升级', 'Org chart showing a command center routing work to specialist agents and escalation owners.', '组织架构图：指挥中心把工作路由给专家智能体与升级负责人。'],
  ['Layer stack', '层叠图', 'Stacked abstraction levels', '层层堆叠的抽象级别', 'Layer stack showing model weights, SDK, prompts, agent harness, and UI surface, with the agent harness highlighted as the focal layer.', '层叠图：模型权重、SDK、提示词、智能体框架与 UI 表层，智能体框架为焦点层。'],
  ['Exploded axonometric', '分解轴测图', 'Parts of one object pulled apart along one axis: a teardown, an unboxing, assembly order', '把一个物体的各部分沿一根轴拉开：拆解、开箱、装配顺序', 'Exploded view of a three-layer app stack: data at the base, logic in the middle, interface on top, with logic as the focal layer.', '三层应用栈的分解视图：数据在底、逻辑居中、界面在顶，逻辑为焦点层。'],
  ['Axonometric plan', '轴测平面图', 'One floor or site seen from above at an angle: rooms with furniture, buildings by phase', '从斜上方俯瞰的一层楼或一个园区：带家具的房间、按阶段标注的楼宇', 'Axonometric floor plan of an office level with an open office, meeting room, kitchen, lobby, and phone booth, with the meeting room as the focal room.', '一层办公室的轴测平面图：开放办公区、会议室、厨房、前台与电话亭，会议室为焦点房间。'],
  ['Venn', '维恩图', 'Overlap between sets', '集合之间的重叠', 'Venn diagram showing desirable, feasible, and viable product qualities intersecting at shippable.', '维恩图：合意、可行与可持续三种产品特质交汇于「可发布」。'],
  ['Pyramid / funnel', '金字塔 / 漏斗', 'Ranked hierarchy or conversion drop-off', '排名层级或转化流失', 'Content pyramid showing short posts, essays, long-form guides, and a flagship book ordered by shipping cadence and leverage.', '内容金字塔：短帖、随笔、长篇指南与旗舰书，按发布节奏与杠杆率排序。'],
  ['Bar chart', '条形图', 'Quantitative comparison across categories', '跨类别的量化对比', 'Bar chart showing story points delivered across sprints S1 through S8, with Sprint 5 as the record high.', '条形图：S1–S8 各冲刺交付的故事点，S5 为历史峰值。'],
  ['Waterfall', '瀑布图', 'A start total bridged to an end total by signed contributions (budget bridge, headcount deltas)', '由带符号的贡献值把期初总额桥接到期末总额（预算桥、人数增减）', 'Waterfall chart bridging a 240 thousand dollar monthly cloud budget to a 236 thousand dollar plan through headcount growth, reserved-instance savings, new ML workloads, and storage tiering, the largest saving.', '瀑布图：24 万美元月度云预算如何桥接到 23.6 万美元方案——人数增长、预留实例节省、新增 ML 负载与存储分层（最大单项节省）。'],
  ['Treemap', '矩形树图', 'Part-of-whole where the relative sizes are the story', '部分与整体的关系，相对大小本身就是叙事', 'Treemap of world population by continent in mid-2023, where cell area is population; Asia holds about 59 percent of the world total and Oceania, at under one percent, is too small to label.', '2023 年中各大洲人口的矩形树图，格面积即人口；亚洲约占全球 59%，大洋洲不足 1% 小到无法标注。'],
  ['Heatmap', '热力图', 'Cross-tabulated data; fill encodes value per cell', '交叉表数据；以填充深浅编码每格数值', 'Heatmap of CI failure rate by service and sprint. The payments service spikes to 47 percent in sprint 4 after a deploy regression and recovers to 4 percent by sprint 6.', '按服务与冲刺统计的 CI 失败率热力图。支付服务在冲刺 4 因一次部署回归飙到 47%，到冲刺 6 恢复到 4%。'],
  ['Line chart', '折线图', 'Continuous trends over time, change between exactly two states (slopegraph), one distribution per series (ridgeline), or rank movement across several snapshots (bump)', '时间上的连续趋势、恰两个状态之间的变化（斜率图）、每序列一个分布（山脊图）或多个快照间的排名流动（凹凸图）', 'Line chart showing weekly signups from organic, direct, and referral channels across weeks W1 through W8.', '折线图：W1–W8 各周来自自然、直接与引荐渠道的注册量。'],
  ['Gantt', '甘特图', 'Tasks and phases on a timeline', '时间线上的任务与阶段', 'Gantt chart showing a twelve-week product launch from market research and interviews through design review, development, beta testing, and launch.', '甘特图：十二周的产品发布，从市场调研与访谈经设计评审、开发、beta 测试到上线。'],
  ['Scatter plot', '散点图', 'Correlation or distribution of two variables; bubble (three variables) and beeswarm (one variable, dot per item) variants', '两个变量的相关性或分布；气泡图（三变量）与蜂群图（单变量、每项一点）变体', 'Scatter plot showing twelve engineering teams by deploy frequency and lead time, with Platform in the best-performing quadrant.', '散点图：十二个工程团队的部署频率与交付周期，平台团队位居最优象限。'],
  ['High-Level', '总览架构', 'End-to-end data stack on a container cluster', '容器集群上的端到端数据栈', 'Architecture diagram showing data sources moving through Apache NiFi and MinIO into Trino, data modeling, and Superset dashboards, with Airflow orchestration.', '架构图：数据源经 Apache NiFi 与 MinIO 进入 Trino、数据建模与 Superset 看板，由 Airflow 编排。'],
  ['Process', '过程图', 'Multi-actor sequential process with data handoffs', '多角色顺序流程，带数据交接', 'Process diagram showing an order moving through customer, support, warehouse, and finance ownership from placement to close.', '过程图：一张订单从下单到关闭，先后由客户、客服、仓储与财务经手。'],
  ['Medallion', 'Medallion 分层', 'Multi-tier data storage with quality levels and access policies', '多层数据存储，带质量等级与访问策略', 'Clickstream events and order records move from raw storage through anonymized, staging, and aggregated tiers before lifecycle archiving.', '点击流事件与订单记录从原始层经匿名层、暂存层与聚合层，最后按生命周期归档。'],
  ['Data flow', '数据流图', 'Role-scoped data flow: who does what at each pipeline step', '按角色划分的数据流：流水线每一步谁做什么', 'A Data Engineer ingests and stores commerce data, a Data Scientist transforms and analyzes it, and an Analyst publishes a dashboard.', '数据工程师采集并存储电商数据，数据科学家转换并分析，分析师发布看板。'],
  ['DP integration', '数据平台集成', 'Integration topology of a data platform: sources → core → consumers', '数据平台的集成拓扑：来源 → 核心 → 消费方', 'Integration topology showing CRM, POS exports, and an event stream landing in object storage for query, notebooks, dashboards, and a partner API.', '集成拓扑：CRM、POS 导出与事件流落入对象存储，供查询、笔记本、看板与合作方 API 使用。'],
  ['DP security matrix', '数据平台安全矩阵', 'Per-role / per-component access permissions matrix', '按角色 / 按组件的访问权限矩阵', 'A five by five permission matrix for platform roles and components.', '平台角色与组件的五乘五权限矩阵。'],
  ['Sankey', '桑基图', 'A quantity splitting and merging across stages, band width = amount', '一个量在各阶段间分流与合流，带宽 = 数量', 'Sankey diagram showing 12,000 monthly CI minutes splitting into unit test, E2E, build, and lint stages, then merging into passed, failed, and flaked outcomes, with the flaky-rerun path highlighted as the one accent flow.', '桑基图：每月 12,000 分钟 CI 分入单测、E2E、构建与 lint，再汇入通过、失败与偶发失败，不稳定重跑路径是唯一高亮流量。'],
  ['Fishbone', '鱼骨图', 'Causes of one observed effect, grouped by category (root-cause analysis)', '按类别分组追溯一个结果的原因（根因分析）', 'Fishbone diagram tracing a checkout latency incident to five candidate cause categories, with a missing database index under Data confirmed as the root cause.', '鱼骨图：把一次结账延迟事故追到五类候选原因，数据类下缺失的数据库索引被确认为根因。'],
  ['Wardley map', 'Wardley 地图', 'Value chain against evolution: what to build, buy, and what is moving', '价值链对照演化阶段：什么自建、什么采购、什么正在变化', 'Wardley map plotting an AI assistant product\'s value chain from the user-facing need down to raw infrastructure against genesis-to-commodity evolution, with agent orchestration commoditising toward the product band.', 'Wardley 地图：AI 助手产品的价值链从用户侧需求到原始基础设施，对照从初创到通用化的演化轴，智能体编排正滑向产品带。'],
  ['Kanban', '看板', 'Work-in-progress by state, with WIP limits and blocked items', '按状态呈现的在制品，带 WIP 限制与受阻项', 'Kanban board showing a platform team\'s work-in-progress across backlog, in-progress, review, and done columns, with the in-progress column over its WIP limit and one blocked card awaiting a vendor maintenance window.', '看板：平台团队在待办、进行中、评审与完成列的在制品，进行中已超 WIP 限制，一张受阻卡等待厂商维护窗口。'],
  ['User journey', '用户旅程图', 'What a person does across stages of an experience, and how it feels', '一个人在体验各阶段做什么、感受如何', 'User journey map of a new trial user across five stages, showing actions, touchpoints, and a sentiment curve that dips at the usage-limit stage before recovering at upgrade.', '新试用用户的五阶段旅程图：行动、触点与情绪曲线，在用量限制处触底，升级后回升。'],
  ['Deployment', '部署图', 'Where software runs: zones, hosts, artifacts, replicas, ports', '软件运行在哪：区域、主机、制品、副本、端口', 'Deployment diagram placing the checkout service across an edge CDN zone, a production Kubernetes zone running ingress and API pods, and a data zone with a primary Postgres instance replicating to a standby.', '部署图：结账服务横跨边缘 CDN 区、运行入口与 API Pod 的生产 Kubernetes 区，以及主 Postgres 向备库复制的数据区。'],
  ['Dependency graph', '依赖图', 'What depends on what, with fan-in and cycles a tree cannot express', '谁依赖谁，含树形图无法表达的扇入与环', 'Ranked dependency graph of a TypeScript monorepo showing shared-types as the highest fan-in package with four dependents, and one back-edge cycle from utils into shared-types.', 'TypeScript monorepo 的分层依赖图：shared-types 是扇入最高的包（四个依赖方），utils 到 shared-types 有一条反向边成环。'],
  ['UML class', 'UML 类图', 'Classes with operations, inheritance, composition (other UML routes elsewhere)', '类及其操作、继承、组合（其他 UML 路线另见）', 'Class diagram showing Card and BankTransfer realizing a PaymentMethod interface, PaymentService depending on PaymentMethod, and Order composed of OrderLine while associated with Customer.', '类图：Card 与 BankTransfer 实现 PaymentMethod 接口，PaymentService 依赖 PaymentMethod，Order 组合 OrderLine 并关联 Customer。'],
  ['Story map', '用户故事地图', 'Narrative backbone sliced into releases, with the cut line', '叙事主干按版本切片，带切割线', 'User story map for a reporting tool\'s first release: four narrative activities from finding data to trusting it, walking-skeleton steps beneath each, and three release slices sliced by an MVP release-cut line, with the row-level-permissions story flagged as the riskiest bet in Release 2.', '报表工具首版的用户故事地图：从找到数据到信任数据的四项叙事活动、其下的行走骨架步骤、按 MVP 切线分出的三个版本切片，行级权限故事被标为版本 2 风险最高的赌注。'],
  ['Database schema', '数据库结构', 'Physical tables: SQL types, constraints, indexes, column-level FKs', '物理表：SQL 类型、约束、索引、列级外键', 'Physical database schema diagram showing five commerce tables with column-level foreign keys, SQL types, and constraint chips, including a cascading delete from orders into order_items and a billing schema group.', '物理数据库结构图：五张电商表带列级外键、SQL 类型与约束标签，orders 到 order_items 有级联删除，另有 billing 结构分组。'],
  ['Service blueprint', '服务蓝图', 'What the customer does vs what the service hides, across stages', '各阶段中顾客做什么 vs 服务隐藏了什么', 'Service blueprint of a trial-to-paid path across five stages, with customer and frontstage actions above a line of visibility and a focal backstage dunning-job timeout under Hit the limit.', '试用转付费路径的五阶段服务蓝图：可见线上方是顾客与前台动作，焦点是「触达限额」下的后台催缴任务超时。'],
  ['SBGN', 'SBGN 图', 'A biological process as a bipartite species/process graph', '以物种 / 过程二部图表达的生物过程', 'Seven carotenoid species in cytosol cleaved by six processes; beta-carotene yields B-10-apo and B-ionone, with cryptoxanthin and zeaxanthin feeding the same products.', '胞质中的七种类胡萝卜素物种经六个过程裂解；β-胡萝卜素生成 B-10-apo 与 B-紫罗兰酮，隐黄素与玉米黄素汇入相同产物。'],
  ['Requirement traceability', '需求追溯图', 'Source requirements, design elements, and tests linked by stable IDs', '源需求、设计元素与测试以稳定 ID 相连', 'Three illustrative requirements trace from source notes to design elements and verification checks. The last requirement has no linked verification and is visibly marked as open.', '三条示例需求从来源笔记追溯到设计元素与验证检查。最后一条没有关联验证，被醒目标为未闭环。'],
  ['Event modeling', '事件建模图', 'Commands, resulting events, and read models across ordered stages', '有序各阶段的命令、产生的事件与读模型', 'Three time-ordered stages. Each has a command, a resulting past-tense event, and a read model projected from that event.', '三个按时序排列的阶段，每个都有命令、产生的过去式事件与从事件投影出的读模型。'],
  ['Steps', '步骤图', 'A short ordered method with numbered stages, icons, and brief explanations', '简短的有序方法，带编号阶段、图标与简短说明', 'Five equal stages move from framing and research through a focal synthesis step, then decision and release.', '五个等宽阶段从框定与研究经过焦点综合步骤，走向决策与发布。'],
  ['Unit Grid', '单元网格', 'One bounded whole counted in equal discrete units out of 100', '一个有边界的整体按 100 份等距离散单元计数', 'A ten by ten unit grid showing 64 completed release checks and 36 remaining checks. Each square represents one check.', '十乘十的单元网格：64 项已完成的发布检查与 36 项待办，每格代表一项检查。'],
];
for (const [en, zh, dEn, dZh, aEn, aZh] of CARDS) {
  INDEX.push(
    [`<span class="t">${en}</span>`, `<span class="t">${zh}</span>`],
    [`aria-label="View the ${en} diagram full size"`, `aria-label="查看${zh}全尺寸"`],
    [`alt="${aEn}"`, `alt="${aZh}"`],
    [`<span class="d">${dEn}</span>`, `<span class="d">${dZh}</span>`],
  );
}

// ---------- 替换器 ----------
const misses = [];
let totalHits = 0;
function apply(html, pairs, file) {
  const sorted = [...pairs].sort((a, b) => b[0].length - a[0].length);
  for (const [from, to] of sorted) {
    const n = html.split(from).length - 1;
    if (n === 0) { misses.push(`${file} :: ${from.slice(0, 80)}`); continue; }
    html = html.split(from).join(to);
    totalHits += n;
  }
  return html;
}

// ---------- 产物组装：upstream 全量拷贝 → HTML 翻译 ----------
rmSync(SITE, { recursive: true, force: true });
cpSync(UP, SITE, { recursive: true });

let html = readFileSync(join(UP, 'index.html'), 'utf8');
html = apply(html, INDEX, 'index');
writeFileSync(join(SITE, 'index.html'), html);

for (const [f, pairs] of Object.entries(FILE_MAP)) {
  let ex = readFileSync(join(UP, 'examples', f), 'utf8');
  ex = apply(ex, pairs, f);
  writeFileSync(join(SITE, 'examples', f), ex);
}

console.log(`done: ${totalHits} replacements`);
if (misses.length) {
  console.log(`\n${misses.length} MISS (need review):`);
  for (const m of misses) console.log('  ' + m);
  process.exitCode = 1;
} else {
  console.log('all pairs hit, no misses');
}
