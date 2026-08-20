---
title: "Model provider（模型提供商）"
source: "https://www.aihero.dev/ai-coding-dictionary/model-provider"
---

为[推理](/terms/inference)提供[model](/terms/model)服务的任何一方。通常是远程服务（Anthropic、OpenAI、Google），也可以是本地的——跑在你自己机器上的 Ollama、LM Studio、llama.cpp。[harness](/terms/harness)自己不跑模型；它请提供商跑。

提供商拥有机器：[参数](/terms/parameters)住在它的硬件上，每次[模型提供商请求](/terms/model-provider-request)都是 harness 经网络送出[token](/terms/token)、换回预测。这让提供商成了一整类问题的源头——限流、降容、宕机都住在这里——而这类问题常被错记在模型或 harness 头上。[agent](/terms/agent)在[会话](/terms/session)中途停摆、或每个[turn](/terms/turn)都报错时，先看提供商状态页，再看别的。

提供商也定商业条款：[输入](/terms/input-tokens)与[输出 token](/terms/output-tokens)的单价、[前缀缓存](/terms/prefix-cache)折扣、以及到底有哪些模型可用。注意提供商和模型的制造者可以是不同的公司——Bedrock、Vertex、OpenRouter 服务的是别人家的模型。

本地提供商用能力换控制：塞得进你自家硬件的模型远小于前沿模型，但什么都不出机器，也没有按 token 的账单。

用法：

"能给隔离网络的客户离线跑这个吗？"

"把模型提供商换成本地的——在他们机器上跑 Ollama 或 llama.cpp。harness 不在乎，它只是打另一个端点。"
