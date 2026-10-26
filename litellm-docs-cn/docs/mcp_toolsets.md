import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# MCP 工具集

如需了解直连客户端的 URL 与 LLM 工具选择器，参见 [MCP 配置参考](./mcp_config_reference#endpoint-matrix)。

**工具集**（Toolset）是从一个或多个 MCP（Model Context Protocol）服务器中挑选出的特定工具的命名集合。你不必让智能体访问每个服务器上的全部工具，而是精确挑出它需要的那几个（无论它们分布在哪些服务器上），再用一个统一的名称把它们打包在一起。

## 工作原理

```
                    ┌─────────────────────────────────┐
                    │         MCP Toolset              │
                    │      "devtooling-prod"           │
                    └────────────┬────────────────────┘
                                 │
              ┌──────────────────┴──────────────────┐
              │                                     │
     ┌────────▼────────┐                  ┌────────▼────────┐
     │  CircleCI MCP   │                  │  DeepWiki MCP   │
     │  (10+ tools)    │                  │  (3 tools)      │
     └────────┬────────┘                  └────────┬────────┘
              │                                    │
    ┌─────────┴──────────┐              ┌──────────┴──────────┐
    │ ✓ get_build_logs   │              │ ✓ read_wiki_structure│
    │ ✓ find_flaky_tests │              │ ✓ read_wiki_contents │
    │ ✓ get_pipeline_    │              │ ✗ ask_question       │
    │   status           │              └─────────────────────┘
    │ ✓ run_pipeline     │
    │ ✗ list_followed_   │
    │   projects         │
    └────────────────────┘

        Agent sees exactly 6 tools, nothing more.
```

智能体拿到的不再是横跨两个服务器的 13+ 个工具，而是 6 个：正是它真正需要的那几个。

**为什么这很重要**：
- 更短的工具列表 → 更少的 token、更快的响应、更少的幻觉
- 把 GitHub、Linear、CircleCI 的工具合并为一个命名授权
- 像今天分配 MCP 服务器一样，把它们分配给密钥和团队

---

## 创建工具集

### 1. 进入 MCP 页面

在左侧边栏中点击 **MCP**。

![进入 MCP 页面](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/1a96c713-6a37-4f96-92f1-07bd58c1973c/ascreenshot_23515f386ccc4597b0633987667fe01f_text_export.jpeg)

### 2. 打开 Toolsets 标签页

在 MCP 页面上点击 **Toolsets** 标签页。

![点击 Toolsets 标签页](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/65b6986b-595a-4b28-8fdc-a7b36bc76e59/ascreenshot_ca70c18fe7ec415486f96a6b405bf550_text_export.jpeg)

### 3. 点击 “New Toolset”

![New Toolset 按钮](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/798c55c4-5d6b-4815-a642-70ac9f34f102/ascreenshot_3f144f54a1a944e28454239c837b4e6d_text_export.jpeg)

### 4. 输入名称

为工具集起一个名称。建议挑一个描述性强的名字，因为智能体引用的就是这个名字。

![输入工具集名称](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/62b412e0-d38f-44c3-99e4-3693f1512f6a/ascreenshot_b678c7c988a04f8b887b0f54c4dd95a7_text_export.jpeg)

![工具集名称输入框](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ba5ebc95-cab7-470b-a7c9-21f12b9b01a3/ascreenshot_a602e982a2a44890a83dca64d61c38eb_text_export.jpeg)

### 5. 添加第一个工具

在下拉列表中选择一个 MCP 服务器，然后从该服务器中挑选想要纳入的工具。

![选择 MCP 服务器](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/2aa5bcba-6414-42e3-9813-efb0a9078e32/ascreenshot_58fbff35ba654210a1b4dc5452aa6bd9_text_export.jpeg)

![从下拉列表中选择服务器](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/4fd9cffb-d3ba-461a-8679-89f278bf67ad/ascreenshot_b61e9e85a51b494a8d09fe61198d63e1_text_export.jpeg)

![从服务器中选择工具](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/60718e72-2062-494b-9a23-456992c88cbd/ascreenshot_7a1f8eeab30a4a05ba39c450e5458b78_text_export.jpeg)

### 6. 从第二个服务器添加工具

点击 **Add Tool**，换一个 MCP 服务器，再选择另一个工具。按需重复即可，工具可以来自任意多个服务器。

![从第二个服务器添加工具](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/f34e0600-cc74-4b18-8794-88d45f326144/ascreenshot_98834b14ab9343e39fb503e458d72b7c_text_export.jpeg)

![选择第二个服务器](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/75150368-2202-4da1-99f1-6f0620e9b133/ascreenshot_f94d0bc08ea147348a9cf021cce7d854_text_export.jpeg)

![从第二个服务器中选择工具](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ed2cdf6e-025d-4d50-8b12-ed68745d5c51/ascreenshot_0c1c7f76524b46c5a056fda5e6956e2b_text_export.jpeg)

### 7. 创建工具集

点击 **Create Toolset** 保存。

![创建 Toolset](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/021ca7b3-2d9a-49a0-8758-dae3dc3bcb4d/ascreenshot_14c6434e71114a6091e359a996f20e12_text_export.jpeg)

---

## 在 Playground 中使用工具集

创建完成后，你的工具集会与各 MCP 服务器一起出现在 Playground 的 **MCP Servers** 下拉列表中，选择方式完全相同。

### 1. 进入 Playground

![进入 Playground](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/f9d4aa4c-d98e-4767-b98e-aad2890e97ca/ascreenshot_d84239c441bb4e828f229d0c9e079e3f_text_export.jpeg)

![点击 Playground](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/d8a07563-97fe-453a-b974-88da46c87294/ascreenshot_ea494300a536400abb2ea6bf3bdfd5ab_text_export.jpeg)

### 2. 从 MCP Servers 中选择你的工具集

在左侧面板的 **MCP Servers** 下打开下拉列表，选中你的工具集。模型只会看到你纳入其中的那些工具。

![MCP Servers 下拉列表](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/ee8cb38c-c4ff-4b4b-844c-22f2e40832ae/ascreenshot_e300fb39cea0434fb5e3986e912a2b8d_text_export.jpeg)

![打开 MCP 服务器选择器](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/8672070c-5d07-4f63-878c-6fc7dcbc9b65/ascreenshot_326ddd0868224c99a6fa5dab2d144f1f_text_export.jpeg)

![选择工具集](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/955826ad-2bbb-403e-ab26-c1ac03ec2675/ascreenshot_13f837ad53574535986ca7ca5998d34a_text_export.jpeg)

![工具集已选中并生效](https://colony-recorder.s3.amazonaws.com/files/2026-03-22/9a59c3b9-1563-4731-838f-1c35d636ddc9/ascreenshot_c05d8fa5f37a4b3093fc46e26f293b4d_text_export.jpeg)

此时模型能访问的恰好就是工具集里的那些工具，其余一概不可见。

---

## 通过 API 使用工具集

把工具集的路由作为 `server_url` 传入你的 tools 列表即可。LiteLLM 会在服务端解析该路由，因此无需公开 URL。

<Tabs>
<TabItem value="responses" label="Responses API">

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://your-proxy/v1",
)

response = client.responses.create(
    model="{{openai_large}}",
    input="What CI/CD tools do you have?",
    tools=[
        {
            "type": "mcp",
            "server_label": "devtooling-prod",
            "server_url": "litellm_proxy/mcp/devtooling-prod",
            "require_approval": "never",
        }
    ],
)
print(response.output_text)
```

</TabItem>
<TabItem value="chat" label="Chat Completions API">

```python
import openai

client = openai.OpenAI(
    api_key="your-litellm-key",
    base_url="http://your-proxy/v1",
)

response = client.chat.completions.create(
    model="{{openai_large}}",
    messages=[{"role": "user", "content": "What CI/CD tools do you have?"}],
    tools=[
        {
            "type": "mcp",
            "server_label": "devtooling-prod",
            "server_url": "litellm_proxy/mcp/devtooling-prod",
            "require_approval": "never",
        }
    ],
)
print(response.choices[0].message.content)
```

</TabItem>
<TabItem value="rest" label="REST">

```bash
curl http://your-proxy/v1/responses \
  -H "Authorization: Bearer your-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "input": "What CI/CD tools do you have?",
    "tools": [
      {
        "type": "mcp",
        "server_label": "devtooling-prod",
        "server_url": "litellm_proxy/mcp/devtooling-prod",
        "require_approval": "never"
      }
    ]
  }'
```

</TabItem>
</Tabs>

---

## 通过 API 管理工具集

```bash
# 列出所有工具集
curl http://your-proxy/v1/mcp/toolset \
  -H "Authorization: Bearer your-litellm-key"

# 创建工具集
curl -X POST http://your-proxy/v1/mcp/toolset \
  -H "Authorization: Bearer your-litellm-key" \
  -H "Content-Type: application/json" \
  -d '{
    "toolset_name": "devtooling-prod",
    "description": "CircleCI + DeepWiki tools for the dev team",
    "tools": [
      {"server_id": "<circleci-server-id>", "tool_name": "get_build_failure_logs"},
      {"server_id": "<circleci-server-id>", "tool_name": "run_pipeline"},
      {"server_id": "<deepwiki-server-id>", "tool_name": "read_wiki_structure"}
    ]
  }'

# 删除工具集
curl -X DELETE http://your-proxy/v1/mcp/toolset/<toolset_id> \
  -H "Authorization: Bearer your-litellm-key"
```
