---
title: "Token（词元）"
source: "https://www.aihero.dev/ai-coding-dictionary/token"
---

[model](/terms/model)读和写的原子单位。大致词级但不精确——常见词是一个 token，罕见或长的词拆成几个。[上下文窗口](/terms/context-window)大小、成本、延迟全以 token 计。

文本经分词器变成 token：一个固定词表，数万个片段，在[训练](/terms/training)之前学得，把任何输入切成一串词表条目。模型从不看见字符或单词——每段文本进门前被转成 token，出门时[下一 token 预测](/terms/next-token-prediction)一次吐一个 token。

经验上，一个 token 约等于四分之三个英文单词，一千 token 约 750 词。代码没那么好预测：常见关键字和惯用法分得很紧凑，而生成的标识符、哈希、base64 块、压缩产物，一个"词"拆成很多 token。规律是：在分词器源材料里频繁出现过的文本，拿到短而高效的编码；没出现过的被剁成很多小块。像 `a3f9c2e1` 这样的哈希从没在任何地方出现过，所以拆成很多 token；`function` 是一个。这就是一个看着不大、装满怪异字符串的文件，能出人意料地占掉一大块上下文窗口的原因。

Token 是衡量其余一切的计量单位。成本按 token 算——提供商对[输入 token](/terms/input-tokens)和[输出 token](/terms/output-tokens)分开计价。速度是每秒 token 数，因为输出一次生成一个。而上下文窗口是固定数量的 token，所以你文件的 token 数决定了装得下多少。

避免："word"——token 边界不按词边界走，而每秒 token 数、每美元 token 数才是真正要紧的计量。

用法：

"这个提示词大概多大？"

"过一遍分词器——schema 紧凑，但 JSON 键名怪，拆出来的 token 会比你以为的多。"
