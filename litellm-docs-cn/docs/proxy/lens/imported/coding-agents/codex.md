---
title: "Codex"
description: "使用官方维护的配置指南，将个人 Codex 会话接入 LiteLLM Lens。"
slug: "/proxy/lens/coding-agents/codex"
sidebar_label: "Codex"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/codex/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/codex/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Codex

如果想让自己的编码代理帮忙，可以使用 [代我配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。这种方式会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录

把你的个人 Codex 会话发送到 [LiteLLM Lens](/docs/proxy/lens)。本目录链接到官方维护的集成说明。

## 前置条件

你需要准备好 Codex、一个正在运行的 [Lens 安装](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)，以及一把专用的 Lens 追踪密钥。Lens 仅靠 ClickHouse 即可运行；编码代理原有的模型登录与提供商保持不变

## 配置

追踪端点与密钥的说明请参阅 [Lens 编码代理配置指南](/docs/proxy/lens/coding-agents)。集成的配置方式与支持的遥测数据见 [LiteLLM Lens Codex 集成](https://github.com/BerriAI/litellm-lens-codex-integration)。

## 验证追踪记录

新开一轮会话对话，然后在独立版或嵌入版 Lens UI 中打开 **Lens > Traces**。用集成所配置的代理名称找到该会话，查看其中记录的活动。

## 故障排查

如果找不到会话，请检查配置指南中关于记录与导出的说明、Lens 的采集 URL 以及密钥是否正确。具体支持哪些活动、有哪些平台要求，可查阅官方维护的集成文档。
