---
title: "浏览器配置"
description: "浏览器配置——让 Orca 浏览器以特定登录身份、Cookie 集合或 user agent 运行。"
source: "https://www.onorca.dev/docs/browser/profiles"
---

$undefined

浏览器配置让你以特定身份运行 Orca 浏览器——某个已登录用户、一套特定的 Cookie 集合、一个自定义 user agent。当智能体需要登录、复现特定会话下的 bug 或模拟多个用户时很有用。

## 创建配置

1. 打开 [Settings → Browser → Profiles](/settings)。
2. 点击 **Add profile**，起个名字。
3. 可选：预置 Cookie、user agent 与视口尺寸。
4. 对于拒绝 Orca 默认 Chrome 形态 UA 的站点（某些 Google 登录流程），创建一个保留**原生 Electron user agent**、不做伪装的配置。默认配置仍使用清理过的 Chrome UA，以获得更广的 Cloudflare 兼容性。

用脚本配置浏览器时，也可以在 CLI 里用 `orca tab profile create --no-ua-spoof` 创建不伪装的配置。

## Cookie 导入与 Google 登录

从 Settings 或浏览器工具栏把 Chrome、Edge（或 Cookie 文件）的 Cookie 导入某个配置。Google 的 Cookie 会被排除——导入菜单会显示 **Google logins aren't imported** 并提示 **Sign in to Google directly in Orca.** 跳过 Google Cookie 的导入完成后，还会有一条单独的警告指出执行导入的主机：请在同一主机的 Orca 里用同一配置打开浏览器，然后登录。

## 使用配置

在浏览器工具栏选择配置。该窗格中的所有标签页都会使用它，直到你切换。智能体驱动的浏览器命令继承当前活动配置。

## 隔离

每个配置有独立的存储分区——Cookie、localStorage、缓存。配置之间互不泄漏。
