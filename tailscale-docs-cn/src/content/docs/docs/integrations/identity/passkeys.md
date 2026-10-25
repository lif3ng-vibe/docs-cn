---
title: "使用 passkey 进行 Tailscale 认证"
description: "Passkey 是一种使用无密码认证将用户认证到 Tailscale 网络（tailnet）的方法。"
---

最后验证于 Jan 5, 2026

Passkey 是一种使用无密码认证将用户认证到 Tailscale 网络（tailnet）的方法。

> **注意：** 此功能目前处于 beta 阶段。

> **注意：** Passkey 适用于[所有套餐](https://tailscale.com/pricing)。

## 工作原理

Passkey 基于 [FIDO Alliance 标准][xt-fidoalliance-passkeys]。该标准使用公钥加密技术，在用户设备上生成一把永不暴露给外界的私钥。你可以将 passkey 存储在设备或钥匙串中。例如，当你使用 Apple ID 创建 passkey 后，可以在登录同一 Apple ID 的其他 Apple 设备上使用同一个 passkey。

生物识别、PIN 码或图案等都是让你用 passkey 完成认证的方式，与解锁支持 FIDO 标准的设备一样。

当用户初次通过 passkey 接受加入 tailnet 的邀请时，系统会创建一个与受邀者 passkey 用户名相匹配的 tailnet。该 tailnet 的名称形如 `<user_name>@passkey`。例如 `bobbuilder@passkey`。

受邀用户的 [Tailscale 身份][docs-tailscale-identity]依赖于为其 passkey 用户名创建的 tailnet 的存在。其他 tailnet 管理员也可以邀请同一个用户加入 tailnet，因此与 `bobbuilder@passkey` 关联的用户可以加入多个 tailnet。

给定的 passkey 用户名只允许创建一次。例如，与 `bobbuilder@passkey` 关联的用户永远只有一个，即使 `bobbuilder@passkey` tailnet 被删除也是如此。如果某个 passkey 用户名对应的 tailnet 被删除，该 tailnet 无法恢复，且该 passkey 用户名无法被再次使用，即使是最初创建该 passkey 用户名的用户也不行。

删除形如 `<user_name>@passkey` 的 tailnet，会同时删除该关联用户在所有其他 tailnet 中的成员身份。

## 支持的 passkey 管理器

Tailscale 支持以下 passkey 管理器：

* 1Password
* Apple
* Bitwarden
* Google
* Microsoft
* Yubikey

由于 Tailscale 无法判断 passkey 的来源，其他任何公司提供的符合 FIDO Alliance 标准的 passkey 也应当可以与 Tailscale 配合使用。

## passkey 用户名规则

passkey 用户名：

* 可以包含小写字母数字字符（`a-z` 和 `0-9`）与连字符（`-`）的组合。
* 不能以数字开头。
* 长度必须在 3 到 63 个字符之间。
* 必须在整个 Tailscale 范围内唯一。

## 邀请 passkey 用户

用户邀请是一次性的，因此每份邀请只能发送给单个用户。如果你想邀请多个用户，请分别为他们各发一份邀请。

你的 Tailscale 账单包含加入你的 tailnet 并在其中传输数据的受邀用户，其中包括在其他 tailnet 中属于付费用户的受邀用户。Tailscale 会为每个 tailnet 上的每个活跃用户计费。

关于邀请用户加入你的 tailnet 的信息，参见：

* [发送邀请电子邮件][docs-invite-email]
* [发送邀请链接][docs-invite-link]

关于邀请用户的更多信息（包括查看或移除未完成的邀请），参见[邀请任意用户加入你的 tailnet][docs-invite]。

## 通过邀请创建 passkey 用户

1. 在网页浏览器中打开邀请中提供的 URL。如果你已登录某个 tailnet，请先登出。

2. 在 Tailscale 登录页面，选择 **Sign in with a passkey**。

   *（图：Tailscale 登录页面。）*

3. 输入一个唯一的用户名，用于注册你的 passkey，并遵守 [passkey 用户名规则][ar-passkey-username-rules]。`@passkey` 值会自动追加。你选择的用户名必须在整个 Tailscale 范围内全局唯一。例如，如果 `bobbuilder@passkey` 已被另一个 tailnet 中的某人使用，就无法在你的 tailnet 中注册。

   *（图：创建新的 passkey。）*

4. 选择 **Create passkey and join**。

5. 选择你希望如何创建和存储 passkey。按照你用于 passkey 认证的设备上的说明操作。

6. 使用你选择的认证方式向 tailnet 进行认证。passkey 用户完成认证后，会显示在管理控制台的 [Users](https://console.tailscale.com/admin/users) 页面上。

*（图：Users 页面中的 passkey 用户。）*

## 使用现有 passkey 登录

1. 在网页浏览器中打开邀请中提供的 URL。如果你已登录某个 tailnet，请先登出。

2. 在 Tailscale 登录页面，选择 **Sign in with a passkey**。

   *（图：Tailscale 登录页面。）*

3. 选择 **Sign in with a passkey**。

   *（图：使用现有 passkey 登录。）*

4. 使用你的 passkey 认证方式登录 tailnet。

## 限制

* 用户无法使用 passkey 认证创建新 tailnet。你必须先创建 tailnet，再发送用于 passkey 认证的用户邀请。
* 已删除的 passkey 用户名不能被重复使用。

[ar-passkey-username-rules]: #passkey-用户名规则

[docs-invite-email]: /docs/features/sharing/how-to/invite-any-user#send-an-invite-email

[docs-invite-link]: /docs/features/sharing/how-to/invite-any-user#send-an-invite-link

[docs-invite]: /docs/features/sharing/how-to/invite-any-user

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[xt-fidoalliance-passkeys]: https://fidoalliance.org/passkeys
