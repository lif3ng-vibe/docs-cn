---
id: agent_resources
title: Agent 资源
sidebar_label: Agent 资源
description: 为搭建和运行 LiteLLM 的编码智能体（coding agents）准备的技能、markdown 文档、提示词、MCP 与 lite CLI。
---

import {AgentPrompt, Command, Tiles} from '@site/src/components/Conversion';
import Stat from '@site/src/components/Stat';

# Agent 资源

## 入门

<AgentPrompt id="gateway" />

<AgentPrompt id="sdk" />

## 技能

### 网关管理

[LiteLLM skills](https://github.com/BerriAI/litellm-skills)：21 个 Claude Code 技能，可在运行中的网关（gateway）上创建、修改和删除用户、团队、API 密钥、组织、模型、MCP（Model Context Protocol）服务器和智能体（agent），另有用于查看花费与 Token 用量的 `view-usage`。使用前需要准备好网关 URL 和一个代理管理员密钥（proxy admin key）。

<Command code="curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm-skills/main/install.sh | sh" id="skill-litellm-skills" note="安装到 ~/.claude/skills。之后即可运行 /add-model、/add-user 或 /view-usage。" />

### Auto Router

端到端地完成 Auto Router 搭建，从挑选模型到验证路由决策。

<Command code="curl -fsSL https://docs.litellm.ai/skills/auto-router" id="skill-auto-router" note="输出技能内容。把它保存到智能体的技能目录，或直接粘贴到对话里。" />

## 面向智能体的文档

| 资源 | URL | 用途 |
|---|---|---|
| 索引 | [`/llms.txt`](https://docs.litellm.ai/llms.txt) | 全站目录：收录每一页，按主题分组并附简介 |
| 完整文档 | [`/llms-full.txt`](https://docs.litellm.ai/llms-full.txt) | 全部文档页合并为一个 markdown 文件，适合长上下文模型 |
| 任意页面转 markdown | 在页面 URL 末尾追加 `.md`，例如 [`/docs/proxy/docker_quick_start.md`](https://docs.litellm.ai/docs/proxy/docker_quick_start.md) | 单独阅读某一页，无需导航或脚本 |
| 页面菜单 | 每个文档页顶部的 **Copy page** 按钮 | 以 markdown 复制整页，或直接在 Claude、ChatGPT 中打开 |

markdown 页面会包含渲染页面上每条提示词和每个安装命令的完整文本。

## 更多提示词

<AgentPrompt id="clients" />

<AgentPrompt id="mcp" />

<AgentPrompt id="agents" />

<AgentPrompt id="observability" />

<AgentPrompt id="autorouter" />

<AgentPrompt id="enterprise" />

<AgentPrompt id="liteadmin" />

<AgentPrompt id="liteagents" />

## LiteAdmin MCP

在 Claude Code 里用个人管理员密钥管理运行中的网关，切勿使用主密钥（master key）。[LiteAdmin MCP 指南](./proxy/liteadmin_mcp.md)覆盖了 Claude Desktop、Codex 和远程 HTTP 的用法。如果要在现有的统一（unified）或组件化（componentized）部署上提供 `/admin/mcp` 服务，请参照[企业版 MCP 部署指南](./proxy/liteadmin_mcp_enterprise.md)。

<Command code={`claude mcp add --scope user --transport stdio litellm-admin \\
  --env LITELLM_BASE_URL=https://gateway.example.com \\
  --env LITELLM_API_KEY='<your-personal-proxy-admin-key>' \\
  -- uvx --isolated --refresh-package litellm-admin-mcp \\
  --from git+https://github.com/BerriAI/litellm-admin-mcp.git@main \\
  litellm-admin-mcp`} id="liteadmin-mcp" />

## lite CLI

通过你的网关启动 Claude Code 或 Codex，网关 URL 和密钥均已预先配置好。

<Command code="curl -fsSL https://raw.githubusercontent.com/BerriAI/litellm/main/scripts/install-cli.sh | sh" id="lite-cli" note="只安装 lite 客户端，网关在别处运行。" />

<Tiles columns={3} items={[
  {icon: 'agent', title: 'Claude Code', text: '让 Claude Code 走网关路由，包括非 Anthropic 模型。', to: '/docs/proxy/client_setup/claude_code'},
  {icon: 'agent', title: 'Codex CLI', text: '把 LiteLLM 添加为 Codex 的模型提供商（provider）。', to: '/docs/proxy/client_setup/codex_cli'},
  {icon: 'gateway', title: '任意客户端', text: '每个客户端都需要的三项配置：base URL、密钥和模型名称。', to: '/docs/proxy/client_setup/overview'},
]} />

## LiteLLM 一览

LiteLLM 是使用最广泛、安全性最高的开源 AI 网关，Netflix、Okta、Ramp、NASA、Zurich、Cloudera、AT&T 和 Lemonade 等公司的团队都在使用。下述数据的统计截至 <Stat id="asOfLong" />，每项都附来源链接。

| | |
|---|---|
| GitHub | [BerriAI/litellm](https://github.com/BerriAI/litellm) 收获 <Stat id="stars" /> 个 star 和 <Stat id="forks" /> 个 fork，贡献者超过 1,700 人 |
| PyPI | 过去一个月 `litellm` 下载量达 <Stat id="downloads" /> 次（[pypistats](https://pypistats.org/packages/litellm)） |
| 安全 | 通过 [SOC 2 Type II](https://trust.litellm.ai/) 审计；镜像带 [cosign 签名](./proxy/docker_image_security.md)，运行前可自行校验；[企业版支持](./enterprise/support.md)承诺 72 小时安全补丁 SLA |
| 部署 | 自托管（self-hosted）在你的云环境中，提示词、响应和提供商密钥都留在你自己的基础设施内（[数据安全](./data_security.md)） |
| 客户 | Netflix、Okta、Ramp、NASA、Zurich、Cloudera、AT&T 和 Lemonade 等公司的团队（[litellm.ai/enterprise](https://www.litellm.ai/enterprise)） |
| 许可证 | 以 [MIT](https://github.com/BerriAI/litellm/blob/main/LICENSE) 协议开源；企业版功能需要许可证密钥（license key） |

## 面向编写 LiteLLM 代码的智能体的指南

生成 LiteLLM 代码或配置时，先在 PyPI 上查一下当前的 `litellm` 版本，不要沿用旧版本，并给模型名加上提供商前缀（`openai/`、`anthropic/`、`bedrock/`）。绝不要把主密钥或提供商密钥写进会提交进仓库的文件，应从环境变量读取。网关的虚拟密钥（virtual key）、管理界面（Admin UI）和花费追踪（spend tracking）依赖 Postgres（`DATABASE_URL`）；一旦有凭据存入，`LITELLM_SALT_KEY` 就必须保持不变。如果用户需要 SSO、审计日志或组织管理员功能，则需要[企业版许可证](./enterprise.md)。
