# docs-cn

开源项目文档的中文翻译集合。每个子目录是一个独立可运行的文档站点（Astro + Starlight），翻译均为非官方、一次性快照。

## 收录项目

| 项目 | 目录 | 原站 | 上游仓库 | 快照日期 |
|---|---|---|---|---|
| codegraph | `codegraph-docs-cn/` | https://colbymchenry.github.io/codegraph/ | https://github.com/colbymchenry/codegraph | 2026-08-18 |
| Orca | `orca-docs-cn/` | https://www.onorca.dev/docs | https://github.com/stablyai/orca | 2026-08-19 |
| Matt Pocock Skills | `mattpocock-skills-docs-cn/` | https://www.aihero.dev/skills | https://github.com/mattpocock/skills | 2026-08-20 |
| Agency Agents | `agency-agents-docs-cn/` | 无（仓库即源） | https://github.com/msitarzewski/agency-agents（快照 `f99f6aa`） | 2026-10-08 |
| Agency Agents (EN) | `agency-agents-docs-en/` | 无（仓库即源，对照 origin 侧） | https://github.com/msitarzewski/agency-agents（快照 `f99f6aa`） | 2026-10-08 |
| AI 编码词典 | `ai-coding-dictionary-docs-cn/` | https://www.aihero.dev/ai-coding-dictionary | https://github.com/mattpocock/dictionary-of-ai-coding | 2026-08-20 |
| ai-memory | `ai-memory-docs-cn/` | 无（仓库即源） | https://github.com/akitaonrails/ai-memory | 2026-08-21 |
| ai-memory (EN) | `ai-memory-docs-en/` | 无（仓库即源） | https://github.com/akitaonrails/ai-memory | 2026-08-25 |
| Nimbus | `nimbus-docs-cn/` | https://nimbus-docs.com | https://github.com/cloudflare/nimbus | 2026-09-28 |
| OpenRig | `openrig-docs-cn/` | https://openrig.dev/ | https://github.com/mvschwarz/openrig | 2026-09-30 |
| OpenRig (EN) | `openrig-docs-en/` | 无（仓库即源） | https://github.com/mvschwarz/openrig | 2026-09-30 |
| OpenShip | `openship-docs-cn/` | https://openship.io/docs | https://github.com/oblien/openship | 2026-09-30 |
| Agent Skills | `agent-skills-docs-cn/` | https://skills.addy.ie/ | https://github.com/addyosmani/agent-skills（站点工程：[skills.addy.ie](https://github.com/addyosmani/skills.addy.ie)） | 2026-10-08 |
| e2e | `tester-army-e2e-docs-cn/` | https://e2e.tester.army/docs | https://github.com/tester-army/e2e（快照 `main` @ 2026-10-07） | 2026-10-08 |
| Claude-Mem | `claude-mem-docs-cn/` | https://docs.claude-mem.ai/ | https://github.com/thedotmack/claude-mem（快照 `71ddd11`，Mintlify 源在其 docs/public/） | 2026-10-08 |
| AI SDK | `ai-sdk-docs-cn/` | https://ai-sdk.dev | https://github.com/vercel/ai（快照 `main@5028fa4`，上游快照副本在 `ai-sdk-main/`） | 2026-10-09 |
| Pi | `pi-docs-cn/` | https://pi.dev/docs/latest | https://github.com/earendil-works/pi（快照 `main@6fb2e78`，Mintlify 源在其 packages/coding-agent/docs/） | 2026-10-09 |

> Nimbus 子站与其他不同：上游是 pnpm monorepo（Astro 7 + 自研框架包），构建走 `pnpm install → 框架包 build → apps/www build`（见 `nimbus-docs-cn/README.md` 与 CI 的 nimbus 构建段）。
> e2e 子站与其他不同：上游是 Mintlify 站（无本地静态构建可用）——CI 用 MINT_CONFIG 凭据跑 `npx mint export`（云端生成）出纯静态产物，`postprocess-export.mjs` 再对其 HTML 内的根绝对引用加 `/docs-cn/tester-army-e2e/` 前缀（见该子站 README 与 CI 构建段）。
> OpenShip 子站亦为 pnpm monorepo（fumadocs + Next.js 16 静态导出）：Next 按 `NEXT_BASE_PATH` 自动加前缀，**无需 sed**；canonical/sitemap 由 `NEXT_PUBLIC_SITE_URL` 注入；产物在 `apps/web/out/`（见 CI 的 openship 构建段与其 README）。
> Agent Skills 子站：官网源码在上游独立仓库 `addyosmani/skills.addy.ie`，正文是 `.astro`/`.ts` 数据文件而非 markdown；站内链接已在源码级前缀化（`astro.config.mjs` 注释），**无需 env base 也无需 sed**。技能包本体（`skills/*/SKILL.md`，供智能体执行的英文提示词）不属于站点内容，不参与翻译。

