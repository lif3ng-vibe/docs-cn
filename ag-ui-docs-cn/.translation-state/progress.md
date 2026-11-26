# progress — ag-ui-docs-cn（CI 模式续跑）

- 上游快照：ag-ui-protocol/ag-ui@ed94ca4a（B0 已拷入并 commit 3c65caf2）
- 阶段：**C 完成（STATUS=done）**——A/B/C 全链收官
- 交付：导航 116 页 + omnara + snippets 共 120 文件全译；锚点三轮回修 427 处；validate 全绿；dist CJK-邻接 ** 扫描归零；prefix+冒烟 200/含 CJK；五处同步（sites.json/gen-index/deploy-pages.yml/README×3）完成
- 已知上游自身缺陷（忠实保留）：subscriber 页 2 处坏锚点（EN 基线同坏）；匿名导出无搜索索引（搜索钮死）
- 未收录上游未发布内容：sdk/{dart,go,java,kotlin,ruby,rust} 树、sdk/js/overview、superpowers/、snippets/snippet-intro（均无导航无内链）
- 站点形态：Mintlify（docs.json 导航 + .mdx），构建 = `mintlify validate` / `mintlify export`（dist），部署前缀由 `scripts/prefix-dist.mjs` 处理
- 基线英文导出（锚点底稿）：续跑时重新生成 → `/tmp/dist-en`（不进 git）

## 范围裁定（本 run 确认，后续 run 沿用）

- **翻译范围 = docs.json 导航 116 页 + integrations/omnara（被 introduction/integrations 内链）+ snippets/3 个内嵌组件 = 120 个 .mdx**
- **不译**（上游未发布、无导航无内链，留在原样英文）：`sdk/{dart,go,java,kotlin,ruby,rust}` 全部、`sdk/js/overview`、`superpowers/specs/*.md`（上游内部设计稿）
- docs.json 的 name 保持英文（协议品牌名）；navbar/footer 无需译
- global anchors 原指上游绝对 URL，翻译收尾阶段改为站内路径（三页均在导航内）

## 批次

| 批 | 内容 | 状态 |
|---|---|---|
| B0 | 脚手架：快照拷入、上游 MDX 伤修复、导航中文化、GLOSSARY | ✅ commit 3c65caf2 |
| 状态重建 | progress.md 重建 + 范围裁定 + .gitignore 修复 | ✅ commit 2f70064a |
| B1 | 快速开始 11 文件（introduction, agentic-protocols, quickstart×5, migrating, talk-to-us, integrations+omnara） | ✅ |
| B2 | 核心概念 concepts×14 | ✅（页内锚点改写 7 处，映射 14 份） |
| B3 | 规范 spec/1.0×27（含 schema.mdx——不在导航但被 12+ 处 `#anchor` 深链，必须译） | ✅（页内锚点 9 处，映射 27 份；`mintlify validate` 全绿仅 49 条良性 duplicate-h1 警告=上游风格） |
| B4 | 规范 spec/draft×27（与 B3 同构；沿用 B3 译名） | ✅（页内锚点 10 处，映射 27 份；schema 98 定义标题保持英文） |
| B5a | SDK dotnet×10 + python×5（磁盘实为 15 文件） | ✅（映射 15 份） |
| B5b | SDK js×13 + development×3 + drafts×3 + tutorials×2 + support + integrations/google-adk-js | ✅（实译 22 文件；sdk/js/encoder.mdx、sdk/js/proto.mdx 为空页未动；页内锚点约 120 处，映射 22 份） |
| B6 | snippets×3 + docs.json anchors 改站内 + 跨页锚点回修 + 终检（残留/锚点/字面**）+ README + 阶段 C 五处同步 | ⬜ |

## 已译文件清单

- openbot.mdx（B0 重写为中文说明页）
- B1（11）：introduction、agentic-protocols、quickstart/{introduction,server,middleware,applications,clients}、migrating-to-1-0、talk-to-us、integrations、integrations/omnara——锚点映射 11 份在 .anchor-maps/B1/

## 锚点回修状态

- 未开始；每文件随翻译产出 `.anchor-maps/<批>/<file>.map.md`（原英文标题 | 中文标题 | 新锚点），导出后 `scripts/verify-anchors-cn.mjs` 全站核对

## 下一步

