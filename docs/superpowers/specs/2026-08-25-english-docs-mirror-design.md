# 英文镜像站：new-en-mirror 脚本设计（ai-memory 首例）

- 日期：2026-08-25
- 状态：已批准
- 背景：ai-memory 上游（https://github.com/akitaonrails/ai-memory）只有 markdown（根 README + `docs/` 35 篇），无任何文档网站。中文站 `ai-memory-docs-cn/` 已完成 36 篇翻译（快照 2026-08-21）。需求：为这类「仓库即源」的项目构建英文版网站，并把流程固化成脚本，下次遇到同样情况直接复用；英文站每页指回原 GitHub 仓库；上游有变化时检测并补译中文版。

## 目标

1. 一键生成英文 Starlight 镜像站（首例：`ai-memory-docs-en/` → `https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/`）。
2. 英文站每页 URL 与中文站**同路径**（`/install/` ↔ `/install/`，含 slug 去点行为如 `v0.3-roadmap.md → v03-roadmap`）。
3. 每页三层指向上游：frontmatter `source`（带 commit SHA 的 blob URL）+ 顶栏 GitHub 图标 + 页首 `:::note` 横幅。
4. 脚本可重跑幂等：内容文件全量覆盖，脚手架文件存在即跳过。
5. 重跑时 diff 上游变化，产出补译工单 `SYNC.md`；补译本身人工/会话内完成，沿用现有翻译流程（GLOSSARY 口径、commit message 惯例）。

## 架构

```
输入（每站一个配置 JSON）          脚本职责                          产物
────────────────────────    ─────────────────────────────    ─────────────────────
scripts/en-mirrors/*.json:   scripts/new-en-mirror.cjs        <dir>/（如 ai-memory-docs-en/）
  repo, dir, slug, title,    1. git clone（完整，拿历史）       ├── package.json
  since, mappings{}          2. 定位快照 commit（git log        ├── astro.config.mjs     ← 脚手架：仅首次
                             │   --until=since）                ├── src/content.config.ts
                             3. 按映射抽取 README + docs/*.md    ├── src/styles/theme.css ← 脚手架：仅首次
                             4. 生成 frontmatter + 横幅         ├── README.md            ← 脚手架：仅首次
                             5. 重写站内相对链接                ├── snapshot.json        ← 每次重写（基线）
                             6. 拷贝引用图片到 public/          ├── public/*             ← 每次覆盖
                             7. 写/比对 snapshot.json           └── src/content/docs/*.md ← 每次全量覆盖
                             8. 产出 SYNC.md（有变化时）
```

- 零第三方依赖的 Node ≥ 22 脚本（`.cjs`，与 `gen-index.cjs` 同风格）。git 操作经 `execSync` 调系统 `git`。
- 新项目接入 = 写一个新配置 JSON，零代码改动。

## 两类文件、两种生命周期

- **内容文件**（`src/content/docs/*.md`、`public/`）：上游的镜子，每次重跑**全量覆盖**，本地永不手改。
- **脚手架文件**（`package.json`、`astro.config.mjs`、`content.config.ts`、`theme.css`、仓库内 `README.md`）：**仅首次生成，存在即跳过**。sidebar 用 Starlight `autogenerate`（集合拍平一层目录），新页面自动进 sidebar。

## 路径对齐（与中文站同路径）

复用中文站建站的同一套映射（`ai-memory-docs-cn/scripts/add-frontmatter.cjs` 的规则）：

| 上游 | → 站内（中英相同） |
|---|---|
| `README.md` | `src/content/docs/index.md` |
| `docs/<name>.md` | `src/content/docs/<name>.md`（拍平） |
| `docs/examples/auto-improve-eval/README.md` | `src/content/docs/auto-improve-eval.md` |

文件名相同 → Astro slug 自动相同。映射表放每站配置 JSON 的 `mappings` 字段；默认规则 `docs/*.md → 同名拍平` 内置。

图片：扫描镜像 markdown 引用的图片，从上游拷进 `public/`，链接改写为 `/文件名`（与中文站约定一致）。

## 变化检测与补译工作流

1. `snapshot.json` 存 `{ commit, date, files: { 路径: sha256 } }`。
2. 首跑：配置 `since: "2026-08-21"` → `git log --until=<since> -1` 定位快照 commit → 与 HEAD diff。
3. 重跑：HEAD 与 snapshot.json 旧 commit diff。
4. 产出 `SYNC.md`：每个 M/A/D 文件 → 中文页路径 + GitHub 逐文件 diff 链接（中文页 `source` frontmatter 已有逐页 URL）。
5. 补译人工/会话内执行（本次实施末尾对 ai-memory 真跑一遍）。

## 指向上游（三层）

1. frontmatter：`source: "<repo>/blob/<commit>/<path>"`（带 SHA，可追溯）。
2. `astro.config.mjs` 的 Starlight `social.github` → 上游仓库。
3. 页首横幅（frontmatter 后注入）：

```markdown
:::note[Unofficial mirror]
This is an unofficial documentation mirror. [View the source on GitHub](<blob-url>) · [Upstream repo](<repo>)
:::
```

## 部署集成

- 目录：`ai-memory-docs-en/`（与 `*-docs-cn/` 平行）；线上 `https://lif3ng-vibe.github.io/docs-cn/ai-memory-en/`。
- `deploy-pages.yml` 加一段（与其他站同构）：`sed` 正文内链加 `/docs-cn/ai-memory-en/` 前缀 → `DOCS_BASE=/docs-cn/ai-memory-en/ npm ci && npm run build`；Assemble 加 `mv ai-memory-docs-en/dist _site/ai-memory-en`；npm cache 列表加其 lock 文件。
- `sites.json` 加 `{ name: "ai-memory (English)", slug: "ai-memory-en", …, lang: "en" }`；`gen-index.cjs` 支持可选 `lang` 字段（英文条目显示「English」标签，旧条目行为不变），刷新 `index.html`。

## 错误处理（fail-fast，不静默降级）

- clone 失败 / 默认分支探测失败 / 配置缺字段 / since 早于仓库历史 → 报错退出。
- `docs/` 不存在或映射后 0 文件 → 报错退出（仓库不适合此流程）。
- 上游删除文件 → SYNC.md 标记「上游已删，需人工决定中文页去留」，不自动删中文页。
- 站内相对链接（`](docs/foo.md)`、`](../README.md)`）按映射表重写为 `](/foo/)`；映射不到的保留原样并列 SYNC.md warning 段，不阻塞构建。

## 验证

1. 首跑：36 篇 + index 落位；脚本内置断言打印与中文站文件名集合的对齐报告。
2. `npm run build` 通过；站内链接不断链（复用 check-anchors 思路）。
3. SYNC.md 产出后完成中文补译，中文站构建验证。
4. 推送后线上抽查 `/docs-cn/ai-memory-en/` 几页。

## 范围外

- CI 自动定时同步（手动重跑快照，与仓库「一次性快照」模式一致）。
- 英文站搜索/评论等增强（Starlight 默认即可）。
- 中文站结构改动。
