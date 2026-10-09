# 站点级双语标签体系：sites.json 打标 + 入口页筛选

- 日期：2026-10-09
- 状态：已批准
- 背景：仓库收录 16 个文档站条目（14 个中文站 + 2 张英文镜像卡；另有 ai-memory-en 无独立卡片，仅经中文卡「英文文档」按钮可达）。入口页 index.html 是一张平铺清单，无法按主题找站。需求：给每个站点打 2-4 个标签（英文 slug 登记、中文标签展示），一个站点可有多标签，入口页可筛选。

## 目标

1. `sites.json` 每个中文站条目加 `tags` 数组（英文 slug），共 13 个注册标签、中英双语对照。
2. 入口页 `index.html` 顶部一排筛选 chips：「全部」默认 + 13 个中文标签；多选、并集语义（卡片命中任一所选标签即显示）。
3. 卡片描述下方显示该站中文标签 chips。
4. 英文镜像卡自动继承中文站标签，并附加「非官方英文文档」。
5. 数据源只有 `sites.json`，改完跑 `node scripts/gen-index.cjs` 刷新，无其他构建步骤。

## 标签注册表（13 个）

领域（10 个）：

| slug | 中文 | 含义 |
|---|---|---|
| `ai-agent` | 智能体 | 以 AI 编码智能体为核心的项目 |
| `multi-agent` | 多智能体协作 | 编排/协作多个智能体 |
| `skills` | 技能与提示词 | 技能集、角色/提示词定义 |
| `memory` | 记忆系统 | 智能体长期记忆 |
| `testing` | 测试 | 智能体测试 |
| `deployment` | 部署运维 | 部署平台/自托管 |
| `docs-engineering` | 文档工程 | 文档框架与工具 |
| `ai-app-dev` | AI 应用开发 | 构建 AI 应用的框架 |
| `code-intelligence` | 代码智能 | 代码理解/知识图谱 |
| `learning` | 概念与入门 | 词典、概念讲解 |

形态（2 个）+ 来源（1 个）：

| slug | 中文 | 含义 |
|---|---|---|
| `cli-tool` | 命令行工具 | CLI/TUI 形态 |
| `sdk-api` | SDK 与 API | 编程接口/集成参考 |
| `unofficial-en` | 非官方英文文档 | 上游没有官方文档站（只有仓库 markdown），本站是脚本生成的非官方英文镜像 |

> `unofficial-en` 与其余 12 个维度不同：它描述来源而非主题，由脚本按规则自动附加（见「机制」），sites.json 里不手写。

## 每站分配

14 个中文站：

| 站点 | tags |
|---|---|
| Pi | `ai-agent`, `cli-tool`, `sdk-api` |
| AI SDK | `ai-app-dev`, `sdk-api` |
| OpenShip | `deployment`, `sdk-api` |
| Agency Agents | `ai-agent`, `multi-agent`, `skills` |
| OpenRig | `ai-agent`, `multi-agent` |
| Orca | `ai-agent`, `multi-agent` |
| e2e | `testing`, `ai-agent` |
| Claude-Mem | `memory`, `ai-agent` |
| ai-memory | `memory`, `cli-tool` |
| Agent Skills | `skills`, `ai-agent` |
| Matt Pocock Skills | `skills`, `learning` |
| AI 编码词典 | `learning` |
| Nimbus | `docs-engineering` |
| codegraph | `code-intelligence`, `cli-tool` |

英文镜像卡（不写 tags，由脚本生成）：

| 卡片 | 有效标签 |
|---|---|
| Agency Agents (EN) | 智能体 · 多智能体协作 · 技能与提示词 · 非官方英文文档 |
| OpenRig (EN) | 智能体 · 多智能体协作 · 非官方英文文档 |

## 机制

