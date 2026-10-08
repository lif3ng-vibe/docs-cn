# claude-mem-docs-cn — Claude-Mem 文档中文镜像（非官方）

Claude-Mem（Claude Code 持久记忆压缩系统）文档站 docs.claude-mem.ai 的全站汉化镜像，基于上游 Mintlify 源工程原班构建。

- 源站：https://docs.claude-mem.ai/
- 上游仓库：https://github.com/thedotmack/claude-mem（站源在其 `docs/public/`：docs.json + 49 篇 .mdx）
- 快照：上游 commit `71ddd11735d6dc38a6356fe376921fc216f2aa38`（2026-10-06）
- 镜像部署：https://lif3ng-vibe.github.io/docs-cn/claude-mem/
- 范围：49 篇正文 + frontmatter + docs.json 导航/站名/按钮/footer 全部汉化；代码块、命令、环境变量、MCP/组件名不译。README 各语言版（docs/i18n）链接到的每一篇文档均有对应译文。

## 本地运行

```bash
npm ci          # 安装 mintlify CLI（~890 包）
npx mintlify validate    # 构建校验
npx mintlify export --disable-openapi   # 全量静态导出 → export.zip（首次约 150MB 客户端下载）
node scripts/prefix-dist.mjs            # 加 /docs-cn/claude-mem/ 前缀后即为 Pages 部署形态
```

注意：
- `mintlify dev` 依赖 Mintlify 云端预览服务（需账户）;匿名状态下的本地验证用 `validate`/`export`。
- `mintlify export` 会把项目根的散文件整体复制到它内部的渲染客户端 public——**导出前必须清理项目根的 dist/ 与旧 export.zip**（已写入 .gitignore；脚本链先 rm 再 export）。
- 导出产物偶发把 shiki 语法表内联进 RSC 导致 500MB+ 膨胀（0.0.3794 客户端实测），干净导出应为 ~18MB/50 页；若异常膨胀，重跑一次。

## 目录结构

```
docs.json       Mintlify 站配置（中文）
*.mdx           49 篇汉化正文（usage/、architecture/、configuration/、cursor/、grok-bot/、antigravity-cli/）
GLOSSARY.md     术语表与 Mintlify MDX 组件翻译规范（子代理注入材料）
.anchor-maps/   每篇的标题锚点映射（原英文标题 | 中文标题 | 新锚点）
scripts/        export 后处理与校验工具（verify-anchors / fix-broken-anchors / prefix-dist / smoke-serve）
```

## 校验

```bash
node scripts/verify-anchors-cn.mjs   # 全站锚点核对（dist 实际 id ↔ href 目标）
node "C:/Users/lif3n/.claude/skills/translate-docs-site/residue-check.cjs" .   # 英文残留
```

本镜像为非官方翻译，仅供学习参考；版权归原作者，遵循上游 Apache-2.0 许可。