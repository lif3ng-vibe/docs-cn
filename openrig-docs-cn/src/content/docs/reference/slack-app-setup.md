---
title: "为 OpenRig 创建你自己的 Slack 应用（实验性）"
---

> **0.6.0 中为实验性**。清单（`rig slack manifest`）与这篇安装指南是新内容，尚未对照真实的
> 应用创建流程验证过。Slack 连接器本身及其 `setup`、`verify`、`enable`、`disable` 与
> `status` 命令不是实验性的。如果这里的某一步与 Slack 显示给你的不符，请
> [提交 issue](https://github.com/mvschwarz/openrig/issues/new/choose) 或发起 pull request
> （[CONTRIBUTING.md](/../CONTRIBUTING/)）。

OpenRig 的 Slack 连接器与一个由你在自己的 Slack 工作区中创建的应用通信。OpenRig
随附该应用的清单（manifest）；它不托管应用、不运行安装端点，也不向 Slack Marketplace 发布任何东西。该应用是
Socket Mode 应用，因此它只存在于你创建它的那一个工作区中。

`rig slack manifest` 打印清单。它在离线状态下即可工作，早于任何守护进程或令牌的存在：

```bash
rig slack manifest          # YAML 形式的清单
rig slack manifest --url    # 已预填清单的 Slack 创建应用链接
rig slack manifest --json   # 清单、其 scope 与事件，以及请求每个 scope 的理由
```

在 Slack 尚未配置时，TUI 会在 Connections 页面显示同一个链接。CLI 与 TUI 都不会打开浏览器、接受令牌或创建应用。

## 步骤

以下是预期步骤，依据 Slack 的应用清单文档整理。它们尚未经过一次真实创建流程的验证。Slack 的表单可能会询问预填没有填到的内容；若如此，以表单为准。

1. 在浏览器中打开 `rig slack manifest --url` 给出的链接。
2. 如被要求则登录 Slack，选择工作区，检查预填的清单，然后点击 **Create**。
3. 在 **Socket Mode** 下确认其已启用；若未启用则启用它。
4. 在 **Basic Information → App-Level Tokens** 下，生成一个带 `connections:write` scope 的令牌并复制它（以 `xapp-` 开头）。
5. 把应用安装到工作区，并批准所请求的 scope。
6. 在 **OAuth & Permissions** 下，复制 **Bot User OAuth Token**（以 `xoxb-` 开头）。
7. 把两个令牌放进一个仅你可读的私有 env 文件（`chmod 600`）：

   ```bash
   SLACK_BOT_TOKEN=xoxb-...
   SLACK_APP_TOKEN=xapp-...
   ```

8. 运行 `rig slack setup --channel <channel-id> --secrets-env-file <path>`，然后
   `rig slack verify`，再 `rig slack enable`。
9. 把机器人邀请进你配置的频道（在该频道里执行 `/invite @OpenRig`）。

## 应用请求什么

运行 `rig slack manifest --json` 可获得确切清单及每个 scope 的理由。共有两组：

- **基线 scope**：发布消息、读取应用为其成员的公开频道的消息历史，以及读取频道详情。
  `rig slack verify` 会检查这些。
- **功能 scope**：`files:read`（下载人们发送的附件）、`files:write`（向 Slack 上传附件）与
  `app_mentions:read`（接收对应用的 @ 提及）。`rig slack verify` **不**检查这些，因此
  verify 给出的 READY 不能证明附件或提及功能可用。

若某个功能 scope 未被授予，影响因功能而异：

- **附件**（`files:read`、`files:write`）：文件下载或上传调用失败。带附件但无法下载的消息仍会送达，消息中会点明下载失败的文件。附件无法上传的发言仍会发出其文本，失败只出现在守护进程日志（`rig daemon logs`）中。
- **提及**（`app_mentions:read`）：Slack 不会向应用投递 `app_mention` 事件，而 OpenRig 中没有任何东西会报告它们缺失。

因此安装之后，请把 Slack 显示的应用已授予 scope 与 `rig slack manifest --json` 列出的全部六个 scope 对照一遍。

该应用订阅其成员的公开频道中的消息（`message.channels`）以及对应用的提及（`app_mention`）。它不请求私信或私有频道访问权。

## 连接器如何使用这些令牌

令牌留在你创建的 env 文件里。连接器从该文件读取它们，并用它们向 Slack 认证：它用应用级令牌打开一条出站 Socket Mode 连接，并用机器人令牌调用 Slack 的 Web API。这个连接器没有任何 OpenRig 托管的组件，只发起出站连接。这句话说的是这个 Slack 连接器，而不是 OpenRig 的每个部分。

## 后续

- `rig slack status` 显示还缺什么，无需联系 Slack。
- `rig slack verify` 与 Slack 核对已授予的基线 scope 与频道成员资格。