全部翻译批次（B1–B5b、B4）完成 → **B6 收尾**（主线执行）：
1. spec/1.0/schema.mdx 补译 2 句 "Discriminated by `role`/`op`."（B4 发现的 B3 漏网，与 draft 页统一为「以 `role`/`op` 判别。」）
2. snippets×3 主线自译（snippets/draft-notice、since、snippet-intro——MDX 组件，import 它们的页面不用动）
3. docs.json navigation.global 三条 anchors 改站内路径（/sdk/js/core/overview、/sdk/python/core/overview、/sdk/dotnet/abstractions/overview）
4. 全站 export → `node scripts/repair-anchors-cn.mjs /tmp/dist-en dist --apply` → 重导出 → `node scripts/verify-anchors-cn.mjs` 复验至零缺失（外站锚点除外）；dry-scan 基数 228 处
5. 残留检查（B1–B5b 已过，重跑全量）+ dist 剥标签扫字面 `**`（应为 0）
6. `DOCS_BASE=/docs-cn/ag-ui node scripts/prefix-dist.mjs` + `node scripts/smoke-serve.mjs` 冒烟（curl http://localhost:4639/docs-cn/ag-ui/ → 200 且含 CJK）；确认 dist 无 .anchor-maps/.translation-state 泄漏
7. 阶段 C 五处同步（hub sites.json + gen-index.cjs + deploy-pages.yml 构建段 + README 三处）；Mintlify=导出产物镜像（prefix 后纯拷贝），CI 构建段照 herdr/diagram-design 先例
8. `git fetch origin master && git merge --no-edit origin/master`（冲突规则：sites.json 并存重跑 gen-index、README 段落并存）→ 最终 push → STATUS=done → 总结回帖

## 结构勘误

- **.anchor-maps 已迁出 Mintlify 内容根** → `../.anchor-maps-ag-ui/`（仓库内仍提交）：Mintlify validate/export 会把项目下所有 .md/.mdx 当内容扫描，映射文件里的元数据（如 `<Since>` 字样）会造成 parse-error 与垃圾导出页。repair-anchors-cn.mjs 已同步改路径

## 跨页锚点清单（回修用，逐批追加）

- B1：quickstart/server.mdx:40 → python-poetry.org#installation（外站）；omnara 两处外站锚点。站内互链锚点：无
- B2 站内待回修（8 处，源文件 → 目标锚点）：
  - concepts/events.mdx → /concepts/reasoning#migration-from-thinking-events
  - concepts/interrupts.mdx → /concepts/subagents#suspension
  - concepts/metadata.mdx → /concepts/interrupts#resuming-a-run
  - concepts/reasoning.mdx → /concepts/events#reasoning-events（2 处）、/concepts/messages#reasoning-messages
  - concepts/middleware.mdx → /spec/1.0/basic/versioning#version-negotiation
- B5a 站内待回修（要点，完整清单见 .anchor-maps/B5a/ 各映射文件的旧→新登记）：dotnet/python 的 types/events 页标题锚点已变（#context→#上下文、#tool→#工具、#state→#状态、#message-types、#runagentinput、#agentcapabilities、events#lifecycle-events、#text-message-events、#tool-call-events、#state-management-events、#special-events、chat-client#construction/#streaming-responses/#statelessness-and-conversationid/#thread-continuity/#interrupts-and-approvals、transport#iaguitransport/#http-transport/#custom-transports 等）——引用这些页的内链在 B6 用映射回修；B5a 页自身出站锚点：/concepts/interrupts#resuming-a-run、/concepts/metadata#resume-entries、/concepts/reasoning#migration-from-thinking-events、/spec/1.0/events/lifecycle#token-usage
- B3 站内待回修：spec/1.0 内部跨页锚点约 35 处 + 入链 1 处（sdk/python/core/events.mdx:109→lifecycle#token-usage）——目标标题本批已改中文锚点（cancelled-runs、token-usage、several-runs-on-one-stream、absent-means-absent、provider-file-handles、retired-shapes、version-negotiation、the-binding-contract、truncation、chunk-metadata、closing-a-chunk-stream、the-chunked-form、frontend-tools、result-content、messages_snapshot、when-a-patch-does-not-apply、text_message_end 等），完整逐条清单在 B3 汇报，B6 以 verify-anchors-cn.mjs 实测 + .anchor-maps/B3/ 映射回修为准
- B3 特记：schema.mdx 的 96 个定义标题保持英文（深链锚点不变，只有页内 #mixins→#混入 一处）
- B5b 站内待回修（要点，完整见 .anchor-maps/B5b/）：sdk/js 两个 overview 页出站锚点指向 client/{abstract-agent,http-agent,middleware,subscriber} 与 core/{types,events} 的新中文标题锚点（约 30 个 slug）；另 4 处跨批（concepts/interrupts#resuming-a-run、concepts/metadata#resume-entries、spec/1.0/events/lifecycle#token-usage、concepts/reasoning#migration-from-thinking-events）。注意 subscriber/middleware 各有同名标题重名（slug 带 -1 后缀），回修以新 dist 实测 id 为准

## 范围补充（本轮发现）

- spec/1.0/schema.mdx 与 spec/draft/schema.mdx 不在导航，但被正文大量 `#statesnapshotevent` 等深链引用 → 并入 B3/B4 翻译（schema 页以表格为主：字段说明列译，字段名/类型/枚举值不译）
- integrations/google-adk-js.mdx、support.mdx 在导航内（B1 清单漏列）→ 并入 B5b
