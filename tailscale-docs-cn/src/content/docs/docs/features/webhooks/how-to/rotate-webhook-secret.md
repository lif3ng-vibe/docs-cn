---
title: "轮换 webhook 密钥"
description: "[Webhook][docs-webhooks] 密钥用于对从 Tailscale 发送到你端点的传入 webhook 事件进行认证。当你需要用新密钥替换现有密钥时——无论是作为常规安全维护的一部分，还是在疑似泄露之后——就轮换 webhook 密钥。"
---

最后验证于 Jan 20, 2026

[Webhook][docs-webhooks] 密钥用于对从 Tailscale 发送到你端点的传入 webhook 事件进行认证。当你需要用新密钥替换现有密钥时——无论是作为常规安全维护的一部分，还是在疑似泄露之后——就需要轮换 webhook 密钥。此过程会生成一个新密钥，同时保持你的 webhook 端点配置不变。

## 前提条件

要轮换 webhook 密钥，请确保满足以下前提条件：

* [是 Owner、Admin、Network admin 或 IT admin](/docs/reference/user-roles)。
* 已在管理控制台中配置了一个 webhook 端点。

## 操作步骤

以下步骤指导你完成在 Tailscale 管理控制台中轮换 webhook 密钥的过程。

轮换 webhook 密钥会用新密钥替换现有密钥。旧密钥在轮换后立即失效，因此你需要用新密钥更新你的验证程序，才能继续接收事件。

1. 打开管理控制台的 [Webhooks](https://console.tailscale.com/admin/settings/webhooks) 页面。

2. 找到要轮换密钥的端点，然后选择  菜单 > **Rotate webhook secret**。这会打开 **Rotate webhook secret** 模态框。

3. 选择 **Rotate**，确认你要获取新密钥。

4. 在 **Rotate webhook secret** 模态框中，选择 **Copy** 复制新密钥。

5. 把密钥保存在安全的位置。关闭模态框后你将无法再次查看它。

   > **警告：**
   >
   > 请像对待密码一样对待 webhook 密钥。务必将其存储在安全的位置。

6. 选择 **Done**。

新密钥立即对所有新事件生效。请用新密钥更新你的[签名验证][docs-verify-event-signature]程序，以便继续处理 webhook 事件。

## 后续步骤

轮换 webhook 密钥后，考虑执行以下后续步骤：

* [验证 webhook 签名][docs-verify-event-signature]：用新密钥更新你的验证代码。
* [测试 webhook 端点][docs-test-webhooks]：发送测试事件，确认你的端点在新密钥下工作正常。
* [配置 webhook 事件][docs-configure-webhook]：管理哪些事件会向你的端点触发通知。

[docs-configure-webhook]: /docs/features/webhooks#setting-up-a-webhook-endpoint

[docs-test-webhooks]: /docs/features/webhooks#testing-your-webhook

[docs-verify-event-signature]: /docs/features/webhooks#verifying-an-event-signature

[docs-webhooks]: /docs/features/webhooks
