# GLOSSARY — hallmark-docs-cn 术语表与翻译规范

源站：https://www.usehallmark.com/（Nutlope/hallmark@6033bab，2026-10-28 快照，MIT）
纯静态站：无构建。原班工具链 = 原样 HTML/CSS/JS，只改文案。

## 一、术语表（全站统一）

### 不译名单
- 产品名：**Hallmark**、sloplint、skills（npx skills add 命令）
- 主题名（50 个）：Almanac、Arcade、Atelier、Bloom、Blueprint、Broadside、Brutal、Carnival、Cobalt、Console、Coral、Darkroom、Dose、Dusk、Editorial、Formwork、Furrow、Garden、Grid、Halftone、Hedgerow、Hum、Ink、Kiln、Loom、Lumen、Manifesto、Midnight、Newsprint、Overprint、Paste-up、Piste、Refract、Ribbon、Rim、Riso、Solstice、Specimen、Spore、Sport、Squeeze、Sticker、Studio、Terminal、Terrazzo、Ultraviolet、Vantage、Vellum、Wayfind、Werkstatt
- 虚构品牌名：Closewise、Fieldbook、Relay、Wheel House、Ashfield Stoneware、Reelcut、The Low Room、Maison Orla、Ward Hollis、Long Lane Walks、Ours、whenshot、Inlet、Field Office、Rowan、Loop、Ines Calvo、Tandem、Sprout、Lull、ramen 等（正文可括注业务，名字不动）
- Agent/Harness 名：Claude Code、Codex、Cursor、OpenCode、GitHub Copilot
- 命令、路径、环境变量、代码：`npx skills add nutlope/hallmark -g`、`/hallmark redesign <path>`、`~/.claude/skills/hallmark`、`design.md` 等原样
- skill 一词保留英文（agent skill 语境）

### 译法表
| 英文 | 中文 |
|---|---|
| AI slop | AI 味（标题可用「终结 AI 味」） |
| design skill | 设计 skill |
| theme | 主题 |
| material | 材质（a theme is a material → 主题是一种材质） |
| build（一次生成） | 一次构建 / 搭建 |
| prompt | 提示词 |
| deal / Deal again | 发牌 / 再发一次 |
| hand（一叠牌） | 一手牌 |
| tell（AI 破绽） | 破绽 |
| the Floor | 底线（不可违反） |
| Reflex gates | 惯性关卡（模型默认落进去的坑） |
| Finish checks | 收尾检查 |
| gate | 关卡 |
| linter / lint | linter / lint（不译） |
| fresh-context reviewer / fresh eyes | 新会话评审 / 全新视角 |
| redesign | 重设计 |
| audit | 审计 |
| polish | 打磨 |
| restyle | 重定样式（保留布局） |
| custom | 定制 |
| harness | harness（不译） |
| Lands in | 安装位置 |
| openly licensed | 开放许可 |
| walk-through（产品演示预约） | 演示导览 |
| Made with Hallmark | 用 Hallmark 做的 |
| Skip to content | 跳到正文 |
| Copied | 已复制 |
| Work email | 工作邮箱 |
| Book a walkthrough | 预约演示导览 |

## 二、HTML 翻译规范（子代理必读）

**不动**：标签与属性名、class/id/data-* 的**键名**、CSS、JS 逻辑与注释、URL、`<code>` 内容、命令、照片署名链接文本（`Photographs:` 行的人名与许可号保留英文）。

**要译**：
- 可见文本节点、`<title>`、`meta description`
- `alt`、`aria-label`、`aria-valuetext`、`aria-roledescription`、`placeholder`、`data-tip`、`data-alt`、`data-mat`、`data-meta`、`data-name`（展示名——wheel 卡片 data-name 是虚构产品名**不译**，data-meta 中的业务描述**要译**）
- `<script type="application/json">` 数据块里的**显示文案**字段：`data-cmp-data` 的 `label`；`data-fan-pool` 的 `name` 是主题名**不译**
- HTML 注释不译；JS 文件只在字符串会显示给用户时译（textContent/aria 赋值、sr 文案），逻辑注释不译
- `lang="en"` → `lang="zh-CN"`

**排版**：中文全角标点（，。：；？！、）（「」不用，引号用 ""）；中英文/数字之间一个半角空格；金额/代码/数字保持半角。破折号——不带空格。

**headline 动画（仅主页 index.html）**：
- 终稿标题：`终结 AI 味的设计 skill。`
- `.hl__w` 分词 span（无空格文本节点）：`终结`（+`hl__the`）/`AI 味`/`的`/`设计`/`skill。`
- 内联脚本 `.hl__a` 的 textContent 改为 `消除`（校对动画：划掉「消除」写入「终结」）
- `js/headline.js`：`ghost('A', bA)` → `ghost('消除', bA)`；`ghost('The', fT)` → `ghost('终结', fT)`；`ink.textContent = 'The'` → `'终结'`

## 三、scene.js 文案页清单（仅这 3 个有用户可见字符串）
- themes/refract/scene.js：`Book ${c.value}`、`is held for ten minutes...`、`Booked: ...` 等 → 译（例：`预约 ${c.value}`）
- themes/vantage/scene.js：`North/South ... m` → `北/南`
- themes/coral/scene.js：tooltip 前缀拼接逻辑保持，标签词按页面译文一致
- 其余 scene.js 不动。

## 四、验收
- `node --check` 所有改过的 JS
- 内链目标存在（相对路径不变，不改任何 href/src 路径）
- 英文残留扫描（Node 脚本，HTML 感知）
- 本地 http.server 冒烟 + 浏览器过目