- **注册表内置于 `scripts/gen-index.cjs`**：`TAGS` 常量（slug → `{ en, zh }`）。单一消费方，不另立 tags.json。
- **fail-fast 校验**：`sites.json` 的 `tags` 中出现未注册 slug → 列出全部非法值并抛错退出（防拼写错，与 `new-en-mirror.cjs` 同风格）。
- **英文镜像继承**：对 `lang: "en"` 条目，经 `en` 字段反查中文站条目，复制其 `tags` 并追加 `unofficial-en`；反查不到对应中文站 → 抛错。自动附加的依据是仓库既有规则——英文镜像站只在「上游无站点、只有 markdown」时创建（README「新增一个英文镜像站」节），定义上必然非官方，未来新增镜像站不会漏打。
- **筛选**：生成的 `index.html` 内联一小段原生 JS（页面保持零依赖纯静态）：无选中 = 全部显示；选中若干 = 并集；无 `tags` 的条目仅在「全部」状态显示（当前 16 条都有标签，此为兜底）。
- **chips 样式**：与现有 `.btn` 同源（细边框、圆角、小号）；筛选条位于副标题与列表之间，激活态填充；被筛掉的卡片 `display: none`。

## 错误处理

- 未注册 slug / EN 条目反查失败 → 抛错退出，不静默降级。
- 条目无 `tags` 字段 → 合法，渲染无 chips，仅「全部」下显示。

## README

加「站点标签」小节：13 个标签双语对照表 + 一句说明（数据源在 `sites.json` 的 `tags` 字段；改后跑 `node scripts/gen-index.cjs` 刷新入口页）。收录项目表不加标签列，避免与 sites.json 双处维护。

## 验证

1. `node scripts/gen-index.cjs` 成功，输出 16 site(s)；`index.html` 含 13 个筛选 chips 与卡片标签。
2. 浏览器实测：单选、多选并集、取消回「全部」；EN 卡显示继承标签 + 非官方英文文档；只勾「非官方英文文档」→ 恰好 2 张卡。
3. 故意在 sites.json 写一个未注册 slug → 脚本报错且列出该 slug，改回后恢复。
4. `git diff index.html` 确认除筛选与标签外无意外改动。

## 范围外

- 单页级 frontmatter 标签（先验证站点级价值，再议按站推广）。
- ai-memory-en 补独立卡片（维持既有行为；日后若补 `lang: "en"` 条目将自动获得标签）。
- 筛选增强：AND 模式切换、标签计数徽标、按标签排序。
- 各子站内部（Starlight/Mintlify）的导航或侧边栏改动。

## 修订一（2026-10-09 同日，筛选行为）

- 筛选语义由并集改为**交集**：卡片须命中全部选中标签。
- **不可用置灰**：未选中标签在当前命中卡片中一个都找不到时置灰禁用（`disabled` + 半透明），交集因此永不为空，无需空态 UI。
- **动画**：列表接入 formkit/auto-animate——vendor `scripts/vendor/auto-animate.min.js`（@formkit/auto-animate@0.10.0，包仅发 ESM 构建，gen-index 构建时剥末尾 `export` 转 `globalThis.autoAnimate` 后内联进页面，保持单文件零外部请求）。筛选时先移出未命中卡片再按原序补回命中卡片，动画由库的 MutationObserver 驱动。

## 修订二（2026-10-09 同日，设置弹窗）

右上角「⚙ 设置」打开 `<dialog>` 弹窗，偏好存 localStorage（key `docs-cn-prefs`），`<head>` 内联脚本预读并落到 `data-*` 属性防主题闪烁，刷新后仍生效：

- **主题色**：`THEMES` 注册表 6 色（蓝[默认]/绿/紫/橙/红/青，GitHub 系深色保证白字对比度），swatch 小方块与 `[data-theme]` CSS 覆盖块同源生成，驱动 `--accent` 变量。
- **卡片风格**：`CARD_STYLES` 三种——标准（列表）/紧凑（小间距小字号）/网格（auto-fill 两列，按钮改静态布局），经 `data-card-style` 分支 CSS。
- **卡片显隐**：描述/标签/操作按钮三个开关，经 `data-show-*` 分支 CSS。
- 实现坑：白名单校验数组必须用 `indexOf`，不能对象式下标取值（`THEME_IDS["green"]` 恒 undefined，会把合法主题误回落默认）。
