---
title: "Training（训练）"
source: "https://www.aihero.dev/ai-coding-dictionary/training"
---

设定[model](/terms/model)的[参数](/terms/parameters)的过程：把海量文本暴露给它，调整参数以改进[下一 token 预测](/terms/next-token-prediction)。一次性的、昂贵的过程，由[模型提供商](/terms/model-provider)完成。既涵盖预训练（主体那一大轮）也涵盖后训练（指令遵循、安全等后续打磨）；这个区分在本词典的层面不重要。

机制是规模化的重复：给模型看一段文本，让它预测下一个[token](/terms/token)，把参数朝实际的下一个 token 的方向推一点，然后在数万亿 token 上重复。没有任何东西以事实或规则的形式被存储——模型"知道"的一切，是预测变好这个过程的副产品，压缩进参数里成为[参数化知识](/terms/parametric-knowledge)。

两个后果日日要紧。训练止于某个时点，所以模型有[知识截止点](/terms/knowledge-cutoff)——它没见过你上个月升级到的那个库版本。而训练不是你能做的事：当模型不知道你的代码库、你的约定、你的内部 API 时，解法从来不是"教模型"——而是把材料放进[上下文](/terms/context)，那才是你控制的输入。

用法：

"能让它知道我们的内部 API 吗？"

"靠训练不行——那是模型提供商数月量级的工程。把 API 文档加载进上下文，那才是你手里真实的杠杆。"
