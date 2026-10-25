---
title: "使用 MDM 在 Android 上部署 Tailscale"
description: "本页面包含对系统管理员有用的技术信息，适用于在企业环境中使用 Google Workspace、Microsoft Intune 或 TinyMDM 等 MDM 方案部署 Android 版 Tailscale。"
---

最后验证于 Aug 18, 2025

本页面包含对系统管理员有用的技术信息，适用于在企业环境中使用 [Google Workspace][docs-mdm-google-workspace]、[Microsoft Intune][docs-mdm-microsoft-intune] 或 [TinyMDM][docs-mdm-tinymdm] 等 MDM 方案部署 Android 版 Tailscale。

我们一直在努力为管理员提供更多以编程方式管理 Tailscale 部署的选项。如果你正在大量 Android 设备上部署 Tailscale，并且需要本页面目前尚未提供的特定配置选项，请联系我们的支持团队。

> **注意：**
>
> MDM 支持和系统策略要求 Android 版 Tailscale 为 v1.66 或更高版本。更早的版本不提供此功能。

## 在 Android 上分发 Tailscale

我们 Android 应用的应用 ID 是 `com.tailscale.ipn`。

我们推荐企业客户使用 [Google Play 商店][xt-google-play-store-listing]进行分发。与我们支持的所有其他平台一样，Play 商店上发布的 Tailscale Android 构建版本在每次发布前都会经过质量保证测试，且应用更新采用分阶段推出（phased rollout）的方式分发，以尽量减少任何回归问题的影响。

要让已注册到你 MDM 方案的 Android 设备直接从 Play 商店分发 Tailscale，请参阅相应厂商提供的文档。大多数 MDM 方案会要求你先将管理控制台连接到 [Managed Google Play][xt-managed-google-play]，然后在可用应用列表中选择 Tailscale 应用。

注意，Tailscale 是一个[开源][xt-github-android]项目，因此验证分发给最终用户的二进制文件的真实性非常重要。为此，我们强烈建议企业用户从 Play 商店上的官方 Tailscale 页面获取二进制文件，这些文件由 Tailscale 团队直接构建、验证和分发。

## 在 Android 上使用 Tailscale 系统策略

使用 MDM 将 Android 版 Tailscale 部署到你注册的设备后，你可以使用[托管配置（managed configuration）][xt-android-managed-configuration]在 Tailscale 安装上强制执行系统策略。部署系统策略让你可以代用户配置 Tailscale 客户端的特定设置，提供更轻松的设置流程，减少不懂技术的用户的困惑。

可配置设置的完整列表请参阅我们的[系统策略][docs-mdm-keys]文档。

Android 上可用的系统策略列在应用 APK 内的 [`app_restrictions.xml` 文件][xt-restrictions-xml]中。当你使用自己偏好的 MDM 方案配置 Tailscale Android 应用时，配置界面会动态发现可用的限制项，并让你为每一项定义取值。

例如，TinyMDM 会显示以下配置界面，以便在策略中配置 Tailscale：

*（图：TinyMDM 中针对 Tailscale 的配置页面）*

配置应用限制的具体操作请参阅你的 MDM 方案厂商提供的说明。在这些页面中，我们提供了 [Google Workspace][docs-mdm-google-workspace] 和 [TinyMDM][docs-mdm-tinymdm] 的配置步骤，它们是两种常用的 Android MDM 方案。

[docs-mdm-google-workspace]: /docs/integrations/mdm/google-workspace

[docs-mdm-keys]: /docs/features/tailscale-system-policies

[docs-mdm-microsoft-intune]: /docs/integrations/mdm/microsoft-intune

[docs-mdm-tinymdm]: /docs/integrations/mdm/tinymdm

[xt-android-managed-configuration]: https://developer.android.com/work/managed-configurations

[xt-github-android]: https://github.com/tailscale/tailscale-android

[xt-google-play-store-listing]: https://play.google.com/store/apps/details?id=com.tailscale.ipn

[xt-managed-google-play]: https://developers.google.com/android/work/overview#managed_google_play

[xt-restrictions-xml]: https://github.com/tailscale/tailscale-android/blob/main/android/src/main/res/xml/app_restrictions.xml
