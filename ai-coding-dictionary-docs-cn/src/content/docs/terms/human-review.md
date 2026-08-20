---
title: "Human review（人工评审）"
source: "https://www.aihero.dev/ai-coding-dictionary/human-review"
---

用户阅读[agent](/terms/agent)产出的代码并对其形成判断。读 diff 或改动过的文件算；读 agent 对它所作所为的_描述_不算——叙述不是产物。描述是[二手来源](/terms/secondary-source)，出自被评审一方之手；diff 是[一手来源](/terms/primary-source)，评审的意思就是读它。

agent 抬高了代码产量，评审成了瓶颈。一个有用的思路是分层配不同的评审策略。[自动化检查](/terms/automated-check)抓机械性失败，[自动化评审](/terms/automated-review)抓可描述的，人工评审留给只有你能判断的——这个改动是不是对的改动、方案合不合这个代码库、这东西到底该不该存在。

评审也越早越便宜。开工前读一份计划、飞行途中读一个小 diff，花几分钟；[AFK](/terms/afk)运行后开挖一条完工的分支，花得更久。评审检查点放哪，是一个[人在回路](/terms/human-in-the-loop)决策，不是事后想法。

避免：光说"code review"——人工还是自动，含糊。

用法：

"我对 AFK 产出做了人工评审。"

"你读了 diff 还是只读了摘要？"

"diff。摘要说它删了死代码——结果那函数被一个生成的文件调用着。"
