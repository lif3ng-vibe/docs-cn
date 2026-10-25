---
title: "Tailscale 客户端上的群组可见性"
description: "为运行在 Tailscale 网络中的应用程序获取群组成员身份信息。"
---

最后验证于 Jun 10, 2026

你可以将 Tailscale 网络（即 tailnet）中的设备配置为从 Tailscale [控制平面][docs-control-data-planes-control-plane]接收群组成员身份信息。群组信息既包括策略文件中定义的[群组][docs-policy-file-groups]，也包括通过 SCIM（跨域身份管理系统）从身份提供方（IdP）[同步的群组][docs-user-group-provisioning]。一旦 Tailscale 客户端配置为接收群组信息，你就可以通过 [Tailscale CLI][docs-tailscale-cli]、[`tsnet`][docs-tsnet] 库和 [LocalAPI][xt-go-tailscale-ipn-localapi] 获取这些信息。

> **注意**：此功能目前处于 alpha 阶段。

## 要求

在客户端接收群组信息之前，请确保满足以下要求。

* 你可以编辑策略文件。你需要具有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 身份才能编辑策略文件。
* 你希望接收群组成员身份信息的设备运行 Tailscale v1.97.8 或更高版本。
* （可选）你可以为需要接收群组成员身份信息的设备分配[标签][docs-tags]。

## 使用场景

* **群组专属功能**

  应用程序可以利用群组成员身份信息来启用或禁用功能，而无需额外的用户授权。例如，当用户属于 beta 测试员群组或付费套餐群组时，你可以为其开启额外功能。

* **掌握群组使用情况**

  应用程序可以把群组成员身份记录到日志和审计追踪中。这对使用情况分析、成本核算和事件排查可能很有用。

## 工作原理

有些应用程序需要基于连接用户的 [Tailscale 身份][docs-tailscale-identity]信息，以便把这些信息传递给用户界面（UI）或自己的客户端。为支持这一点，当用户有权访问某台设备时，Tailscale 控制平面会向该设备发送以下信息：

* 用户名
* 用户登录名
* 用户头像 URL

默认情况下，Tailscale 控制平面不会向设备发送群组成员身份信息。要启用该功能，请使用 node-attr-visible-groups [节点属性][docs-policy-file-node-attributes]作为应用能力（application capability），将其应用到一组设备，并指定这些设备可以访问哪些群组。

之后，运行在含有 `node-attr-visible-groups` 属性的设备上的应用程序，就可以通过 [`tsnet`][docs-tsnet] 库或 [LocalAPI][xt-go-tailscale-ipn-localapi] 从设备获取群组成员身份信息。

## 更新策略文件

配置你的[策略文件][docs-tailnet-policy-file]，告知 Tailscale 控制平面哪些设备可以接收群组信息。你需要在策略文件中做以下更新：

* （可选）创建一个标签，用于标识哪些设备将拥有接收群组成员身份信息的能力。
* 创建一个节点属性，标识哪些群组对这些设备可见。

你需要具有 [Owner、Admin 或 Network admin](/docs/reference/user-roles) 身份才能编辑策略文件。

### （可选）创建标签

创建一个标签，以便将其应用到你希望接收群组信息的设备。在本示例中，把标签命名为 `prod`。

