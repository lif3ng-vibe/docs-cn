---
title: "部署多个 Tailscale SSH 会话记录节点"
description: "在 tailnet 中配置多个 SSH 会话记录节点，为故障转移提供备份节点"
---

最后验证于 Dec 8, 2025

Tailscale SSH 会话录制支持使用多个记录节点（recorder node），既可以用于故障转移配置，也可以根据 tailnet 策略文件中的 SSH 访问规则，把录制内容分散到不同的记录器上。

## 为故障转移部署多个记录器

如果你在生产环境中运行 Tailscale SSH 会话录制，可能需要以故障转移配置部署多个记录器，以避免意外停机。

要以故障转移配置部署多个记录节点，需要用 SSH 访问规则中 `recorder` 字段定义的[标签][docs-tags]为每个节点打标签。你可以为任意数量的记录节点打标签，但 SSH 访问规则中的每个 `recorder` 字段只能指定一个标签。

Tailscale 通过选择 IP 地址值最小的节点来决定由哪个记录节点接收会话录制内容。如果该记录器不可用，Tailscale 会尝试连接 IP 地址值次小的节点，并按此方式持续尝试，直到成功连接到某个记录节点。

## 为每条 SSH 访问规则部署不同的记录器

有时，部署多组记录节点并根据对应的 SSH 访问规则把流量导向不同的记录节点会很有用。

例如，下面的访问控制策略片段展示了两条 SSH 访问规则。第一条规则规定所有成员都可以使用 Tailscale SSH 连接自己的设备，第二条规则规定 `eng` 组的成员可以连接带有 `prod` 标签的服务器。

两条 SSH 访问规则都启用了 SSH 会话录制，但每条规则在 `recorder` 字段中定义的标签不同：第一条 SSH 访问规则把录制内容发送到带有 `dev-recorders` 标签的节点，第二条 SSH 访问规则把录制内容发送到带有 `prod-recorders` 标签的节点。

```json
"ssh": [
  {
    "action": "check",
    "src": ["autogroup:member"],
    "dst": ["autogroup:self"],
    "users": ["autogroup:nonroot"],
    "recorder": ["tag:dev-recorders"]
  },
  {
    "action": "check",
    "src": ["group:eng"],
    "dst": ["tag:prod"],
    "users": ["list-of-ssh-users"],
    "recorder": ["tag:prod-recorders"]
  }
]
```

如果你需要按数据敏感度隔离录制内容（例如包含用户 PII 的录制），就可以采用这种配置部署记录器。

如果一条 Tailscale SSH 连接同时被多条 SSH 访问规则允许，而各规则指定的记录器标签不同，Tailscale 会按 tailnet 策略文件中排在最前面的规则执行。

[docs-tags]: /docs/features/tags
