---
title: "面向编码代理的 Tailscale skill"
description: "安装 Tailscale skill，让编码代理能够处理 Tailscale 配置和代码。"
---

最后验证于 Jul 24, 2026

> **注意：** Tailscale skill 目前处于 alpha 阶段。

Tailscale skill 为编码代理提供 Tailscale 参考资料，使其能够帮你配置 [tailnet][docs-tailnet]，并构建使用 Tailscale 的应用。你无需在每次请求时把文档粘贴到代理的上下文中，只需安装一次 skill，当请求涉及 Tailscale 时，代理就会调用它。

该 skill 遵循 Agent Skills 标准，因此可与 Claude Code、Cursor、OpenCode、OpenAI Codex、Pi 以及其他支持该标准的代理配合使用。它涵盖核心连接功能、连接诊断、文件共享、容器与 Kubernetes、企业部署、会话录制、[Aperture][docs-aperture]、Tailscale CLI、Tailscale API，以及基于 [`tsnet`][docs-tsnet] 的 Go 应用开发。

> **警告：**
>
> Tailscale skill 是 alpha 版本，不受官方支持。请将代理生成的内容视为起点而非最终配置。在应用到生产 tailnet 之前，请对照本文档核实命令、策略语法和配置值。

## 用例

当你想让代理实际操作 Tailscale 而不是向你解释它时，该 skill 就能派上用场。常见用例包括：

* **配置 tailnet 功能**：设置[出口节点][docs-exit-nodes]、[子网路由器][docs-subnet-routers]或 [Tailscale SSH][docs-tailscale-ssh]，无需在编辑器和文档之间来回切换。
* **起草策略更改**：起草 [tailnet 策略文件][docs-tailnet-policy-file]中的授权、标签和测试，供后续审阅。
* **基于 Tailscale 构建**：编写使用 `tsnet` 嵌入 Tailscale 的 Go 应用，或调用 [Tailscale API][docs-api] 的脚本。
* **在容器中部署**：配置 [Kubernetes Operator][docs-k8s-operator]，或在[容器][docs-containers]中运行 Tailscale。
* **诊断连接**：当连接表现异常时，解读 `tailscale status` 和 `tailscale netcheck` 的输出。

## 前提条件

安装 skill 之前，请确保你已具备：

* 一个支持 Agent Skills 标准的编码代理，例如 Claude Code、Cursor、OpenCode、OpenAI Codex 或 Pi。
* 已安装 Node.js，它会提供用于安装 skill 的 `npx` 命令。

## 开始使用

从其代码仓库安装 skill：

```shell
npx skills add https://github.com/tailscale/tailscale-skill
```

该命令会将 skill 安装到你代理的 skills 目录中。如果代理没有自动加载新 skill，请重启代理。

如果你不想使用 `skills` 命令，也可以手动安装 skill。该仓库将 skill 存放在 `skills/tailscale` 子目录中，因此先克隆仓库，再将该子目录复制到你代理的 skills 目录中。以下示例使用 Claude Code 的目录。如果你使用其他代理，请相应更改目标目录：

```shell
git clone https://github.com/tailscale/tailscale-skill.git
cp -r tailscale-skill/skills/tailscale ~/.claude/skills/tailscale
```

请复制 `skills/tailscale` 目录本身，而不是仓库根目录。代理通过读取其 skills 目录中某个目录顶层的 `SKILL.md` 文件来发现 skill，而仓库根目录没有这个文件。

手动安装的 skill 需要由你自己负责保持更新。拉取仓库并重新复制该目录，即可获取变更。

安装 skill 后，你可以通过两种方式调用它：

* **显式调用**：在请求开头加上 `/tailscale`。代理会为该请求加载此 skill。
* **隐式调用**：在对话中提出有关 Tailscale 的问题。代理是否会加载该 skill 因代理和请求而异。

当你想确保代理使用该 skill 时，请使用显式方式。

### 示例提示

以下提示展示了该 skill 支持的工作类型。

在正在操作的设备上配置功能：

```
/tailscale Configure this Ubuntu server as an exit node and advertise it.
```

起草策略更改以供审阅：

```
/tailscale Write a grant that lets the group:contractors group reach only
the tag:web devices on port 443, and add a test for it.
```

为你正在构建的应用添加 Tailscale：

```
/tailscale Add tsnet to this Go service so it listens on my tailnet instead
of a public port.
```

将工作负载部署到你的 tailnet：

```
/tailscale Expose this Deployment to my tailnet with the Kubernetes operator.
```

排查连接问题：

```
/tailscale My two devices connect through DERP instead of directly. Walk
through netcheck output with me and identify why.
```

## 局限性

该 skill 有以下限制：

* 该 skill 是 alpha 版本，不在 Tailscale 支持渠道的支持范围内。
* Tailscale 的配置语法和功能会不断变化。skill 的参考资料反映的是你安装时其仓库的状态，因此请对照本文档核实其输出。
* 隐式调用取决于你的代理。代理可能会直接凭训练数据回答，而不加载该 skill。
* 该 skill 只提供参考资料，不提供访问权限。它不会对你的 tailnet 进行身份验证，也不会更改你的配置。

## 支持与反馈

如果 skill 本身有问题，例如指引不准确、覆盖内容缺失或安装失败，请[在 skill 仓库中提交 issue][xt-gh-tailscale-skill-issues]。

有关 Tailscale 产品和功能的问题，请联系 [Tailscale 支持团队][co-support]。支持服务不涵盖该 skill 或代理使用它生成的内容。

[co-support]: https://tailscale.com/contact/support

[docs-aperture]: /docs/aperture

[docs-api]: /docs/reference/tailscale-api

[docs-containers]: /docs/features/containers

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-k8s-operator]: /docs/kubernetes-operator

[docs-subnet-routers]: /docs/features/subnet-routers

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailnet]: /docs/concepts/tailnet

[docs-tailscale-ssh]: /docs/features/tailscale-ssh

[docs-tsnet]: /docs/features/tsnet

[xt-gh-tailscale-skill-issues]: https://github.com/tailscale/tailscale-skill/issues
