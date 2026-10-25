---
title: "Tailscale Services 配置文件"
description: "使用 Tailscale Services 配置文件来定义资源如何在你的 tailnet 内暴露。"
---

最后验证于 Jan 27, 2026

Service 配置文件定义 [Tailscale Services][docs-tailscale-services] 如何把流量路由到托管该 Service 所关联资源的设备上。其中包含一个 huJSON 格式的 [`tailscale serve`][docs-tailscale-serve] 配置。该配置指定 Service 端点、协议映射和处理程序目标。它规定每个 Service 接受哪些端口和协议、流量路由到哪里，以及是否将 Service 发布到 Tailscale 网络（即 tailnet）。Service 主机使用该配置来公布与你在你 tailnet 中创建的 Service 资源定义相匹配的端点。

Service 配置文件的文件名并不重要，只要你在使用 `tailscale serve` 命令发布 Service 时指定正确的名称即可。该语法以 `services` 作为顶层字段，其中包含一个含有一个或多个 Service 定义的对象。每个 Service 定义都包含一个 `endpoints` 字段，把一个或多个"端口-协议"组合映射到 Service 主机上的资源（`<local-target>`）。

```json
{
  "version": "<version>",
  "services": {
    "svc:<service-name>": { // <service-name> is the name of the service (for example, `svc:web-server` or `svc:printer`)
      "endpoints": { // Can contain one or more endpoint mappings
        "<protocol>:<port|port-range>": "<local-target>" // Maps incoming traffic to a local target
      }
    }
  }
}
```

`endpoints` 字段中的每个端点映射对入站流量使用 `protocol:port` 或 `protocol:start-end` 格式。目前仅支持 `tcp` 协议。`<port>` 或 `<start-end>` 定义 Service 监听哪些端口。

`<local-target>` 定义在 Service 主机上把流量转发到哪里，使用 `<protocol>://<host:port>` 格式的 URI 风格语法，其中 `<protocol>` 为以下之一：

* `http`
* `https`
* `tcp`

此示例为通过 HTTPS 在端口 `443` 上暴露的本地 web 服务器配置了一个端点：

```json
{
  "version": "0.0.1",
  "services": {
    "svc:web-server": {
      "endpoints": {
        "tcp:443": "https://localhost:443"
      }
    }
  }
}
```

下表描述了 Service 配置文件中的所有可用字段。

| 字段         | 层级    | 类型    | 必填 | 说明                                                                                                                                                                                                                                    |
| ------------ | ------- | ------- | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `version`    | Root    | String  | 是       | Service 配置文件的格式版本。必须为 `"0.0.1"`。                                                                                                                                                                                          |
| `services`   | Root    | Object  | 是       | 包含一个或多个 Service 的根对象。Service 名称必须使用 `svc:<service-name>` 格式。每个键是一个 Service 名称，每个值是一个 Service 配置对象，其中包含一个或多个端点映射。                                                                  |
| `endpoints`  | Service | Object  | 是       | 包含一个或多个端点映射，用于把入站流量指向本地资源。                                                                                                                                                                                    |
| `advertised` | Service | Boolean | 否       | 该 Service 是否可以接受新连接。未指定时默认为 `true`。                                                                                                                                                                                  |

[docs-tailscale-serve]: /docs/reference/tailscale-cli/serve

[docs-tailscale-services]: /docs/features/tailscale-services
