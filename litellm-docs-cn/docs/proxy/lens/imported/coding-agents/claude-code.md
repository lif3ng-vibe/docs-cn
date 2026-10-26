---
title: "Claude Code"
description: "使用官方维护的配置指南，将个人 Claude Code 会话接入 LiteLLM Lens。"
slug: "/proxy/lens/coding-agents/claude-code"
sidebar_label: "Claude Code"
custom_edit_url: "https://github.com/BerriAI/litellm-lens-example/edit/main/claude-code/README.md"
mdx:
  format: md
---

<!-- Generated from BerriAI/litellm-lens-example/claude-code/README.md at a2294277609202247b71c08d7b491f5212809988. Edit the source README. -->

# Claude Code

如果想让编程代理代为操作，可以使用[帮我配置](https://github.com/BerriAI/lens/blob/main/docs/setup-with-agent.md#connect-an-agent-to-lens-already-running)。它会保留你现有的模型连接，并在配置完成后验证一条真实的追踪记录。

把你的个人 Claude Code 会话发送到 [LiteLLM Lens](/docs/proxy/lens)。本目录链接到官方维护的集成说明。

## 前提条件

你需要准备好 Claude Code、一套正在运行的 [Lens 安装](https://github.com/BerriAI/lens/blob/main/deploy/lens/README.md)，以及一个专用的 Lens 追踪密钥。Lens 仅靠 ClickHouse 即可运行；编程代理现有的模型登录状态与提供商保持原样即可。

## 配置

追踪端点与密钥的设置方法，参见 [Lens 编程代理配置指南](/docs/proxy/lens/coding-agents)。集成的具体配置与支持的遥测数据，参见 [Claude Code 监控指南](https://code.claude.com/docs/en/monitoring-usage)。

## 验证追踪记录

完成一轮新的会话对话，然后在独立版或嵌入版 Lens UI 中打开 **Lens > Traces**。用集成配置的代理名称找到该会话，即可查看其中记录的活动。

## 故障排查

如果找不到会话，请检查配置指南中关于记录与导出的说明、Lens 摄取 URL 以及密钥。支持的活动类型与平台要求，请查阅官方维护的集成文档。
