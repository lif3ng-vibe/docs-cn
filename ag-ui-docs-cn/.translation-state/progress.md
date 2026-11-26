# progress — ag-ui-docs-cn（CI 模式续跑）

- 上游快照：ag-ui-protocol/ag-ui@ed94ca4a（B0 已拷入并 commit 3c65caf2）
- 阶段：A 翻译中（B0 脚手架完成）
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
| B4 | 规范 spec/draft×27（与 B3 同构；开工先读 .anchor-maps/B3/ 沿用同标题译文） | ⬜ |
| B5a | SDK dotnet×10 + python×5（磁盘实为 15 文件） | ✅（映射 15 份） |
| B5b | SDK js×13 + development×3 + drafts×3 + tutorials×2 + **support.mdx + integrations/google-adk-js.mdx（B1 清单漏项，此处补）** | ⬜ |
| B6 | snippets×3 + docs.json anchors 改站内 + 跨页锚点回修 + 终检（残留/锚点/字面**）+ README + 阶段 C 五处同步 | ⬜ |

## 已译文件清单

- openbot.mdx（B0 重写为中文说明页）
- B1（11）：introduction、agentic-protocols、quickstart/{introduction,server,middleware,applications,clients}、migrating-to-1-0、talk-to-us、integrations、integrations/omnara——锚点映射 11 份在 .anchor-maps/B1/

## 锚点回修状态

- 未开始；每文件随翻译产出 `.anchor-maps/<批>/<file>.map.md`（原英文标题 | 中文标题 | 新锚点），导出后 `scripts/verify-anchors-cn.mjs` 全站核对

## 下一步

1. B3 规范进行中；B5a 已开工（B4 特意排在 B3 完成后，沿用其完整锚点映射）
2. 后续按批次表推进；B4 开工前必读 .anchor-maps/B3/ 沿用 spec/1.0 同标题译文
3. B6 收尾时按「跨页锚点清单」+ verify-anchors-cn.mjs 全站回修

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

## 范围补充（本轮发现）

- spec/1.0/schema.mdx 与 spec/draft/schema.mdx 不在导航，但被正文大量 `#statesnapshotevent` 等深链引用 → 并入 B3/B4 翻译（schema 页以表格为主：字段说明列译，字段名/类型/枚举值不译）
- integrations/google-adk-js.mdx、support.mdx 在导航内（B1 清单漏列）→ 并入 B5b
