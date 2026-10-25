# openshell-docs-cn

NVIDIA OpenShell 文档中文镜像（非官方翻译）。OpenShell 是自主 AI 智能体的安全私有运行时：以内核级隔离的沙箱运行智能体编队，用声明式策略约束文件、进程与网络访问。

- 上游站点：https://docs.nvidia.com/openshell/latest/
- 源仓库：https://github.com/NVIDIA/OpenShell（`docs/` 目录，Apache-2.0）
- 快照：上游 main 分支 commit `c4688aa8715ea75d6c39fe468361dbbc16c691fa`（2026-10-24）
- 翻译基准：`latest` 频道内容；一次性快照，不做上游持续同步（如需同步，用上面的 commit 手动 diff）

## 非官方翻译声明

本项目是社区汉化，与 NVIDIA 无关。术语以站内 GLOSSARY.md 为准；翻译问题以英文原文为准。上游文档更新频繁，镜像内容可能滞后。

## 工程说明

上游站点由 Fern 托管渲染（云端构建，无法离线自托管），故本镜像以 Starlight（Astro）重建站点外壳；`docs/` 的 MDX 内容原样搬运并汉化，Fern 组件映射为 Starlight 等价物（Note/Warning/Tip/Info → Aside、Tabs/Tab → Tabs/TabItem、Cards/Card → CardGrid/LinkCard、Steps → 自建容器组件），CommandTerminal 与 BadgeLinks 两个自定义组件移植为 Astro 组件。锚点在翻译后按中文标题重新生成，映射存于 `.anchor-maps/`。

## 本地运行

前置要求：Node.js ^22.12.0 或 >=24.0.0。

```shell
npm install
npm run dev      # http://localhost:4321
npm run build    # 产物在 dist/
```

带部署前缀构建（与 hub Pages 一致）：

```shell
MSYS2_ENV_CONV_EXCL="DOCS_BASE;DOCS_SITE" \
  DOCS_SITE=https://lif3ng-vibe.github.io DOCS_BASE=/docs-cn/openshell/ \
  npm run build
```

## 脚本

| 脚本 | 用途 |
|---|---|
| `scripts/convert-fern.mjs` | Fern MDX → Starlight MDX 一次性基线转换（已跑完，留档） |
| `scripts/fix-links.mjs` | 翻译后按 `.anchor-maps/` 回修站内链接的 `#锚点` 片段 |
| `scripts/verify-anchors.mjs` | 构建后核对 dist 内锚点引用与 id 全匹配 |
