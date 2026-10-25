---
title: "移除设备"
description: "如果不想让某台设备继续留在 Tailscale 网络（tailnet）中，你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面将其移除，或通过"
---

最后验证于 Jan 5, 2026

如果不想让某台设备继续留在 Tailscale 网络（tailnet）中，你可以在管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面将其移除，或使用 [Tailscale API][docs-api] 移除。

从 tailnet 中移除设备时，请注意以下几点：

* 该设备会立即失去与 tailnet 中所有资源的连接

* 如果你的 tailnet 未启用[设备审批][docs-device-approval]，该设备无需 tailnet 管理员重新授权即可被重新加入 tailnet

* 如果只是在一台设备上[卸载][docs-uninstall]了 Tailscale 客户端而没有执行任何移除操作，该设备不会从 tailnet 中移除

## 从管理控制台移除设备

你需要成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能从管理控制台移除设备。

1. 打开管理控制台的 [Machines](https://console.tailscale.com/admin/machines) 页面。

2. 在搜索栏输入设备名称，或使用 **Filters** 选项，定位到该设备。

3. 选择设备旁边的菜单，然后选择 **Remove**。

4. 在确认对话框中，选择 **Remove machine**。

## 使用 API 脚本移除设备

你需要成为 tailnet 的 [Owner、Admin 或 IT admin](/docs/reference/user-roles) 才能使用 [Tailscale API][docs-api] 移除设备。

你可以使用 Tailscale API 移除设备，参见下面的脚本示例。

### 使用 CSV 文件移除设备

要使用 CSV 文件移除设备，请修改并使用以下脚本：

```shell
  for id in $(cat nodes.csv); do echo $id; curl -X DELETE "https://api.tailscale.com/api/v2/device/${id}" -u "$(cat ~/keys/tskey):"; sleep 0.1; done
```

### 按标签移除设备

要按指定标签移除设备，请修改并使用以下脚本。注意将 `apikey=$` 一行更新为你的 Tailscale API 密钥路径。

```shell
#!/bin/bash

tailnet="example.com"
# 替换为你的 Tailscale API 密钥路径。
apikey=$(<"/home/user/path/to/api.key">)
targetname="substring"

curl -s "https://api.tailscale.com/api/v2/tailnet/$tailnet/devices" -u "$apikey:" |jq -r '.devices[] |  "\(.id) \(.name)"' |
  while read id name; do
    if [[ $name = *"$targetname"* ]]
    then
      echo $name $id " includes " $name " in its name - getting rid of it"
      curl -s -X DELETE "https://api.tailscale.com/api/v2/device/$id" -u "$apikey:"
    else
      echo $name" does not have that string in its name, keeping it"
    fi
  done
```

### 按最后出现日期移除设备

要移除最后出现日期早于指定时间的设备，请修改并使用以下脚本。注意将 `apikey=$` 一行更新为你的 Tailscale API 密钥路径。

```shell
  #!/bin/bash

tailnet="example.com"
# 替换为你的 Tailscale API 密钥路径。
apikey=$(<"/home/user/path/to/api.key">)
oldenough=$(date -I --date="1 month ago")

curl -s "https://api.tailscale.com/api/v2/tailnet/$tailnet/devices" -u "$apikey:" |jq -r '.devices[] |  "\(.lastSeen) \(.id)"' |
  while read seen id; do
    if [[ $seen < $oldenough ]]
    then
      echo $id " was last seen " $seen " getting rid of it"
      curl -s -X DELETE "https://api.tailscale.com/api/v2/device/$id" -u "$apikey:"
    else
      echo $id " was last seen " $seen " keeping it"
    fi
  done
```

[docs-api]: /docs/reference/tailscale-api

[docs-device-approval]: /docs/features/access-control/device-management/device-approval

[docs-uninstall]: /docs/features/client/uninstall
