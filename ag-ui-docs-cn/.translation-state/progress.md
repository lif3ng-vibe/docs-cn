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
| B1 | 快速开始：introduction, agentic-protocols, quickstart×5, migrating-to-1-0, talk-to-us, integrations(+omnara) | ⬜ |
| B2 | 核心概念 concepts×14 | ⬜ |
| B3 | 规范 spec/1.0×25 | ⬜ |
| B4 | 规范 spec/draft×25（与 B3 内容高度同构，术语沿用） | ⬜ |
| B5a | SDK dotnet×12 + python×6 | ⬜ |
| B5b | SDK js×13 + tutorials×2 + drafts×3 | ⬜ |
| B6 | snippets×3 + docs.json anchors 改站内 + 终检（残留/锚点/字面**）+ README + 阶段 C 五处同步 | ⬜ |

## 已译文件清单

- openbot.mdx（B0 重写为中文说明页）

## 锚点回修状态

- 未开始；每文件随翻译产出 `.anchor-maps/<批>/<file>.map.md`（原英文标题 | 中文标题 | 新锚点），导出后 `scripts/verify-anchors-cn.mjs` 全站核对

## 下一步

1. npm install → 基线 `mintlify export` → `/tmp/dist-en`（重建锚点底稿）
2. B1 起按上表逐批翻译（子代理一回复一文件，总并发 ≤2，每批 commit+push+回帖）
