---
title: "设置 Gemini Enterprise Agent Platform"
description: "在 Aperture 中配置 Gemini Enterprise Agent Platform 提供商，让你的团队通过 Aperture 访问 Google Gemini 和 Anthropic Claude 模型。本主题介绍如何创建 Google Cloud 服务账户、生成密钥文件，并把提供商添加到 Aperture 配置中。"
---

最后验证于 Sep 29, 2026

在 Aperture 中配置 Gemini Enterprise Agent Platform 提供商，让你的团队通过 Aperture 访问 Google Gemini 和 Anthropic Claude 模型。本主题介绍如何创建 Google Cloud 服务账户、生成密钥文件，并把提供商添加到你的 Aperture 配置中。

\[Missing snippet: aperture\_any\_provider.mdx]

## 前提条件

开始之前，你需要：

* 一台你的设备可以访问的 Aperture 网关。尚未设置时参阅[开始使用 Aperture][docs-aperture-get-started]。
* 一个已启用 [Gemini Enterprise Agent Platform API][xt-geap-api] 的 Google Cloud 项目。
* 已安装并完成认证的 [Google Cloud CLI][xt-gcloud-cli]（`gcloud`）。
* 你的 Aperture 网关主机名，例如 `ai` 或 `aperture.example.ts.net`。这些名称由 Tailscale 的 [MagicDNS][docs-magicdns] 提供。如果你[从 tailnet 外部连接][docs-connect-outside-tailnet]，请改用 `localhost:<port-number>`。

## 设置 Google Cloud 项目

为下面的 `gcloud` 命令设置当前项目。把 `<your-project>` 替换为你的 Google Cloud 项目 ID。

```shell
gcloud config set project <your-project>
```

## 创建服务账户

创建一个专用服务账户，供 Aperture 调用 Gemini Enterprise Agent Platform API 时使用。

```shell
gcloud iam service-accounts create aperture-vertex \
  --display-name="Aperture Gemini Enterprise Agent Platform"
```

这会在你的项目中创建一个名为 `aperture-vertex` 的服务账户。Aperture 用这个账户向 Gemini Enterprise Agent Platform API 认证，并为请求生成 bearer token。

## 授予 IAM 角色

该服务账户需要两个 IAM 角色：一个用于调用 Gemini Enterprise Agent Platform API，一个用于列出可用模型。

1. 授予 `aiplatform.user` 角色，让服务账户可以向 Gemini Enterprise Agent Platform 上的模型发送请求：

   ```shell
   gcloud projects add-iam-policy-binding <your-project> \
     --member="serviceAccount:aperture-vertex@<your-project>.iam.gserviceaccount.com" \
     --role="roles/aiplatform.user"
   ```

2. 授予 `serviceUsageConsumer` 角色，让服务账户可以列出可用模型：

   ```shell
   gcloud projects add-iam-policy-binding <your-project> \
     --member="serviceAccount:aperture-vertex@<your-project>.iam.gserviceaccount.com" \
     --role="roles/serviceusage.serviceUsageConsumer"
   ```

## 生成 JSON 密钥文件

为该服务账户创建一个 JSON 密钥文件。Aperture 用这个密钥文件为 Gemini Enterprise Agent Platform 请求签发 bearer token。

