---
title: "项目工作区契约"
---

OpenRig 的项目 TUI 是架在某个工作区根之上的文件支撑视图。文件夹形态刻意保持简单，使人类与智能体无需守护进程内部知识即可创建或修复它。

本子树是更完整的[OpenRig 实例布局](/reference/instance-layout/)的一部分。实例初始化器将这些确切的工作区字节委派给本篇文档（作为其所有者）。

## 默认形态

`rig config init-workspace` 会在 `~/.openrig/workspace` 创建默认工作区，除非 `--root` 或 `workspace.root` 指向别处。

```text
workspace/
  SPEC.md
  project.yaml
  workspace.yaml
  .gitignore
  missions/
  exhaust/
```

脚手架是增量的：它创建缺失的规范条目，且绝不覆盖既有文件，即使带上已弃用的 `--force` 标志也是如此。`exhaust/` 与本地 `.openrig/` 运行时投影被忽略；撰写的项目上下文与 mission/slice 文件保持可版本化。`workspace.yaml` 是项目位置目录。项目清单暴露空的 `install.context` 与 `install.skills` 选择器，用于有序的 Markdown 地址与稳定的托管目录技能 ID，但技能来源与 System World 都不属于这棵树。

## 项目世界安装

`project.yaml` 可以一并选择项目上下文与托管技能：

```yaml
schema: openrig.project/v0alpha1
kind: project
install:
  intent: SPEC.md
  context:
    - conventions.md
  skills:
    - repository-maintenance
```

`install.context` 包含项目相对的 Markdown 地址。`install.skills` 只包含稳定的技能身份。技能来源字节存放在唯一一个已配置的托管目录中（`skills.root`，默认 `$OPENRIG_HOME/skills`），绝不放在项目或工作区之下。`rig context work-install --runtime <claude-code|codex>` 解析这两部分；加 `--apply-skills` 可把选定的确切字节调和到调用者当前工作目录之下的 `.claude/skills/` 或 `.agents/skills/`。当接收智能体在别处工作时使用 `--cwd`；项目世界元数据根绝不被假定就是其代码工作目录。

生成的运行框架目录与 `.openrig/skill-loadouts/` 所有权回执是投影，不是源。产品仓库应当忽略它们。调和只会在某条目当前字节仍与 OpenRig 上一次拥有的投影相匹配时，才移除被取消选择的条目；无关条目与本地修改过的条目会被保留，或作为冲突上报。

同一运行时的席位通常共享一个工作目录。它们的拓扑选择器按规范席位身份各自保留，并以并集形式投影，因此启动一个角色不会移除另一个角色的技能。投影的变化只有新启动的运行框架进程才能看见；调和会上报这一边界，而不是宣称某个运行中的席位已热重载了它。

已安装的项目选择也会保留在该工作目录的所有权回执中。之后的席位启动若不带任何项目世界输入，则保留它；一次 `install.skills` 为空的显式安装则清除它。这使"项目未提供"与"项目刻意不选择任何技能"得以区分。

## TUI 项目选择

打开 **PROJECTS**（或输入 `projects`），从已配置的工作区目录中选一个 ID 与根。`project <id>` 选定确切的目录条目；随后 `mission <directory>` 打开该项目的执行视图。历史上的 `scopes` 机器区段 ID 仍然有效。项目选择及其规范根贯穿任务、切片、源文件与 Back 导航。更换目录根需要重新选择一次。缺失或畸形的来源保持不可用；另一个项目中匹配的工作 ID 绝不作为回退。

`source` 通过既有的文件读取允许列表打开当前项目、任务或切片的实际源。进入目录不授予文件读取或执行权限。这些视图只读；它们不选择生命周期操作，也不激活任务。执行与切片队列归属要求一个确切的 `project:<id>` 标签；生命周期实例使用其撰写的项目身份。未加 scope 的历史队列行与无项目绑定的全局评审工件，被排除在项目特定的认领之外。

读取 API 为 scopes、执行与切片详情读取新增了 `GET /api/scopes/projects` 与可选的 `project`、`projectRoot` 参数。切片详情还要求选定的任务目录。不带 project 参数的既有读取保持其旧契约。

## UI 映射

- `workspace.root` 映射到项目工作区。
- `workspace.catalog_path` 映射到 `workspace.yaml` 项目目录。
- `workspace.projects_root` 是已编目项目世界的默认归宿。
- `workspace.root/missions/<mission-id>` 映射到一个项目任务。
- `workspace.root/missions/<mission-id>/slices/<slice-id>` 映射到一个项目切片。
- 当文件根在允许列表内时，任务 `PROGRESS.md` frontmatter 提供任务状态徽章。
- 任务与切片的 `SPEC.md` frontmatter 提供意图、咨询性的同侪构建顺序 `depends_on`、生命周期状态与队列关联提示。
- 切片 `PROGRESS.md` 是持久的验收清单；`PROOF.md` 与 `proof/` 保留与 SPEC 证明契约配对的证据。

任务与切片 id 应当是稳定的 kebab-case 字符串。让切片 id 在工作区内保持唯一，`/project/slice/<slice-id>` 才能无歧义地解析。

## 队列映射

队列条目在其正文或标签提到下列之一时挂接到切片：

- 切片 id；
- 任务 id；
- 切片 frontmatter 中的旧 `rail-item` 值。

新工作请在队列条目正文或标签中同时包含任务 id 与切片 id。示例：

```text
Mission: idea-ledger
Slice: capture-product-ideas
```

这让 Story、Queue、Tests 与 Topology 标签页与文件系统切片对齐，而无需另加一个项目数据库模式。

## 兼容性

默认发现根是 `workspace.slices_root=<workspace.root>/missions`。切片索引器也支持旧式扁平根，例如 `workspace.slices_root=<workspace.root>/slices`，其中每个直接子文件夹是一个切片。扁平根仍可读取，但感知任务的形态是默认的安装契约。

## 修复清单

若项目界面显示任务发现警告：

1. 运行 `rig config get workspace.root --show-source`。
2. 运行 `rig config get workspace.catalog_path --show-source`。
3. 运行 `rig config get workspace.slices_root --show-source`。
4. 确认 `workspace.slices_root` 指向一个包含任务目录（其下有 `slices/` 子目录）的文件夹。
5. 确认 `files.allowlist` 包含 `workspace:<workspace.root>`，TUI 才能读取任务 `PROGRESS.md`。
6. 若工作区缺失，在获得操作员批准后运行 `rig config init-workspace`。

大多数配置读取无需重启守护进程。更改启动时读取的根（如 `files.allowlist` 或进度扫描根）时才需要重启。
