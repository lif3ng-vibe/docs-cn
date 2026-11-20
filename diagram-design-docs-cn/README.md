# diagram-design-docs-cn — Diagram Design 官网中文镜像

[diagramdesign.dev](https://diagramdesign.dev)（cathrynlavery/diagram-design，MIT）的非官方中文镜像：一个智能体技能，把大白话变成杂志级品质的图表——50 种图表类型，自包含 HTML + SVG，约 60 秒匹配你的网站品牌。

- **源**：https://diagramdesign.dev（纯手写静态站，无框架无构建；官网源码闭源，公开仓库只有技能本体）。快照 2026-11-20
- **形态**：HTML 产物镜像汉化（同 herdr 先例）。`site/` 即整站部署产物；资源引用全为相对路径（`assets/`、`examples/`），子路径挂载零改写
- **范围**：首页 1 页全量汉化（含 hero 双模式 SVG 的 24 个 text 节点、50 张画廊卡片标题/描述/alt、安装卡、终端会话演示）；8 个示例页全量汉化（标题、SVG 部件标签、焦点注解、动画控件、noscript 文案、键盘快捷键提示）
- **画廊（/gallery/）**：官方 gallery（cathrynlavery.github.io/diagram-design，源码公开）236 页并入镜像——index 导航层全量汉化（89 个类型按钮英中双语「Policy trace · animated 策略追踪 · 动画」、搜索/变体/UI 文案），icons.html 汉化；官网「浏览线上画廊」外链已改内链 gallery/
- **样张双版本（用户决策 2.0）**：英文原版 example-*.html 零改动 + 中文变体 example-*-zh.html（SVG text 按词典译，235 张 3931 节点；技术名词/产品名/字段名/UML 签名保留英文）；画廊顶部「Diagram Design · 画廊」右侧 EN/中文 切换，**默认中文**，localStorage 记忆，切换保持图表类型与风格不变（iframe 只换 -zh 后缀）；词典 = tools/gallery-zh-core.json（定译，含 117 条过滤器误杀的短词补录）+ 子代理批次合并 → tools/gallery-zh-dict.json（1118 条，zh-merge.mjs 校验 key 逐字节一致）；6703 节点中 3931 译、其余为技术元素
- **图内英文照用**：`assets/gallery/*.png` 截图内的英文不重绘（预授权决策）；`og:image`/`og:url` 等绝对 meta 保留官方原样（快照声明）
- **数字口径**：以快照为准——首页 meta/hero 为 50 types，demo 视频 aria 为 44，互不改写（上游 README 又是 45，官网迭代快）
- **字体**：只追加 CJK fallback（PingFang SC / Microsoft YaHei / Songti SC），原字体声明不动
- **术语**：见 [GLOSSARY.md](GLOSSARY.md)（editorial→杂志级、50 种图表类型名对照、流程图 vs 过程图区分等）

## 本地运行

```bash
node tools/serve.cjs site 4177
# 模拟生产子路径，访问 http://127.0.0.1:4177/docs-cn/diagram-design/
```

无构建步骤。`tools/` 是管线辅助（download.mjs 抓站、translate.mjs 翻译、residue-check-html.cjs 残留扫描、screenshot.mjs 视觉冒烟），不随站点部署；screenshot.mjs 依赖兄弟项目 `ollama-docs-cn` 的 playwright。

## 管线（复现）

```bash
node tools/download.mjs           # 1. 抓站 → upstream/（英文底稿，已 gitignore）
node tools/translate.mjs          # 2. upstream → site：637 处替换，零 miss 才落盘（只重建官网部分，保留 site/gallery/）
node tools/gallery-download.mjs   # 3. 抓官方画廊 → upstream-gallery/（236 页）
node tools/translate-gallery.mjs  # 4. 画廊导航层双语 → site/gallery/（样张原版零改动）
node tools/residue-check-html.cjs # 5. 英文残留扫描（剥 script/style/pre/code/path），应 CLEAN
node tools/serve.cjs site 4177    # 6. 子路径冒烟
node tools/screenshot.mjs         # 7. 双模式截图目检（home + 示例页；画廊目检手动截）
```

translate.mjs 内嵌完整映射表（按文件分组，长串优先替换，0 命中即报 miss 退出非零），原文撇号是直撇 `'`、引号是弯引号 `“ ”`——改映射时注意。

## 部署

并入 [docs-cn](https://github.com/lif3ng-vibe/docs-cn) hub，部署于 `https://lif3ng-vibe.github.io/docs-cn/diagram-design/`（画廊在 `/gallery/` 子路径；CI 直接 `cp -r site _site/diagram-design`，零构建，同 herdr/ollama 先例）。compare 侧零改动：锚点表空表语义不变，githubDir 递归枚举未来重生成时 gallery 页会以 origin 404 警告出现、无害。
