---
title: LiteLLM Core
sidebar_label: LiteLLM Core
description: 安装默认依赖更少的 LiteLLM SDK，并按需添加 AWS 与 Python 分词器软件包
---

# LiteLLM Core

`litellm-core` 将 LiteLLM Python SDK 打包成必需依赖更少的发行版，并且不附带内置的仪表板（dashboard）和网关 CLI 入口。它使用的 SDK 源码与 `litellm` 发行版相同，Python 命名空间同样是 `litellm`

## 选择安装包

| 软件包 | 适用场景 |
| --- | --- |
| `litellm-core` | 应用直接调用 SDK，希望仅在需要时才安装 AWS 与 Python Hugging Face 分词器依赖 |
| `litellm` | 需要现有发行版、它的默认依赖以及受支持的可选安装组（extras） |

如果要部署网关，请参阅[网关快速上手](https://docs.litellm.ai/docs/proxy/docker_quick_start)。Core 不提供 `litellm` 命令，也不内置管理界面（Admin UI）

## 安装

在一个全新的虚拟环境中安装 core：

```bash
python -m venv .venv
source .venv/bin/activate
python -m pip install litellm-core
```

在 Windows 上，请改用 `.venv\Scripts\activate` 激活环境

Python 导入仍然使用 `litellm`，`from litellm import completion`、`from litellm import Router` 这类导入语句完全不受影响。发行版名称是 `litellm-core`，公开的导入命名空间没有任何变化

:::warning 每个环境只安装一个发行版

`litellm` 与 `litellm-core` 安装的文件相互重叠。在同一环境中同时安装两者会导致 `import litellm` 失败，即便版本完全一致也无济于事

把应用迁移到 core 时，请在依赖声明中把 `litellm` 替换为 `litellm-core`，并在全新环境中重新生成锁文件。如果还有其他依赖要求 `litellm`，请先解决这一依赖，再执行切换

:::

## SDK 功能

Core 保留了提供商（provider）请求与响应转换、同步与异步补全、流式输出、嵌入（embedding）、Token 计数、模型元数据和成本计算等能力。共享 SDK 同样内置 Router、重试、回退机制（fallbacks）以及提供商错误映射

这种包拆分方式保留了更完整的 SDK API 面，涵盖 Responses、图像、音频与批处理操作。各端点支持的模型与提供商仍有差异，个别集成可能需要额外安装软件包。详见[支持的端点](https://docs.litellm.ai/docs/supported_endpoints)与相关[提供商指南](https://docs.litellm.ai/docs/providers)

## 可选依赖

Core 从必需依赖中移除了 `boto3`、`tokenizers` 和 `huggingface-hub`。它直接声明了 `python-dateutil`，并继续依赖 `jsonschema`、`tiktoken` 等软件包

可选软件包请直接安装。Core 目前没有声明 `litellm-core[aws]`、`litellm-core[tokenizers]` 这类可选安装组（extras）

### AWS 操作

安装 `boto3`，用于 AWS 凭证解析、SigV4 签名和 AWS 事件流解码：

```bash
python -m pip install boto3
```

这一步会顺带安装 `botocore`。依赖 AWS 的功能包括带签名的 Bedrock 请求、SageMaker、Polly，以及 Secrets Manager、S3 日志这类 AWS 集成

在不装 `botocore` 的情况下，Bedrock Bearer Token 请求的准备工作也能完成。但解码 AWS 事件流的流式路径仍然需要它，所以仅凭 Bearer 认证并不能让所有 Bedrock 操作都脱离 AWS 软件包

### Python Hugging Face 分词器

当应用用到相关路径时，安装 Python 分词器软件包：

```bash
python -m pip install tokenizers huggingface-hub
```

Core 保留了自己的原生分词器实现和 `tiktoken` 依赖。Token 计数并非一律需要这些可选的 Python Hugging Face 软件包。当 Token 计数退回近似估算时，LiteLLM 会发出警告，请把该结果当作估算值看待

缺失的可选依赖会在真正执行所需操作时报出，并附有安装指引

## 安装体积

在相同的源码构建对比中，`litellm-core` 的安装体积减少了 **32.2%**，含运行时依赖在内约节省 **65.6 MB**

两次构建都用的是 `1.106.0` 版本，共享依赖版本一致，并在同一台 Linux 机器和同一个 Python 解释器上完成。测量范围是无可选 extras 的默认安装，不包含生成的字节码和常用工具。源码构建基线为 [`5d207d85`](https://github.com/BerriAI/litellm/commit/5d207d85ee547bc323d704bc6aaab901aa0be8b6)，core 为 [`029a626c`](https://github.com/BerriAI/litellm/commit/029a626c99ec8c6012512b18ecea075a90db9dcd)

## 与 litellm 的关系

目前，`litellm-core` 与 `litellm` 是基于同一份源码构建、独立打包的两个发行版。安装或升级 `litellm` 仍使用它现有的依赖集合

规划中的架构是让 `litellm-core` 充当共享的 SDK 依赖，由 `litellm` 对其封装。这一关系尚未实现：`litellm` 目前并不依赖 `litellm-core`。请继续在每个环境中只选一个发行版，无论安装哪个包，Python 导入命名空间都是 `litellm`
