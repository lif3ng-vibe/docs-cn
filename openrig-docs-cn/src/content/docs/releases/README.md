---
title: "发布说明"
---

本目录是 OpenRig 的轻量级发布历史。

它有意比单一巨型 `CHANGELOG.md` 更简单。

每个已发布的版本都有各自的说明文件：

- `v0.1.12.md`
- `v0.2.0.md`
- `v0.3.0.md`
- 依此类推

## 设立缘由

我们希望有一套实用的发布管理方式，与 OpenRig 目前的实际发布做法相契合：

- npm 包发布
- 可选的 Git 标签
- 可选的 GitHub Release
- 一份简短的、人工撰写的内容摘要

这让发布说明：

- 易于撰写
- 易于在 GitHub Releases 中链接
- 易于粘贴进公告
- 在仓库中长期留存

## 最简流程

每次发布：

1. 将 `_template.md` 复制为 `vX.Y.Z.md`。
2. 填写发布摘要、所含变更、运维注意事项、已知限制以及已执行的验证。
3. 在确切的发布切点（release cut）运行**实质门槛**（substance gate）。该门槛会
   推导出本次交付的 pack 源之下的每一个文件，验证与哈希绑定的人工判定以及
   每个机械候选项各自的处置，扫描由打包器推导出的完整 npm 工件集，并写入
   可长期留存的回执。回执同时记录工件清单与已扫描文件清单；工件清单减去
   已扫描清单的差集必须为空。审查 JSON 中每个文件对应一条条目：

   ```json
   {
     "surfaces": [{
       "path": "packages/daemon/context-packs-src/example/guide.md",
       "sha256": "<sha256 of the reviewed bytes>",
       "verdict": "ship",
       "reason": "Generic product guidance.",
       "candidateDispositions": []
     }]
   }
   ```

   先组装软件包，然后在同一个干净的工作树（worktree）中运行指定名称的门槛，
   并显式给出判定人与切点 SHA。组装过程会输出它实际暂存的实质根（substance
   roots）；门槛自身从不携带根清单。人工判定若为不交付，其取值为
   `instance-fact`、`internal-path`、`position-knowledge` 或 `lore-class`
   之一，并在同一条每文件条目中给出原因：

   ```bash
   bash scripts/build-package.sh
   npm run gate:substance -- \
     --review /path/to/substance-review.json \
     --receipt /path/to/substance-receipt.json \
     --judge <seat-or-person> \
     --cut-sha "$(git rev-parse HEAD)"
   ```

   判定缺失或过期、候选项未处置、内部实质内容、被归为 lore 类的 pack、
   完整工件扫描失败，或任何工件不在已扫描集合之中，都会拒绝本次切点。
4. 为该发布创建 git 标签：

   ```bash
   git tag vX.Y.Z
   git push origin vX.Y.Z
   ```

5. 使用同一个文件创建 GitHub Release：

   ```bash
   gh release create vX.Y.Z \
     --repo mvschwarz/openrig \
     --title "OpenRig vX.Y.Z" \
     --notes-file docs/releases/vX.Y.Z.md
   ```

6. 若 npm 包发布属于本次发布流程的一部分，则发布 npm 包。

## 撰写指南

- 优先使用面向用户的语言，而非提交日志式的语言。
- 把相关修复归入少量条目。
- 对影响操作者的变更要明确写出：安装、权限、启动状态、恢复、故障恢复以及环境注意事项。
- 内部重构一律不写，除非它们实质改变了用户行为或操作者的信心。
- 如果验证范围有限，请直说。

## 范围

本目录是发布说明的存档，而不是一套完整的历史变更分类体系。

如果 OpenRig 之后想要一份精心整理的 `CHANGELOG.md`，可以从这里的发布说明生成或汇总。