## 运行任意子项目

每个子目录都是独立站点，前置要求 Node.js ≥ 22.12：

```bash
cd <子目录>          # 如 codegraph-docs-cn 或 orca-docs-cn
npm install
npm run dev          # 本地预览，默认 http://localhost:4321/
npm run build        # 产出 dist/
npm run preview      # 预览构建产物
```

## 翻译说明

- **复用原站工程**：拿到上游站点源码时，沿用原工具链（配置/主题/组件），仅中文化内容（codegraph）。
- **从渲染站点重建**：上游站点源码不公开时，从线上站点的 Next.js RSC payload 提取正文重建为 Markdown，再用 Starlight 搭站（orca）。
- **从内容仓库新建**：上游只有 markdown 内容、没有站点工程时（托管平台不开源），用 Starlight 新建中文站（mattpocock-skills、ai-coding-dictionary）；原站的站内链接改写为本站路径，词典类词条保留英文术语加中文译名。
- 术语口径见各子目录的 `GLOSSARY.md`（如适用）。
- 代码块、命令、配置键、产品名保留英文；按钮/菜单名保留英文加粗并首次出现括注中文。
- 每页 frontmatter 的 `source` 字段记录原站 URL，便于后续手动同步。

## 目录结构

```
docs-cn/
├── sites.json             # 子站点清单（入口页数据源）
├── scripts/gen-index.cjs  # 由 sites.json 生成入口页 index.html
├── index.html             # 入口页（由脚本生成，勿手改）
├── .github/workflows/     # Pages 部署 CI
├── codegraph-docs-cn/     # codegraph 中文文档（Starlight）
├── orca-docs-cn/          # Orca 中文文档（Starlight）
├── mattpocock-skills-docs-cn/          # Matt Pocock Skills 中文文档（Starlight）
├── agency-agents-docs-cn/              # Agency Agents 中文版（Starlight，18 部门 326 篇 + NEXUS 战略手册）
├── agency-agents-docs-en/              # Agency Agents 英文镜像（Starlight，与中文站 1:1 配对）
├── ai-coding-dictionary-docs-cn/       # AI 编码词典中文版（Starlight）
├── ai-memory-docs-cn/                  # ai-memory 中文文档（Starlight，36 篇）
├── ai-memory-docs-en/                  # ai-memory 英文镜像（Starlight，脚本生成，36 篇）
├── nimbus-docs-cn/                     # Nimbus 中文文档（pnpm monorepo，apps/www 站点，66 篇）
├── openrig-docs-cn/                    # OpenRig 中文文档（Starlight，仓库 docs/ 全集 90 篇）
├── openrig-docs-en/                    # OpenRig 英文镜像（Starlight，脚本生成，90 篇）
├── openship-docs-cn/                   # OpenShip 中文文档（fumadocs + Next.js 16 静态导出，164 篇 + 营销站）
├── agent-skills-docs-cn/               # Agent Skills 官方站中文版（原版 Astro 5 营销/教程站，36 页）
├── tester-army-e2e-docs-cn/            # e2e 中文文档（Mintlify 原班 + export 导出，52 篇 MDX）
├── claude-mem-docs-cn/                 # Claude-Mem 中文文档（Mintlify 原班构建，49 篇 + export+prefix 部署链）
├── ai-sdk-docs-cn/                     # AI SDK 中文文档（geistdocs/fumadocs + Next.js 16 静态导出，540 页 v7 全集）
├── ai-sdk-main/                        # vercel/ai 上游英文快照（main@5028fa4，供后续同步 diff）
├── pi-docs-cn/                         # Pi 中文文档（Mintlify 原班构建，40 篇 + export+prefix 部署链）
└── docs/                  # 翻译流程的设计文档与实施计划
```

## 新增一个翻译站点

1. 新建子目录（如 `foo-docs-cn/`），完成翻译站点。
2. 在 `sites.json` 加一条：`{ "name": "Foo", "slug": "foo", "desc": "一句话介绍。", "orig": "https://原站 URL", "repo": "https://上游仓库" }`；若同仓库还构建了英文镜像，再加 `"en": "<英文站 slug>"`（入口页整卡点击进中文站，按钮显示「官方文档」「仓库」「英文文档」；上游无站点即 orig 与 repo 相同时不显示「官方文档」）。
3. 在 `.github/workflows/deploy-pages.yml` 加一段构建步骤（以 `DOCS_BASE=/docs-cn/foo/` 构建，构建前 `sed` 给正文内链加前缀），并在 Assemble 步骤里 `mv foo-docs-cn/dist _site/foo`。
4. 本地跑 `node scripts/gen-index.cjs` 刷新 `index.html`，提交。

