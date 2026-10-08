# tester-army-e2e-docs-cn

[e2e](https://github.com/tester-army/e2e)（tester.army 出品的智能体端到端测试框架）官方文档站的**非官方中文镜像**。

- 源站：https://e2e.tester.army/docs （Mintlify）
- 上游快照：[tester-army/e2e](https://github.com/tester-army/e2e) `main` 分支，2026-10-07（docs/ 目录，52 篇 MDX）
- 许可：上游 Apache-2.0；本镜像仅做翻译，正文之外的结构/样式尽量保持上游原样
- 翻译为一次性快照，不做上游持续同步；要对照上游差异，用上面的快照信息手动 diff

## 本地运行

要求：Node ≥ 22.12.0（读自上游 docs 包 engines）。

```bash
npm install
npm run dev          # mint dev，本地预览（默认 http://localhost:3000）
npm run check        # mint validate + mint broken-links
npm run validate     # 仅构建校验
```

**运行须知**：`mint dev`（本地预览）与 `mint export`（静态导出）在 Mintlify 4.x 里依赖 mintlify 账户与云端构建——匿名跑 dev 会 ready 后全部页面 404，export 会被云端以 404 拒绝。**未登录时可用的是本仓库的两条校验链**：`npm run check`（Mintlify 官方 validate + broken-links）与 `node check-links.mjs`（全站内链/锚点核对，英文基线与本镜像均 CLEAN）。登录 Mintlify 账户后 dev/export 即恢复正常；把本仓库连接到 Mintlify 平台（免费社区计划）即可部署到 `*.mintlify.app`。

## 部署到 GitHub Pages（已验证的管线）

`mint export` 登录后可产出**纯静态站点**（目录形态 `页/​index.html`，全部 RSC payload 内嵌于 HTML，无服务端依赖）——已在本地以根路径与子路径两种形态、用真实浏览器（加载 + CSS + 侧边栏点击导航 + 页内锚点）实测通过：

```bash
npx mint export                                  # 产出 export.zip（含云端生成，需 mint login）
# 解包后改写为部署前缀（产物内部链接是根绝对路径，子路径部署必须先改写）：
mkdir -p dist-deploy && cd dist-deploy && unzip -q ../export.zip
cd .. && node postprocess-export.mjs dist-deploy /docs-cn/tester-army-e2e
# dist-deploy/ 即为可直接发布的站点根
```

要点：
- `postprocess-export.mjs` 只改 HTML（引用全在 HTML 属性与内嵌 RSC payload 里）；**不要改 JS chunk**——实测会在 chunk 里制造语法错误。JS 内少量 `/_next` 硬编码引用属于可选功能（如搜索 worker），子路径下 404 仅功能降级不致命。
- 改写规则曾踩三坑：`t='/'`/空串 target 会把 payload 的 `\"/>` 序列全部二次加工（双前缀）；payload 的 `\"` 转义形态必须与裸 `"` 形态分别处理；MSYS 会改写以 `/` 开头的命令行参数（用 `MSYS2_ENV_CONV_EXCL`）。
- export 产物里会混入仓库目录的杂项文件，脚本已剔除（.anchor-maps、*.mjs 等）。
- `export.zip` 不入库（.gitignore）；把 dist-deploy 推到 GitHub Pages 的 CI 需要一个可以非交互认证 mint CLI 的凭据，或本地 export 后走 API 推送通道（见仓库 scripts/push-via-api.cjs）。

## 与上游的差异

1. **全部 52 篇 MDX + frontmatter 中文化**；sidebar 导航（docs.json）、落地页、组件可见文案（Card/Tab/Badge 等）同步翻译。frontmatter 字符串值统一加引号——Mintlify 的 frontmatter 解析器对中文裸标量会报语法错误。
2. **标题锚点随中文标题变化**：页内/跨页链接锚点已按 Mintlify slug 规则重算（该规则已对原站 52 页 HTML 逐标题反推核实：lowercase、ASCII 非字母数字段转连字符、非 ASCII 保留）。锚点映射底稿存于 `.anchor-maps/`（不入库）；`check-links.mjs` 全站校验内链锚点，`fix-anchors.mjs` 为翻译期批量回修工具。
3. **移除 PostHog 遥测整合**（`docs.json.integrations.posthog`）：镜像站不加原组织的流量上报。
4. `docs/package.json` 剥离上游 workspace 依赖与 typecheck/check 脚本（镜像只需 `mint` CLI）。
5. `GLOSSARY.md` 为翻译术语表（含终检统一批次）。
6. `style.css` 追加 CJK 字体 fallback（拉丁字体不变，避免中文缺字）。

## 术语约定

见 `GLOSSARY.md`。要点：goal→目标、assertion→断言、locator→定位器、agent→智能体（API 名不译）、engine→引擎、replay cache→回放缓存、simulator→模拟器（iOS）/emulator→仿真器（Android）、fixture/runner/skill 不译。