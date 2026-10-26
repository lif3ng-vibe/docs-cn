import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 将 MCP 服务暴露到公共互联网

控制哪些 MCP（Model Context Protocol）服务器对外部调用者（如 ChatGPT、Claude Desktop）可见，哪些仅对内部调用者可见。当你希望一部分 MCP 服务器公开可用，同时把敏感服务器限制在私有网络内时，这个功能就很有用。

## 概览

| 属性 | 说明 |
|-------|-------|
| 描述 | 基于 IP 的 MCP 服务器访问控制；外部调用者只能看到标记为公共的服务器 |
| 设置项 | 每个 MCP 服务器上的 `available_on_public_internet` |
| 网络配置 | `general_settings` 中的 `mcp_internal_ip_ranges` |
| 支持的客户端 | ChatGPT、Claude Desktop、Cursor、OpenAI API 或任何 MCP 客户端 |

:::warning[与 `delegate_auth_to_upstream` 的交互]

如果某台 MCP 服务器设置为 **`available_on_public_internet: false`**（即在基于 IP 的发现中被视为内部），**且**同时设置了 **`delegate_auth_to_upstream: true`** 和 **`auth_type: oauth2`**（交互式 PKCE，而非 M2M），匿名调用者仍然可以在没有 LiteLLM 会话的情况下访问上游 OAuth 的 **`/authorize`** 路径。详情与缓解措施见 [MCP OAuth 透传：将认证委托给上游](./mcp_oauth_passthrough.md#delegate-auth-to-upstream-pkce-passthrough)。

:::

## 工作原理

当请求到达 LiteLLM 的 MCP 端点时，LiteLLM 会检查调用者的 IP 地址，判断它是**内部**还是**外部**调用者：

1. **提取客户端 IP**，从传入的请求中读取（在反向代理后部署时支持 `X-Forwarded-For`）。
2. **判定 IP 归属**，将 IP 与配置的私有 IP 网段比对，区分为内部或外部（默认为 RFC 1918 网段：`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`）。
3. **过滤服务器列表**：
   - **内部调用者**能看到所有 MCP 服务器（公共和私有）。
   - **外部调用者**只能看到 `available_on_public_internet: true` 的服务器。

这项过滤作用于每个 MCP 访问入口：MCP 注册表、工具列表、工具调用、动态服务器路由以及 OAuth 发现端点。

```mermaid
flowchart TD
    A[Incoming MCP Request] --> B[Extract Client IP Address]
    B --> C{Is IP in private ranges?}
    C -->|Yes - Internal caller| D[Return ALL MCP servers]
    C -->|No - External caller| E[Return ONLY servers with<br/>available_on_public_internet = true]
```

## 操作演练

本演练包含两个流程：
1. **添加公共 MCP 服务器**（DeepWiki），并从 ChatGPT 连接它
2. **将现有服务器设为私有**（Exa），并验证 ChatGPT 不再看到它

### 流程 1：添加公共 MCP 服务器（DeepWiki）

DeepWiki 是一个免费的 MCP 服务器，适合公开暴露，让 AI 网关用户可以从 ChatGPT 直接访问。

#### 步骤 1：创建 MCP 服务器

进入 MCP Servers 页面，点击 **"+ Add New MCP Server"**（新增 MCP 服务器）。

![点击 Add New MCP Server](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/28cc27c2-d980-4255-b552-ebf542ef95be/ascreenshot_30a7e3c043834f1c87b69e6ffc5bba4f_text_export.jpeg)

创建对话框打开后，在服务器名称中输入 **"DeepWiki"**。

![输入服务器名称](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/8c733c38-310a-40ef-8a5b-7af91cc7f74f/ascreenshot_16df83fed5bd4683a22a042e07063cec_text_export.jpeg)

在传输类型下拉框中选择 **HTTP**，因为 DeepWiki 使用 Streamable HTTP 传输。

![选择传输类型](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/e473f603-d692-40c7-a218-866c2e1cb554/ascreenshot_e93997971f2f44beac6152786889addf_text_export.jpeg)

接下来向下滚动到 MCP Server URL 字段。

![配置服务器](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/b08d3c1f-9279-45b6-8efb-f73008901da6/ascreenshot_ce0de66f230a41b0a454e76653429021_text_export.jpeg)

输入 DeepWiki 的 MCP URL：`https://mcp.deepwiki.com/mcp`。

![输入 MCP 服务器 URL](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/e59f8285-cfde-4c57-aa79-24244acc9160/ascreenshot_8d575c66dc614a4183212ba282d22b41_text_export.jpeg)

名称、传输类型和 URL 都填好后，服务器的基本配置就完成了。

![服务器 URL 已配置](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/0f1af7ed-760d-4445-bdec-3da706d4eef4/ascreenshot_d7d6db69bc254ded871d14a71188a212_text_export.jpeg)

#### 步骤 2：开启"在公共互联网上可用"

创建之前，向下滚动并展开 **Permission Management / Access Control**（权限管理 / 访问控制）区域，这里控制谁能看到这台服务器。

![展开 Permission Management](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/cc10dea2-6028-4a27-a33b-1b1b7212efb5/ascreenshot_0fdd152b862a4bf39973bc805ce64c57_text_export.jpeg)

打开 **"在公共互联网上可用"**（Available on Public Internet）开关。这是关键设置：它告诉 LiteLLM，外部调用者（比如从公共互联网连入的 ChatGPT）应当能发现并使用这台服务器。

![开启 Available on Public Internet](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/39c14543-c5ae-4189-8f85-9efc87135820/ascreenshot_9991f54910c24e21bba5c05ea4fa8e28_text_export.jpeg)

开关打开后，点击 **"Create"**（创建）保存服务器。

![点击 Create](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/843be209-aade-44f4-98da-e55d1644854c/ascreenshot_8cfc90345a5f4d069b397e80d0a6e449_text_export.jpeg)

#### 步骤 3：从 ChatGPT 连接

下面验证它是否生效。打开 ChatGPT，找到 MCP 服务器图标来添加新连接。要填的端点是 `<your-litellm-url>/mcp`。

![在 ChatGPT 中添加 MCP 服务器](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/58b5f674-edf4-4156-a5fa-5fdc8ed5d7b9/ascreenshot_36735f7c37394e919793968794614126_text_export.jpeg)

在下拉框中选择 **"Add an MCP server"**（添加 MCP 服务器）来配置新连接。

![ChatGPT 的 MCP 服务器选项](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f89da8af-bc61-44a7-a765-f52733f4970d/ascreenshot_6410a917b782437eb558de3bfcd35ffd_text_export.jpeg)

ChatGPT 会要求填写服务器标签，起一个容易辨认的名字，比如 "LiteLLM"。

![输入服务器标签](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/88505afe-07c1-4674-a89c-8035a5d05eb6/ascreenshot_143aefc38ddd4d3f9f5823ca2cc09bc2_text_export.jpeg)

接着输入 Server URL，即 LiteLLM 代理的 MCP 端点 `<your-litellm-url>/mcp`。

![输入 LiteLLM MCP URL](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/9048be4a-7e40-43e7-9789-059fed2741a6/ascreenshot_e81232c17fd148f48f0ae552e9dc2a10_text_export.jpeg)

粘贴你的 LiteLLM URL，并确认无误。

![URL 已粘贴](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/7707e796-e146-47c8-bce0-58e6f4076272/ascreenshot_0710dc58b8ed4d6887856b1388d59329_text_export.jpeg)

ChatGPT 还需要认证。在认证字段中填入你的 LiteLLM API 密钥（API key），它才能连上代理。

![输入 API 密钥](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f6cfcb81-021d-4a41-94d7-d4eaf449d025/ascreenshot_d635865abfb64732a7278922f08dbcaa_text_export.jpeg)

点击 **"Connect"**（连接）建立连接。

![点击 Connect](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/1146b326-6f0c-4050-9729-af5c88e1bc81/ascreenshot_e19fb857e5394b9a9bf77b075b4fb620_text_export.jpeg)

ChatGPT 连接成功并列出可用工具。由于 DeepWiki 和 Exa 目前都标记为公共，ChatGPT 能看到两台服务器的工具。

![ChatGPT 显示可用的 MCP 工具](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/43ac56b7-9933-4762-903a-370fc52c79b5/ascreenshot_39073d6dc3bc4bb6a79d93365a26a4f8_text_export.jpeg)

---

### 流程 2：将现有服务器设为私有（Exa）

接下来做相反的操作：把一台当前公开的现有 MCP 服务器（Exa）限制为仅内部访问。改完之后，ChatGPT 应该就看不到 Exa 的工具了。

#### 步骤 1：编辑服务器

进入 MCP Servers 表格，点击 Exa 服务器打开详情视图。

![Exa 服务器概览](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/65844f13-b1ec-4092-b3fd-b1cae3c0c833/ascreenshot_cc8ea435c5e14761a1394ca80fe817c0_text_export.jpeg)

切换到 **"Settings"**（设置）标签页进入编辑表单。

![点击 Settings](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/d5b65271-561e-4d2a-b832-96d32611f6e4/ascreenshot_a200942b17264c1eb7a3ffdb2c2141f5_text_export.jpeg)

编辑表单会加载 Exa 当前的配置。

![编辑服务器](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/119184f6-f3cd-45b7-9cfa-0ea08de27020/ascreenshot_c39a793da03a4f0fb84b5ee829af9034_text_export.jpeg)

#### 步骤 2：关闭"在公共互联网上可用"

向下滚动并展开 **Permission Management / Access Control**（权限管理 / 访问控制）区域，找到公共互联网开关。

![展开权限设置](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/bf7114cc-8741-4fa0-a39a-fe625482e88a/ascreenshot_8a987649c03e46558a2ec9a6f2f539a4_text_export.jpeg)

关闭 **"在公共互联网上可用"** 开关，这样私有网络之外的调用者就看不到 Exa 了。

![关闭公共互联网开关](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/f36af5ad-028f-4bb1-aed1-43e38ff9b733/ascreenshot_9128364a049f489bb8483e18e5c88015_text_export.jpeg)

点击 **"Save Changes"**（保存更改）使其生效。更改立即生效，无需重启代理。

![保存更改](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/126a71b3-02e1-4d61-a208-942b92e9ef25/ascreenshot_f349ef69e08044dd8e4903f4286b7b97_text_export.jpeg)

#### 步骤 3：在 ChatGPT 中验证

回到 ChatGPT 确认 Exa 已不可见。需要重新连接一次，ChatGPT 才会重新拉取工具列表。

![在 ChatGPT 中验证](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/15518882-8b19-44d3-9bba-245aeb62b4b1/ascreenshot_f98f59c51e6543e1be4f3960ba375fc9_text_export.jpeg)

打开 MCP 服务器设置，选择添加或重新连接服务器。

![重新连接服务器](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/784d3174-77c0-42e6-a059-4c906db8f72a/ascreenshot_d77db951b83e4b15a00373222712f6b5_text_export.jpeg)

输入与之前相同的 LiteLLM MCP URL。

![重新连接时的 URL](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/17ef5fb0-b240-4556-8d20-753d359b7fcf/ascreenshot_583466ce9e8f40d1ba0af8b1e7d04413_text_export.jpeg)

设置服务器标签。

![重新连接时的名称](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/d7907637-c957-4a3c-ab4f-1600ca9a70a0/ascreenshot_e429eea43f3f4b3ca4d3ac5a77fbde2d_text_export.jpeg)

输入你的 API 密钥完成认证。

![重新连接时的密钥](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/9cfff77a-37aa-4ca6-8032-0b46c50f37e3/ascreenshot_250664183399496b8f5c9f86f576fc0b_text_export.jpeg)

点击 **"Connect"**（连接）重新建立连接。

![点击 Connect](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/686f6307-b4ae-448b-ac6c-2c9d7b4f6b57/ascreenshot_3f499d0812af42ab89fed103cc21c249_text_export.jpeg)

这一次只显示 DeepWiki 的工具，Exa 消失了。LiteLLM 检测到 ChatGPT 是从公共 IP 发起调用，而 Exa 已不再标记为公共，于是把它过滤掉了。私有网络内的内部用户仍然能看到两台服务器。

![仅显示 DeepWiki 的工具](https://colony-recorder.s3.amazonaws.com/files/2026-02-07/667d79b6-75f9-4799-9315-0c176e7a5e34/ascreenshot_efa43050ac0b4445a09e542fa8f270ff_text_export.jpeg)

## 配置参考

### 单服务器设置

<Tabs>
<TabItem value="ui" label="UI">

创建或编辑 MCP 服务器时，在 Permission Management（权限管理）区域切换 **"在公共互联网上可用"** 开关。

</TabItem>
<TabItem value="config" label="config.yaml">

```yaml title="config.yaml" showLineNumbers
mcp_servers:
  deepwiki:
    url: https://mcp.deepwiki.com/mcp
    available_on_public_internet: true   # visible to external callers

  exa:
    url: https://exa.ai/mcp
    auth_type: api_key
    auth_value: os.environ/EXA_API_KEY
    available_on_public_internet: false  # internal only (default)
```

</TabItem>
<TabItem value="api" label="API">

```bash title="创建公共 MCP 服务器" showLineNumbers
curl -X POST <your-litellm-url>/v1/mcp/server \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{
    "server_name": "DeepWiki",
    "url": "https://mcp.deepwiki.com/mcp",
    "transport": "http",
    "available_on_public_internet": true
  }'
```

```bash title="更新现有服务器" showLineNumbers
curl -X PUT <your-litellm-url>/v1/mcp/server \
  -H "Authorization: Bearer sk-..." \
  -H "Content-Type: application/json" \
  -d '{
    "server_id": "<server-id>",
    "available_on_public_internet": false
  }'
```

</TabItem>
</Tabs>

### 自定义私有 IP 网段

默认情况下，LiteLLM 把 RFC 1918 私有网段视为内部网段。你可以在 MCP Servers 下的 **Network Settings**（网络设置）标签页中自定义，或通过配置文件修改：

```yaml title="config.yaml" showLineNumbers
general_settings:
  mcp_internal_ip_ranges:
    - "10.0.0.0/8"
    - "172.16.0.0/12"
    - "192.168.0.0/16"
    - "100.64.0.0/10"    # Add your VPN/Tailscale range
```

留空时使用标准私有网段（`10.0.0.0/8`、`172.16.0.0/12`、`192.168.0.0/16`、`127.0.0.0/8`）。

---

## 公共互联网与 MCP Hub 可见性的区别

`available_on_public_internet` 与 **MCP Hub**（`GET /public/mcp_hub`）是两套相互独立的机制，很容易混淆：

| 关注点 | 控制项 | 默认行为 |
|---|---|---|
| 外部（非私有 CIDR）调用者能否在 MCP 工具端点（列表/调用）看到这台服务器？ | 服务器上的 `available_on_public_internet` | `True`（默认可见；改为 `false` 可限制为仅私有 CIDR 可见） |
| 这台服务器是否会出现在无需认证的 `GET /public/mcp_hub` 公告中？ | `litellm.public_mcp_servers` 列表，受 `litellm.public_mcp_hub_strict_whitelist` 控制 | Hub 严格白名单默认**开启**，只有显式列在 `public_mcp_servers` 中的服务器才会被公告 |

在**默认的严格白名单模式**下，`available_on_public_internet: true`（默认值）不会让服务器出现在 Hub 中。要把服务器公告到 Hub，还需要把它加入 `public_mcp_servers`：

```yaml title="服务器同时在 Hub 公告且对外部调用者可见（默认）" showLineNumbers
litellm_settings:
  public_mcp_servers:
    - deepwiki
  # public_mcp_hub_strict_whitelist defaults to true

mcp_servers:
  deepwiki:
    url: https://mcp.deepwiki.com/mcp
    # available_on_public_internet defaults to true
```

如果设置 `litellm.public_mcp_hub_strict_whitelist: false`，Hub 会退回到公告所有 `available_on_public_internet: true` 的服务器。本页介绍的基于 IP 的访问过滤仍然独立作用于实际工具端点。
