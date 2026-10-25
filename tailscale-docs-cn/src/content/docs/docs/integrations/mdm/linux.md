---
title: "使用 MDM 在 Linux 上部署 Tailscale"
description: "本页包含对在企业环境中于 Linux 上部署 Tailscale 的系统管理员有用的技术信息。"
---

最后验证于 Aug 11, 2026

本页包含对在企业环境中于 Linux 上部署 Tailscale 的系统管理员有用的技术信息。

与其他平台不同，Linux 没有统一的由厂商提供的移动设备管理（MDM）框架。管理员通常使用 Ansible、Puppet 或 Chef 等配置管理工具来管理成批的 Linux 设备，或者将配置预先烧录进用于供应（provisioning）的黄金镜像中。Tailscale 在 Linux 上通过一个 JSON 策略文件支持这种工作流，你可以用已有的任意配置管理工具来部署它。

> **注意：**
>
> Linux 上的系统策略要求 Tailscale v1.102.0 或更高版本。更早的版本不支持此功能。

## 在 Linux 上安装 Tailscale

有关在你的发行版上安装 Tailscale 的推荐方式，请参阅我们的 [Linux 安装说明][docs-install-linux]。

## 在 Linux 上使用 Tailscale 系统策略

`tailscaled` 守护进程会从磁盘上的一个 JSON 文件读取系统策略。默认情况下，该文件位于 `/etc/tailscale/syspolicy.json`。你可以使用自己偏好的配置管理工具将此文件部署到受管的 Linux 设备上。

> **注意：**
>
> 你可以在启动 `tailscaled` 时使用 [`--syspolicy-file`][docs-tailscaled-flags] 标志来更改策略文件的位置，或完全禁用此功能。传入空字符串会禁用策略文件加载器。

请参阅我们的[系统策略][docs-mdm-keys]页面，获取可配置设置的完整列表。

### 文件格式

策略文件采用 JSON 或 [HuJSON][xt-hujson] 格式。每个策略键都要求特定的值类型：

* **字符串**（String）设置接受 JSON 字符串，例如 `"ControlURL": "https://controlplane.example.com"`。
* **布尔值**（Boolean）设置接受 JSON 布尔值，例如 `"AlwaysOn": true`。
* **整数**（Integer）设置接受 JSON 数字，例如 `"KeyExpirationNotice": 86400`。
* **字符串数组**（String array）设置接受 JSON 字符串数组，例如 `"AllowedSuggestedExitNodes": ["node-a", "node-b"]`。
* **时长**（Duration）设置接受 [Go 的 `time.ParseDuration`][xt-go-parse-duration] 所接受格式的字符串，例如 `"ReconnectAfter": "24h"`。
* 某些设置只接受特定的枚举字符串值，例如偏好设置中的 `always`、`never` 或 `user-decides`，可见性设置中的 `show` 或 `hide`。

#### 示例

例如，下面的策略文件强制使用认证密钥（auth key）、将设备限制到特定 tailnet、限制建议的出口节点，并要求设备接受来自 tailnet 的子网路由和 DNS 设置：

```json
{
  "AuthKey": "tskey-auth-xxx",
  "Tailnet": "example.com",
  "AllowedSuggestedExitNodes": ["node-a", "node-b"],
  "UseTailscaleSubnets": "always",
  "UseTailscaleDNSSettings": "always"
}
```

[docs-install-linux]: /docs/install/linux

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-tailscaled-flags]: /docs/reference/tailscaled#flags-to-tailscaled

[xt-go-parse-duration]: https://pkg.go.dev/time#ParseDuration

[xt-hujson]: https://github.com/tailscale/hujson