```shell
gcloud iam service-accounts keys create aperture-vertex-key.json \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

这会在当前目录创建一个名为 `aperture-vertex-key.json` 的文件。该文件包含 Aperture 认证所需的私钥和项目元数据。

请妥善保管该文件。私钥一旦丢失无法恢复，任何能访问该文件的人都可以以该服务账户的身份进行认证。

## 对密钥文件进行 Base64 编码

Aperture 要求在提供商配置中以 base64 编码字符串的形式提供密钥文件。对密钥文件编码，并把结果复制到剪贴板。

macOS 上：

```shell
cat aperture-vertex-key.json | base64 | pbcopy
```

Linux 上：

```shell
cat aperture-vertex-key.json | base64 -w 0
```

Windows（PowerShell）上：

```powershell
[Convert]::ToBase64String([IO.File]::ReadAllBytes("aperture-vertex-key.json")) | Set-Clipboard
```

在下一步中，把这个编码后的字符串用作提供商 `apikey` 字段的值。

## 在 Aperture 中配置 Gemini Enterprise Agent Platform 提供商

在 [Aperture 管理仪表板][docs-web-dashboard-admin]的 **Administration** > **Configuration** 页面（`/admin/settings/config`）中，把 Gemini Enterprise Agent Platform 提供商添加到你的 Aperture 配置中。下面的示例展示了同时启用 Google 与 Anthropic 模型的配置。

```json
{
  "providers": {
    "vertex": {
      "baseurl": "https://aiplatform.googleapis.com",
      "apikey": "keyfile::<base64-encoded-key>",
      "models": [
        "gemini-2.5-flash",
        "gemini-2.5-pro",
        "claude-opus-4-8",
        "claude-sonnet-4-6",
        "claude-haiku-4-5"
      ],
      "compatibility": {
        "google_generate_content": true,
        "google_raw_predict": true,
        "openai_chat": true
      }
    }
  }
}
```

把 `<base64-encoded-key>` 替换为上一步得到的 base64 编码字符串。`keyfile::` 前缀表示该值是 base64 编码的服务账户密钥文件，而不是普通 API key。Aperture 会解码密钥文件并提取 `project_id`，用它改写发往 Gemini Enterprise Agent Platform 的请求路径。

LLM 客户端发送的请求在 URL 路径中带有两个占位值。Aperture 把 `_aperture_auto_vertex_project_id_` 替换为密钥文件中的项目 ID，把 `_aperture_auto_vertex_region_` 替换为 `global`。Aperture 使用 `global` 区域，因为它在 Google 与 Anthropic 两个模型目录中的模型可用性最广。

使用 `keyfile::` 认证时不需要 `authorization` 字段。Aperture 会自动从密钥文件生成 OAuth bearer token，绕过 `authorization` 字段。

`compatibility` 开关控制该提供商接受哪些 Gemini Enterprise Agent Platform API 格式：

* `google_generate_content` 为 Gemini 等 Google 发布的模型启用 Gemini Enterprise Agent Platform 的 `generateContent` 端点。
* `google_raw_predict` 为 Anthropic Claude 等第三方模型启用 Gemini Enterprise Agent Platform 的原始 predict 端点。
* `openai_chat` 为 Gemini 模型启用该平台的 OpenAI 兼容 Chat Completions 路径。使用该路径的客户端把 Chat Completions 请求发送到 Aperture 网关的 `/v1` base URL，不使用上文描述的 Google 原生 URL 占位符。

为提供商服务的每种模型类型启用对应开关。如果同时服务 Gemini 和 Anthropic 模型，请同时启用 `google_generate_content` 和 `google_raw_predict`。要用 Chat Completions 客户端访问 Gemini 模型，请添加 `openai_chat`。Google 托管的 Anthropic 模型要求 raw predict，而不是 Chat Completions。这些开关不会在任意 API 之间做转换。所有开关参阅[兼容性开关][docs-provider-compatibility]。

## 验证提供商

\[Missing snippet: aperture\_verify\_provider.mdx]

测试请求失败时，参阅 [Aperture 故障排查主题][docs-aperture-troubleshooting]。

## 管理服务账户密钥

轮换凭证或下线提供商时，可以列出或撤销服务账户密钥。

### 列出服务账户的密钥

运行以下命令列出与该服务账户关联的所有密钥：

```shell
gcloud iam service-accounts keys list \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

输出会列出该服务账户的所有密钥。输出中的 `key-id` 与 JSON 密钥文件中的 `private_key_id` 字段一致。

### 撤销密钥

按 `key-id` 删除特定密钥：

```shell
gcloud iam service-accounts keys delete <key-id> \
  --iam-account=aperture-vertex@<your-project>.iam.gserviceaccount.com
```

撤销密钥后，生成一个新的密钥文件，并更新 Aperture 提供商配置中的 base64 编码值。使用已撤销密钥的请求会立即失败。

\[Missing snippet: aperture\_provider\_next\_steps.mdx]

[docs-aperture-get-started]: /docs/aperture/get-started

[docs-aperture-troubleshooting]: /docs/aperture/troubleshooting

[docs-connect-outside-tailnet]: /docs/aperture/connect-outside-tailnet

[docs-magicdns]: /docs/features/magicdns

[docs-provider-compatibility]: /docs/aperture/provider-compatibility#compatibility-flags

[docs-web-dashboard-admin]: /docs/aperture/reference/dashboard-admin

[xt-gcloud-cli]: https://cloud.google.com/sdk/docs/install

[xt-geap-api]: https://console.cloud.google.com/apis/library/aiplatform.googleapis.com
