---
title: "模拟来自全球不同位置的流量，进行本地化与特定地区测试"
description: "测试本地化与特定地区行为通常需要在多个地区部署基础设施，或者依赖第三方代理服务。这两种方式都会增加成本与复杂性，而"
---

最后验证于 May 18, 2026

> **注意：**
>
> 精选参考：
>
> [**出口节点**（路由全部流量）](/docs/features/exit-nodes)——让所有互联网流量经由网络中的特定设备路由。

测试本地化与特定地区行为通常需要在多个地区部署基础设施，或者依赖第三方代理服务。这两种方式都会增加成本与复杂性，而且基于代理的测试结果往往不可靠，因为商业代理共享的 IP 段会被许多服务标记或封禁。

Tailscale [出口节点][docs-exit-nodes]让你可以把测试机的流量经由 tailnet 中任何地理位置的设备路由。在需要测试的地区部署出口节点，就能模拟来自这些地区的真实用户流量。再配合命令行负载测试工具 [Siege][xt-siege]，你可以生成逼真的流量模式，验证本地化、地理路由以及分地区内容分发。

## 在目标地区设置出口节点

将至少两个地理区域（例如美国东部和欧盟西部）的 Linux 服务器配置为出口节点，让测试机可以经由它们路由流量。每台服务器都需要安装并运行 Tailscale。如有需要，请按照[在 Linux 上安装 Tailscale][docs-install-linux]的说明操作。

1. 在每台区域服务器上启用 IP 转发：

   ```bash
   echo 'net.ipv4.ip_forward = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   echo 'net.ipv6.conf.all.forwarding = 1' | sudo tee -a /etc/sysctl.d/99-tailscale.conf
   sudo sysctl -p /etc/sysctl.d/99-tailscale.conf
   ```

2. 将每台服务器宣告为出口节点：

   ```bash
   sudo tailscale set --advertise-exit-node
   ```

3. 在管理控制台批准每个出口节点。这需要[管理员](/docs/reference/user-roles)权限。
   1. 打开管理控制台的[机器](https://console.tailscale.com/admin/machines)页面。
   2. 找到该区域服务器，选择相应按钮，然后选择**设置出口节点**。
   3. 选择**用作出口节点**，然后选择**保存**。

4. 在测试机上验证出口节点可用：

   ```bash
   tailscale exit-node list
   ```

   你会在输出中看到你的区域服务器。

> **提示：**
>
> 给机器起有辨识度的名字（例如 `exit-us-east` 和 `exit-eu-west`），切换地区时更容易识别。

## 授予出口节点访问权限

1. 在 [tailnet 策略文件][docs-tailnet-policy-file]中添加一条[授权][docs-grants]，允许你的测试机使用出口节点。为出口节点服务器打上 `tag:exit-node` 标签，并授予测试分组访问权限：

   ```json
   "tagOwners": {
   "tag:exit-node": ["group:qa"]
   },
   "grants": [
   {
       "src": ["group:qa"],
       "dst": ["tag:exit-node"],
       "app": {
       "tailscale.com/cap/node-exit": [{}]
       }
   }
   ]
   ```

\[Missing snippet: visual\_policy\_editor.mdx]

1. 为每台出口节点服务器分配该标签：

   ```bash
   sudo tailscale set --advertise-tags=tag:exit-node
   ```

## 在测试机上安装 Siege

在你将用来产生测试流量的机器上安装 [Siege][xt-siege]。

#### Linux

用你的包管理器安装 Siege。在 Ubuntu 和 Debian 系统上使用 `apt`：

```bash
sudo apt install siege
```

#### macOS

使用 Homebrew 安装 Siege：

```bash
brew install siege
```

验证安装：

```bash
siege --version
```

## 用 Siege 运行特定地区的负载测试

流量经由区域出口节点路由、Siege 也安装好后，就可以对应用施加负载，验证其本地化行为。

1. 在测试机上选择你要测试地区的出口节点。例如，让流量经由美国东部服务器路由：

   ```bash
   sudo tailscale set --exit-node=exit-us-east
   ```

2. 查看你的公网 IP 地址，确认流量正经由出口节点路由：

   ```bash
   curl -s https://ifconfig.me
   ```

   输出显示的是出口节点服务器的公网 IP 地址，而不是你本地机器的。

3. 通过美国东部出口节点运行一次基础负载测试：

   ```bash
   sudo tailscale set --exit-node=exit-us-east
   siege -c 10 -r 50 -H "Accept-Language: en-US" https://your-app.example.com
   ```

   这会以 10 个并发用户发送 50 轮请求，每个请求都带有 `en-US` 语言头。你的应用会根据流量的地理来源返回美式本地化内容。

4. 要验证应用返回特定地区的内容，请以详细模式运行 Siege 并检查响应：

   ```bash
   sudo tailscale set --exit-node=exit-eu-west
   siege -c 1 -r 1 -v -H "Accept-Language: de-DE" https://your-app.example.com
   ```

   检查响应头和内容，确认应用返回了预期的本地化版本。

5. 测试完成后，在测试机上关闭出口节点，让流量恢复正常路由：

   ```bash
   sudo tailscale set --exit-node=
   ```

6. 验证流量不再经由出口节点路由：

   ```bash
   curl -s https://ifconfig.me
   ```

   输出显示的是你本地机器的公网 IP 地址。

## 依次测试多个地区

创建一个脚本，切换出口节点并对每个地区运行 Siege：

```bash
#!/bin/bash

REGIONS=("exit-us-east" "exit-eu-west")
LANGUAGES=("en-US" "de-DE")
TARGET="https://your-app.example.com"

for i in "${!REGIONS[@]}"; do
  echo "Testing region: ${REGIONS[$i]} with language: ${LANGUAGES[$i]}"
  sudo tailscale set --exit-node="${REGIONS[$i]}"
  sleep 5

  siege -c 10 -r 50 \
    -H "Accept-Language: ${LANGUAGES[$i]}" \
    --log="/tmp/siege-${REGIONS[$i]}.log" \
    "$TARGET"

  echo "Completed: ${REGIONS[$i]}"
done

sudo tailscale set --exit-node=
echo "All region tests complete."
```

脚本会依次遍历各个地区、设置出口节点、用该地区对应语言运行 Siege，最后关闭出口节点。

[docs-exit-nodes]: /docs/features/exit-nodes

[docs-grants]: /docs/features/access-control/grants

[docs-install-linux]: /docs/install/linux

[docs-tailnet-policy-file]: /docs/features/tailnet-policy-file

[xt-siege]: https://github.com/JoeDog/siege