## 新增一个英文镜像站（上游无站点、只有 markdown 时）

上游仓库只有 markdown（README + `docs/`）而无文档网站时，用镜像脚本一键生成英文 Starlight 站（每页 frontmatter `source`、页首横幅、顶栏 GitHub 图标均指向上游仓库，站内路径与对应中文站完全一致）：

```bash
node scripts/new-en-mirror.cjs --config scripts/en-mirrors/<site>.json
```

- 配置见 `scripts/en-mirrors/`（repo/dir/slug/title/since/mappings），新项目照抄一份即可。
- 内容目录是上游的镜子：重跑脚本全量覆盖，勿手改；脚手架（astro.config.mjs 等）仅首次生成，可手调。
- 上游有变化时重跑会产出 `<dir>/SYNC.md`（中文站补译工单：变更文件 + GitHub compare 链接），补译完成后重跑即刷新基线。
- 部署与中文站同流程：`sites.json` 加条目（可带 `"lang": "en"` 显示 EN 标签）+ `deploy-pages.yml` 加构建段。

## 本地开发 vs GitHub Pages 部署

**日常迭代**（不带前缀，直接访问）：

```bash
cd <子目录>
npm run dev          # http://localhost:4321/
npm run build        # dist/ 可直接用 npm run preview 预览
```

子站点的 `astro.config.mjs` 用 `base: process.env.DOCS_BASE || '/'`——日常不设该变量即 `base: '/'`，所有链接为根路径。

**GitHub Pages 部署**（带前缀，CI 自动处理）：

推送到 `master` 即触发 `.github/workflows/deploy-pages.yml`，在 Linux runner 上：

1. 用 `sites.json` 生成入口页 `index.html`。
2. 给每个子站点的正文 markdown 内链 `](/path)` 临时加 `/docs-cn/<站>/` 前缀（Astro 对 Starlight 组件链接会自动加 base，但对正文 markdown 内链不会，需 CI 补齐；源码保持不带前缀）。
3. 以 `DOCS_BASE=/docs-cn/<站>/` 构建。
4. 组装产物：入口页 `index.html` 在根，子站点分别在 `codegraph/`、`orca/`、`mattpocock-skills/`、`ai-coding-dictionary/`、`ai-memory/`、`nimbus/`。
5. 部署到 https://lif3ng-vibe.github.io/docs-cn/ 。

部署后访问地址：
- 入口：https://lif3ng-vibe.github.io/docs-cn/
- codegraph：https://lif3ng-vibe.github.io/docs-cn/codegraph/
- Orca：https://lif3ng-vibe.github.io/docs-cn/orca/
- Matt Pocock Skills：https://lif3ng-vibe.github.io/docs-cn/mattpocock-skills/
- AI 编码词典：https://lif3ng-vibe.github.io/docs-cn/ai-coding-dictionary/
- ai-memory：https://lif3ng-vibe.github.io/docs-cn/ai-memory/
- ai-memory（英文镜像）：https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/
- Nimbus：https://lif3ng-vibe.github.io/docs-cn/nimbus/
- OpenRig：https://lif3ng-vibe.github.io/docs-cn/openrig/
- OpenRig（英文镜像）：https://lif3ng-vibe.github.io/docs-cn/openrig-en/
- OpenShip：https://lif3ng-vibe.github.io/docs-cn/openship/
- Agent Skills：https://lif3ng-vibe.github.io/docs-cn/agent-skills/
- Agency Agents：https://lif3ng-vibe.github.io/docs-cn/agency-agents/
- Agency Agents（英文镜像）：https://lif3ng-vibe.github.io/docs-cn/agency-agents-en/
- e2e：https://lif3ng-vibe.github.io/docs-cn/tester-army-e2e/
- Claude-Mem：https://lif3ng-vibe.github.io/docs-cn/claude-mem/
- AI SDK：https://lif3ng-vibe.github.io/docs-cn/ai-sdk/
- Pi：https://lif3ng-vibe.github.io/docs-cn/pi/

> 仓库 Settings → Pages 的 Source 需设为 **GitHub Actions**。

## 许可

翻译内容遵循各上游项目的原始许可。每个子目录的 README 标注了来源与快照日期。