1. 进入管理控制台的 [Access controls](https://console.tailscale.com/admin/acls/file) 页面。

2. 如果你的策略文件中还没有 `tagOwners` 字段，请创建它。

   ```json {2-4}
   {
     "tagOwners": {

     },
   }
   ```

3. 在 `tagOwners` 字段中，创建一个名为 `prod` 的 `tag`，并将 `autogroup:admin` 指定为标签所有者。

   ```json {3}
   {
     "tagOwners": {
        "tag:prod": ["autogroup:admin"],
     },
   }
   ```

   这样，你 tailnet 中的任何管理员都可以把 `prod` 标签分配给设备。

### 创建节点属性

添加一个[节点属性][docs-policy-file-node-attributes]（`nodeAttrs`），为你指定的设备授予 `tailscale.com/visible-groups` 能力的应用层访问权限。

1. 创建一个 `nodeAttr` 字段。
2. 在 `nodeAttr` 字段中创建 `target` 字段，并赋予其数组值。如果你创建了标签，就把它作为值。否则，指定一组用户、主机或 IP 地址。
3. 同样在 `nodeAttr` 字段中，创建一个 `app` 字段。
4. 在 `app` 字段中，创建一个 `tailscale.com/visible-groups` 字段，这就是你要分配给设备的应用能力。
5. 在 `tailscale.com/visible-groups` 字段中，创建一个 `groups` 数组，并赋值为你希望对设备可见的群组集合。该集合可以是单个通配符条目 \[`"*"`] 以使所有群组可见，也可以是群组列表。

   > **注意：**
   >
   > 策略文件校验不会检查这些群组是否真的存在于你的 tailnet 中。

你的节点属性条目应类似于：

```json
"nodeAttrs": [
  {
    "target": ["tag:prod"],
	// If not using a tag, use the following format for the target instead:
	// "target": ["my-prod-app", "100.123.123.123", ...],
      "app": {
      "tailscale.com/visible-groups": [
        {
	      // "groups": ["*"] // to match all groups
          "groups": [
            "group:engineering",        # group defined in policy file
            "group:sales@example.com",  # synced group
            "group:support@example.com" # synced group
          ]
        }
      ]
	}
  }
]
```

## 使用 Tailscale CLI 验证群组可见性

在具有 `node-attr-visible-groups` 节点属性的设备上，你可以运行 [`tailscale status`][docs-tailscale-cli-status] 命令来验证群组可见性：

```shell
tailscale status -json
```

输出包含一个 `Groups` 字段，列出用户的群组成员身份：

```json {10-13}
{
  [...]

  "User": {
    "1234567890": {
      "ID": 1234567890,
      "LoginName": "amelie@example.com",
      "DisplayName": "Amelie Pangolin",
      "ProfilePicURL": "https://example.com/a/1122334455",
      "Groups": [
        "group:engineering",
        "group:sales@example.com"
      ]
    },

    [...]
  },

[...]
}
```

## 使用 tsnet 验证群组可见性

[`tsnet`][docs-tsnet] 是一个让你把 Tailscale 嵌入 Go 程序的库。你可以修改 [Hello tsnet][docs-create-basic-tsnet-app] 示例，让它同时报告群组成员身份。

```go {15}
[...]

log.Fatal(http.Serve(ln, http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
  who, err := lc.WhoIs(r.Context(), r.RemoteAddr)
    if err != nil {
      http.Error(w, err.Error(), 500)
			return
    }
    fmt.Fprintf(w, "<html><body><h1>Hello, world!</h1>\n")
    fmt.Fprintf(w, "<p>You are <b>%s</b> from <b>%s</b> (%s)</p>",
      html.EscapeString(who.UserProfile.LoginName),
	  html.EscapeString(who.UserProfile.LoginName),
      html.EscapeString(firstLabel(who.Node.ComputedName)),
        r.RemoteAddr)
    fmt.Fprintf(w, "<p><strong>Your Groups:</strong> %s</p>", strings.Join(who.UserProfile.Groups, ", "))

[...]
```

[docs-control-data-planes-control-plane]: /docs/concepts/control-data-planes#控制平面

[docs-create-basic-tsnet-app]: /docs/features/tsnet/how-to/create-basic-tsnet-app

[docs-policy-file-groups]: /docs/reference/syntax/policy-file#群组groups

[docs-policy-file-node-attributes]: /docs/reference/syntax/policy-file#节点属性

[docs-tags]: /docs/features/tags

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[docs-tailscale-cli-status]: /docs/reference/tailscale-cli#status

[docs-tailscale-cli]: /docs/reference/tailscale-cli

[docs-tailscale-identity]: /docs/concepts/tailscale-identity

[docs-tsnet]: /docs/features/tsnet

[docs-user-group-provisioning]: /docs/features/user-group-provisioning

[xt-go-tailscale-ipn-localapi]: https://pkg.go.dev/tailscale.com/ipn/localapi
