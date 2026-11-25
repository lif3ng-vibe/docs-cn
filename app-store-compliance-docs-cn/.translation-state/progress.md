# progress — app-store-compliance-docs-cn

任务：汉化 https://mjmirza.github.io/app-store-compliance/ （issue #3，CI 模式）
上游快照：mjmirza/app-store-compliance@5ee6c45cf17db209b4348565fa6d6a1d949ed52e（2026-11-25）

## 形态判定（已定，勿重开）

- 上游 = GitHub Pages **内建 Jekyll**（docs/ 源目录 + jekyll-theme-primer，无 Pages workflow）
- 交付 = **翻译 markdown 源（docs/）→ 上游原班 Jekyll 本地构建（tools/build.sh）→ 静态镜像 site/ 并入 hub**
  （hub CI 纯拷贝零构建，同 herdr/diagram-design/cli-anything 先例）
- 已验证：Jekyll 4.4.1 本地构建 OK；中文标题锚点保留 CJK（`id="中文标题一带全角冒号"`）；
  jekyll-relative-links 自动改写 `.md` 内链并带 baseurl；raw `.md` 静态拷贝行为与线上站一致（200 text/markdown）
- _config.yml 改动：url/baseurl/lang=zh-CN、+defaults(layout: default)（复现 GitHub Pages 注入）、
  +repository/github 钉上游（页脚）、description 译、删 webmaster_verifications 与上游验证 txt（所有权声明不迁移）
- docs/_layouts/default.html：覆盖主题 layout，仅译页脚两句（"本站为开源项目，欢迎改进此页。"），其余与 gem 逐字节一致

## 配置期统一改写清单（已完成于源文件则打钩）

- [x] 5 处 `](../…)` 仓库根死链 → 改指 GitHub blob URL（上游线上站本就 404）：
  - templates/app-review-readiness.json、templates/REVIEW-NOTES-TEMPLATE.md、data/regulatory-deadlines.json、
    agent-os/hooks/app-store-compliance-guard.sh、.github/SECURITY.md
- [x] llms.txt：正文译、URL 一律不动（红线）——批次 1 已完成

## 锚点预算（全站仅 1 个跨文件锚点，0 个同页锚点）

- MISTAKE-PATTERNS.md 内 `#the-appeal-playbook` ←→ GOOGLE-PLAY.md？链接处待译时回填 `.anchor-maps/`
- 英文锚点基线：/tmp/dist-en（旧锚点权威底稿，CI 内重建）

## 批次（33 篇 md + llms.txt，共 125,565 词）

| 批 | 内容 | 词数 | 状态 |
|---|---|---|---|
| 0 | 脚手架 + 配置中文化 + EN 基线 | - | ✅ 已提交 |
| 1 | index + PRE-SUBMISSION-CHECKLIST + APPLE | 9,801 | ✅ 已提交（build 绿 / dist CLEAN / residue CLEAN） |
| 2 | GOOGLE-PLAY + BY-APP-TYPE + MISTAKE-PATTERNS（含锚点回修） | 6,030 | ✅ 已提交（3 篇全译 + 锚点回修；build 绿 / dist CLEAN / residue CLEAN） |
| 3 | MOBILE-PRIVACY-MONITOR + MOBILE-SECURITY + CROSS-PLATFORM-FRAMEWORKS + WHAT-THE-SCAN-PROVES + ACCESSIBILITY | 13,286 | ✅ 已提交（5 篇全译；build 绿 / dist CLEAN / residue CLEAN / tables 分诊 0 真残留） |
| 4 | PRIVACY-POLICY-MIGRATION + SECURITY-POLICY-MIGRATION + ANDROID-POLICY-MIGRATION + AI-POLICY-MIGRATION | 6,966 | ✅ 已提交（4 篇全译；build 绿 / dist CLEAN / residue CLEAN / tables CLEAN） |
| 5 | EU-REGULATORY-2026 + GLOBAL-REGULATORY-2026 | 14,861 | ✅ 已提交（2 篇全译；build 绿 / dist CLEAN / tables CLEAN / residue 分诊 0 真残留——命中均为 URL slug 误报） |
| 6 | PLATFORM-MECHANICS-2026 + ADVANCED-2026 + OPEN-SOURCE-PATTERNS | 9,389 | ⬜ |
| 7 | GAP-ANALYSIS-2026-09 + GAP-ANALYSIS-2026-11 + REGULATORY-GAP-REPORT-2026 + COMPETITIVE-GAP-ANALYSIS | 9,443 | ⬜ |
| 8 | OTHER-STORES + GAMBLING-MATRIX + FLEET-SWEEP + RULING-REGISTER + CREDITS + FAQ.md | 6,893 | ⬜（FAQ.md 3,104 词此前漏排批次，已并入本批） |
| 9 | questions.md（21k 词，分 4 段并行译：1-400 / 401-724 / 725-930 / 931-1325 行，各段写 part 文件后拼接） | 21,041 | ⬜ |
| 10 | REGULATORY-TIMELINE.md（27.9k 词，207 表行，分 4 段并行译：1-105 / 106-223 / 224-900 / 898-1580 行，各段写 part 文件后拼接） | 27,855 | ⬜ |
| 11 | 项目 README + 终检（残留/CJK 粗体/锚点/构建） | - | ⬜（llms.txt 已于批次 1 完成） |

## 阶段

- 阶段 A（翻译）：进行中（批次表如上）
- 阶段 B（带 base 构建演练）：每批后跑 tools/build.sh 验证；终检跑全量（内链前缀/中文锚点/残留/字面 `**`）
- 阶段 C（五处同步）：⬜ sites.json + gen-index、deploy-pages.yml（`cp -r site → _site/app-store-compliance`）、README 三处

## 终检工具与白名单

- tools/check-dist.cjs：字面 `**` / 片段锚点 / 内链存在性 / baseurl 前缀 —— 已就位，当前 CLEAN
- tools/check-tables.cjs：表格单元格英文残留启发式（residue-check 跳表格的补充）—— 已就位
- residue-check.cjs（skill 版）：批内 md 逐篇跑；白名单：index.md 的 JSON-LD `<script>` 行（红线：script 不动）
- MISTAKE-PATTERNS 曾用「」引号 → 已统一 ""（后续子代理汇报里抽查此项）

## 下一步

批次 6（PLATFORM-MECHANICS、ADVANCED、OPEN-SOURCE-PATTERNS）→ 7 → 8 → 9 → 10 → 11 → 阶段 C

## 环境备忘（CI 续跑用）

- jekyll 装在用户目录：`export PATH="/home/runner/.local/share/gem/ruby/3.3.0/bin:$PATH"` 后跑 `tools/build.sh`
- site/ 是**入库产物**（每批连 md 一起提交构建后的 html/md 镜像），非 gitignore
- 残留检查命令：`node /home/runner/work/docs-cn/docs-cn/.claude/skills/translate-docs-site/residue-check.cjs docs/<files>`
  （命中先分诊：sed 剥链接与 URL 后重扫，0 真残留即过）
