---
version: 1
slug: "index-html"
primary_target: "index.html"
related_targets: []
---

# Surface Brief — 入口页 index.html

## Scope & Mode

仓库根入口页（gen-index.cjs 生成产物，源为 scripts/index/ 三件套）。Mode: **Read**。访客：中文开发者，任务=几秒定位某开源项目的中文文档 / 按标签发现。硬约束：零外部请求、单文件自包含、localStorage 偏好。

## Audience & Job

中文开发者（含维护者）；带着项目名从上游 repo/README 外链进入，或按主题浏览。成功=几秒定位或发现。

## Direction Contract

THESIS: 品类标准的文档入口做到 MDN 级工艺——搜索与筛选是为「几秒定位」服务的器官，而非装饰；拒绝默认聚合页的「主行动不可见 + 状态蒸发」。
OWN-WORLD: MDN 2023 设计语言为基（纯白底、近黑 #1b1b1b、链接蓝 #0069c2、居中全宽大搜索、矩形过滤组、hairline 开放行），叠加 `data-skin` 三皮肤层：mdn（默认）/ github（Primer：灰底白卡、Counter、蓝 tint 胶囊）/ vercel（Geist 语法：#fafafa、细边框卡、⌘K 钮、下划线 chips）；三皮肤系统栈渲染（零外部请求，不复刻 Inter/Geist 网络字体）。
STORY: 访客明白「这里是维护中的非官方中文文档集合」，相信快照可追溯（结构化元数据行：页数·工具链·快照日），行动=整卡点击或「阅读中文文档 →」。
FIRST VIEWPORT: 顶部可分享 URL 示意条（装饰 chrome）→ wordmark 行（docs-cn + 收录 21 站 + 非官方注记）→ MDN 皮肤下为全宽大搜索（`/` 聚焦）→ 矩形过滤组（主题/类型，选中黑底白字）→ 已选摘要条（pill+清除+命中 N/21）→ 开放行列表（站名 17px 700 + 描述 + 等宽元数据行 + 行尾蓝标签；hover 浅灰底+主行动浮现）。主行动在首屏第 2-3 行即可见（钉 hover 态的演示行由真实 hover 承担）。
FORM: canon（用户裁定 standing exit），seed:5524853701be40a4；主对标 MDN，辅对标 GitHub/Vercel（三皮肤）。
FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance.

## Memorable Moment

`/` 聚焦搜索与筛选状态入 URL（popstate 即撤销）——「找到」与「分享找到的结果」都一步。
实现裁定（finish review 2026-10-26）：逐键 pushState 是反模式，落为 replaceState——「popstate 即撤销」的价值承诺以「刷新/分享不丢 + URL 即唯一事实源」兑现，不回滚。

## Constraints

- gen-index.cjs 数据装配：sites.json 新增可选 `meta`（pages/stack/snap）字段驱动元数据行；无 meta 的条目隐藏该行（不得虚构）。
- 原 6 色主题系统由皮肤系统取代（ skins 各自携带主色）；localStorage key 仍为 docs-cn-prefs，新增 skin 字段，旧 theme 字段忽略。
- 移动端（≤560px）：chips 横向单行滚动、触控目标 ≥44px、吸顶迷你摘要条、返回顶部钮。
- 空态必须可恢复：清除搜索/清除全部筛选按钮 + 当前条件回显；高亮搜索模式显示「N 处命中」。
- Detector `.tag` 贴边问题在皮肤重样式中一并消除（标签胶囊垂直内边距 ≥0.2rem）。

## Unresolved

- CN|EN 成对卡是否合并为卡内切换——本轮不做，留待站点规模触发。
