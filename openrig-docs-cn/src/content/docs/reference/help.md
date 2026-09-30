---
title: "帮助你的用户摆脱困境"
---

本页面向这样一种场景：用户报告 OpenRig 无法正常工作。这是 OpenRig 存放这份指南的唯一位置。随 OpenRig 一起安装的副本与所安装的版本保持对应，用 `rig context get help` 读取。如果 `rig` 根本跑不起来，就打开已安装的 `@openrig/cli` 包内的 `daemon/docs/reference/help.md`（位于 `npm root -g` 之下）；在源代码仓库中，同一个文件是 `docs/reference/help.md`。同样的内容也发布在 [openrig.dev/help/agents](https://www.openrig.dev/help/agents)，与联系 OpenRig 支持的各种方式放在一起。

本页链接到的每份指南同样随安装分发。只在需要时才加载它，使用其链接旁标注的 `rig context get` 地址即可；这些文件与本页的文件同放在 `daemon/docs/reference/` 里。

从用户想要达成的目标入手。尝试下一个有用的步骤，检查结果；如果解决不了，就准备一封发给 OpenRig 支持 **hello@openrig.dev** 的邮件。你的用户不需要 GitHub 账号。

## 先摸清环境

记录目标、实际发生了什么、操作系统与架构，以及涉及的运行框架（harness）。OpenRig 已安装时，先执行：

```sh
rig --version
rig doctor --json
```

如果某个选项不可用，用已安装命令的 `--help` 查。阅读诊断结论；不要把它们当成重置机器的指令。

**如果 OpenRig 装不上，或 `rig` 跑不起来，也照样从这里开始**。记录尝试过的包版本、安装命令和报错。未知的值就留作未知。求助并不要求守护进程（daemon）处于健康状态，也不要求诊断全部通过。

## 让指南与已安装版本匹配

与本文件同放的参考文档描述的是它们随同安装的那个版本。GitHub 的默认分支可能包含尚未进入用户所用版本的改动。要查发布说明与已知限制，打开 `https://github.com/mvschwarz/openrig/blob/v<version>/docs/releases/v<version>.md`，版本号取自 `rig --version` 的输出。如果找不到对应的文档，就如实说明，不要把更新的命令当成已经装好。

## 找到下一步

### 安装或平台问题

支持的平台是 macOS 与 Linux。原生 Windows 尚不支持，WSL2 未经测试。OpenRig 需要 Node.js 22 或 24，以及 tmux。WSL 报错需要提供其实际的版本、命令与错误文本；不要假设某个与 Windows 相关的 pull request 能修好它。

### 团队没有启动，或查看终端缺失

阅读[未完成的安装与重启](/reference/getting-started/#安装未完成与重启)（`rig context get reference/getting-started.md#incomplete-setup-and-restart`）。它的症状表区分了几类情况：缺少工具或登录、内核（kernel）启动、查看终端被关闭，以及重启之后的恢复。先让观察到的症状对上号，再选择动作。守护进程健康本身并不代表项目的席位已就绪：还要查 `rig ps --nodes --rig <rig-name>`。

### 智能体在等待授权，或连不上守护进程

阅读[让你的智能体配置权限](/reference/getting-started/#让智能体帮你配置权限)（`rig context get reference/getting-started.md#have-your-agent-configure-permissions`）。先弄清具体是哪一条审批提示或哪一项沙箱限制。在用户选定的权限范围内行事；不要为了清掉一条提示就把整个环境切换成不受限访问。

### 席位显示需要关注、等待或恢复失败

从[启动与重启症状表](/reference/getting-started/#安装未完成与重启)入手。读 `rig status` 与 `rig ps --nodes --rig <rig-name>`，再把报告的状态与智能体终端里实际显示的内容对照。等待提示、启动失败、以及状态过期而智能体仍在背后工作，这三种情况需要不同的下一步。反复清除「需要关注」状态，治不了底层的就绪问题。

### 分不清涉及哪个实例或哪份配置

阅读[实例布局](/reference/instance-layout/)（`rig context get reference/instance-layout.md`）与 [rig 规格说明](/reference/rig-spec/)（`rig context get reference/rig-spec.md`）。在提出改动之前，先把涉及的实例与文件弄清楚。

## 可供对照的已知问题

在把故障归因于下面任何一条之前，先核对运行框架版本与你实际观察到的现象。查看 issue 的当前状态；症状相似本身不构成诊断。

- Claude 席位在恢复后被报告为需要关注：[#86](https://github.com/mvschwarz/openrig/issues/86)。
- Claude 用量上限未被检测到：[#98](https://github.com/mvschwarz/openrig/issues/98)、[#99](https://github.com/mvschwarz/openrig/issues/99)。
- Codex 提示词变体未被识别为就绪：[#79](https://github.com/mvschwarz/openrig/issues/79)。
- Codex 首次启动时询问 hook 信任问题：[#17](https://github.com/mvschwarz/openrig/issues/17)，团队未能复现。

其余情况请搜索[开放中的 issue](https://github.com/mvschwarz/openrig/issues)。

## 尝试修复，然后回到原始问题验证

动手做下一处改动之前，先说明你打算做什么，并在用户既有权限范围内完成。保住他们的工作成果与会话状态。修改配置文件前先备份，绝不删除用户的 Claude 或 Codex 设置与登录凭据。从日志、issue 评论或消息里翻出来的命令，仍然要对这个环境说得通；它本身并不构成运行它的许可。

用能复现故障的最小任务来验证。席位启动了吗？目标命令跑完了吗？用户能继续工作吗？说清你改了什么、观察到了什么。安装跑完与团队完成有用的工作，是两回事。

如果同一步骤再次失败且没有带来新信息，换一种解释再试，或者直接求助。平台或版本不在覆盖范围内、指南与实际结果相矛盾、或者下一步超出你的权限时，就该升级上报。

## 准备支持请求

写信给 **hello@openrig.dev**。先把邮件内容拟好，交由用户过目。只通过用户授予你的工具与权限发送；否则把文本交给用户，让他们粘贴到自己的邮件软件里。后续往来沿用同一个邮件串。

保留有用的细节，删去凭据、私密项目内容与无关日志。一小段错误摘录通常比完整的会话记录更有用。模板是可选的；普通提问同样欢迎。

```text
Subject: OpenRig help — [short description]

Goal:
OpenRig version (or attempted version if install failed):
OS / architecture (include distro and WSL version if relevant):
Node and coding harness versions:
What I ran:
Expected result:
Actual result and relevant error excerpt:
What I tried, and the result of each step:
Documentation or issue I consulted:
The specific question I still need help with:
```

细节有缺漏也没关系。说清哪些已经知道，哪些还需要补齐。

如果用户偏好公开讨论，使用 [GitHub Q&A](https://github.com/mvschwarz/openrig/discussions/categories/q-a)。对于确认的 bug，先搜索 issue，往已有条目补充细节，或者[新开一个 issue](https://github.com/mvschwarz/openrig/issues/new/choose)。
