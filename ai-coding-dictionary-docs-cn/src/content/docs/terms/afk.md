---
title: "AFK（离开键盘）"
source: "https://www.aihero.dev/ai-coding-dictionary/afk"
---

Away from keyboard（离开键盘）。用户启动一个[会话](/terms/session)后离开、留[agent](/terms/agent)无人值守运行的工作模式。[AI](/terms/ai)编码的吞吐放大器——多个 AFK 会话可以在你睡觉、吃饭或干别的时并行跑。通常需要宽松的[权限模式](/terms/permission-mode)加[沙箱](/terms/sandbox)才安全。

你不在场时，agent 对含糊处的处理不同。你看着时，一个含糊的决定浮上来变成问题，你回答它；你走开后，agent 挑一个默认值继续走，之后的每个决定都建在那个猜测上。特征性失败是：回来面对几个小时完工的、自信的工作，全部建在头十分钟一个错误的决定上。活儿不糙——它自洽，只是自洽于错误的东西。

既然运行中给不了输入，就前后给。之前：把含糊处预先解决掉——一场[追问](/terms/grilling)会话、一份写下的[规格](/terms/spec)——让 agent 独自填补的缺口更少。期间：[自动化检查](/terms/automated-check)和[自动化评审](/terms/automated-review)顶替你不在给的注意力，对机器抓得到的快速失败。之后：运行收在可评审的东西里——一个 PR，而不是已合并的改动。AFK 不取消[人工评审](/terms/human-review)；它把它全部推迟到最后，这正是最后抵达的东西必须值得评审的原因。这也是[AX](/terms/ax)在 AFK 运行里最要紧的原因——没人看着，环境是 agent 得到的唯一支持。

避免："background agent"——把重心放在机器（"在后台运行"）而非人的模式（"用户走开了"）。AFK 点名的是要紧的事实：用户没在看。

用法：

"我在 AFK 跑这个——重构上三个沙箱里的 agent，早上评审 PR。"

"[绕过权限](/terms/agent-mode)？"

"对，只读[文件系统](/terms/filesystem)，无网络。"
