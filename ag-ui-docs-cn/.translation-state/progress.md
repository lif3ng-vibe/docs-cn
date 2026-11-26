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
| B2 | 核心概念 concepts×14 | 🔄 进行中（6/14） |
| B3 | 规范 spec/1.0×27（含 schema.mdx——不在导航但被 12+ 处 `#anchor` 深链，必须译） | ⬜ |
| B4 | 规范 spec/draft×27（与 B3 同构；开工先读 .anchor-maps/B3/ 沿用同标题译文） | ⬜ |
| B5a | SDK dotnet×10 + python×6 | ⬜ |
| B5b | SDK js×13 + development×3 + drafts×3 + tutorials×2 + **support.mdx + integrations/google-adk-js.mdx（B1 清单漏项，此处补）** | ⬜ |
| B6 | snippets×3 + docs.json anchors 改站内 + 跨页锚点回修 + 终检（残留/锚点/字面**）+ README + 阶段 C 五处同步 | ⬜ |

## 已译文件清单

- openbot.mdx（B0 重写为中文说明页）
- B1（11）：introduction、agentic-protocols、quickstart/{introduction,server,middleware,applications,clients}、migrating-to-1-0、talk-to-us、integrations、integrations/omnara——锚点映射 11 份在 .anchor-maps/B1/

## 锚点回修状态

- 未开始；每文件随翻译产出 `.anchor-maps/<批>/<file>.map.md`（原英文标题 | 中文标题 | 新锚点），导出后 `scripts/verify-anchors-cn.mjs` 全站核对

## 下一步

1. B2 收尾（剩 8 个 concepts 文件）；B3 已开工
2. 后续按批次表推进；B4 开工前必读 .anchor-maps/B3/ 沿用 spec/1.0 同标题译文
3. B6 跨页锚点回修素材：B1 报告跨页锚点均为外站（本批 11 页互无锚点互链）；B2+ 各批汇报的跨页锚点清单逐批并入 progress「跨页锚点清单」节

## 跨页锚点清单（回修用，逐批追加）

- B1：quickstart/server.mdx:40 → python-poetry.org#installation（外站）；omnara 两处外站锚点。站内互链锚点：无

## 范围补充（本轮发现）

- spec/1.0/schema.mdx 与 spec/draft/schema.mdx 不在导航，但被正文大量 `#statesnapshotevent` 等深链引用 → 并入 B3/B4 翻译（schema 页以表格为主：字段说明列译，字段名/类型/枚举值不译）
- integrations/google-adk-js.mdx、support.mdx 在导航内（B1 清单漏列）→ 并入 B5b
