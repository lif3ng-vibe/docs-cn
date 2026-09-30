---
title: "重聚焦通道"
---

**定向内容如何抵达一个运行中的席位**。编辑文件不等于投递：运行中的席位在会话开始时读取了它的配置，其上下文里没有任何东西会自行重读磁盘。重聚焦通道（refocus channel）补上这个缺口——正是它让随发行交付的链条文件（见 `chain-file-convention.md`）成为活的信条，而不是启动时的装饰。

## 机制

`openrig-core` 附带 `hooks/scripts/refocus.cjs`，在两个运行时上都已注册：

| 事件 | Claude Code | Codex | 原因 |
|---|---|---|---|
| UserPromptSubmit | ✓ | ✓ | 在模型可见的边界投递到期或按需的上下文 |
| Stop | ✓ | — | 捕捉跨越增长阈值的超长 Claude 回合 |
| PostCompact | ✓ | ✓ | 保留确切的压缩到期状态；在下一条提示时投递 |

Claude 额外的触发信号是**会话记录增长**——不是回合数（一个回合可以跨五十次工具调用烧掉 200k token），也不是挂钟时间（失败在于持续工作，不在于流逝的时间）。默认阈值约为 2.6MB 的 JSONL 增长（≈300k token）；用 `OPENRIG_REFOCUS_BYTES` 调节。Codex 从不使用该阈值：它精确的 `PostCompact` 生命周期钩子就是触发器，从而避免围绕 Codex 自身压缩节奏的多余二次触发。设 `OPENRIG_REFOCUS_NOW=1` 可按需重聚焦，设 `OPENRIG_REFOCUS_ENABLED=0` 可禁用该特性。全新的 `SessionStart` 永远是无操作：默认上手包掌管全新定向。两个运行时都为下一条提示保留 `PostCompact` 到期状态。除此之外，该钩子是无声的无操作，遇到无关的钩子错误时也降级为沉默。而已配置 REF 的解析失败则会以高声方式降级——在投递的载荷里显著标出——同时钩子仍然完成：重聚焦绝不能打断一个席位的回合。

由于钩子运行在席位自己的回合边界上，向运行中的席位投递无需重启、无需操作员动作、也无需消息往来：席位处理的下一条提示就携带着内容。延迟上界是"席位的下一个回合"——这本也是新定向最早能被付诸行动的时刻。

## 内容可配置——且在源头绝不绑定具体项目

解析顺序：

1. `OPENRIG_REFOCUS_CONTENT_REF`——一个路径式的上下文库 ref，经 `rig context get` 解析，重聚焦因此收到与按需拉取完全相同的组装字节。REF 与 FILE 同时设置时以此为准。
2. `OPENRIG_REFOCUS_CONTENT_FILE`——操作员撰写的文件（按席位或按 rig，经 spec env）。
3. `$OPENRIG_HOME/refocus/REFOCUS.md`——实例的常备内容。
4. `skills/refocusing/references/refocus.md` 处的通用默认：三个项目中立的定向问题、阶梯本身，以及指向单独交付的上手资产的指针。

钩子会在投递的载荷中点名已解析的 REF。若 REF 解析失败，载荷以 `REFOCUS CONTENT REF FAILED`、确切的 ref 与解析器的理由开头，然后继续通用定向。因此坏掉的 ref 保持可见，又不会阻塞席位的会话边界。REF 未设置时，既有的 FILE 与通用路径保持不变。

任务、项目或 box 特定的重聚焦文本，属于上下文库条目，或需要它的那个实例上的上述某个 FILE。**它绝不能提交进产品源码**——随发行交付的默认内容不带任何不具普遍适用性的路径、席位名、任务或做法。

每次投递的重聚焦都把内容与公开的 `refocusing` 技能的仅路径（path-only）踪迹配对。配置 `OPENRIG_REFOCUS_TREES=topology|work|both` 与 `OPENRIG_REFOCUS_DEPTH=light|full`；可选的 `OPENRIG_REFOCUS_TOPOLOGY_NODE` 与 `OPENRIG_REFOCUS_WORK_NODE` 选择无法推导出的起点。脚本经由活配置解析 `topology.root` 与 `workspace.root`，把断链报告为缺口，而不是顺着指针走。

这条自动钩子路径是对经 `rig send --context` 的一次性手动注入的补充；两种模式互不替代。

## 与链条文件的关系

链条文件是定向内容持久、按高度寻址的归宿；重聚焦通道是它的投递时间表。今天加入某个 rig 的 `CRAFT.md` 的一条做法，会经运行中席位的下一次重聚焦指针抵达他们，未来的安装则经随发行交付的默认值（discovery → curation → ship，依约定文档）抵达。

## 重聚焦不是什么

重聚焦纠正漂移；它不是唤醒（wake）（后者恢复活跃性，且不得重述工作框架），也不是检查点（一次有意的阶段边界暂停）。该发轻干预时发了重干预，是最常见的自找停顿——钩子自动触发的是轻的那个，这正是要点所在。
