import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Oracle Cloud Infrastructure (OCI)
LiteLLM 支持 OCI 按需（on-demand）GenAI API 上的以下模型。

可查看 [OCI 模型列表](https://docs.oracle.com/en-us/iaas/Content/generative-ai/pretrained-models.htm)，确认你要用的模型在所在区域是否可用。

## 支持的模型

模型生命周期、退役日期与推荐的替代型号，参见 [OCI 按需模型退役页面](https://docs.oracle.com/en-us/iaas/Content/generative-ai/deprecating-on-demand.htm)。Oracle 是权威来源。

### 对话 / 文本生成

#### Meta Llama 模型
- `meta.llama-4-maverick-17b-128e-instruct-fp8`（多模态）
- `meta.llama-4-scout-17b-16e-instruct`（多模态）
- `meta.llama-3.3-70b-instruct`
- `meta.llama-3.3-70b-instruct-fp8-dynamic`
- `meta.llama-3.2-90b-vision-instruct`（多模态）
- `meta.llama-3.2-11b-vision-instruct`（多模态）

#### xAI Grok 模型
- `xai.grok-4.3`
- `xai.grok-4.20`
- `xai.grok-4.20-multi-agent`
- `xai.grok-4`
- `xai.grok-4-fast`
- `xai.grok-4.1-fast`
- `xai.grok-3`
- `xai.grok-3-fast`
- `xai.grok-3-mini`
- `xai.grok-3-mini-fast`
- `xai.grok-code-fast-1`

#### Cohere 模型
- `cohere.command-latest`
- `cohere.command-a-03-2025`
- `cohere.command-a-reasoning-08-2025`
- `cohere.command-a-vision-07-2025`（多模态）
- `cohere.command-a-translate-08-2025`
- `cohere.command-plus-latest`
- `cohere.command-r-plus-08-2024`
- `cohere.command-r-08-2024`

#### Google Gemini 模型（经 OCI 提供）
- `google.gemini-2.5-pro`（多模态）
- `google.gemini-2.5-flash`（多模态）
- `google.gemini-2.5-flash-lite`（多模态）

#### OpenAI 开源模型（经 OCI 提供）
- `openai.gpt-oss-120b`
- `openai.gpt-oss-20b`

### 嵌入模型
- `cohere.embed-v4.0`（1536 维，多模态）
- `cohere.embed-english-v3.0`（1024 维）
- `cohere.embed-english-light-v3.0`（384 维）
- `cohere.embed-multilingual-v3.0`（1024 维）
- `cohere.embed-multilingual-light-v3.0`（384 维）
- `cohere.embed-english-image-v3.0`（1024 维，多模态）
- `cohere.embed-english-light-image-v3.0`（384 维，多模态）
- `cohere.embed-multilingual-image-v3.0`（1024 维，多模态）
- `cohere.embed-multilingual-light-image-v3.0`（384 维，多模态）

## 认证

LiteLLM 为 OCI 提供两种认证方式：

### 方式一：手动凭据
把各项 OCI 凭据直接传给 LiteLLM。按 [Oracle 官方教程](https://docs.oracle.com/en-us/iaas/Content/API/Concepts/apisigningkey.htm) 创建签名密钥，获取以下参数：

- `user`
- `fingerprint`
- `tenancy`
- `region`
- `key_file` 或 `key`
- `compartment_id`

这是 LiteLLM AI 网关（LLM Proxy）访问 OCI GenAI 模型时的默认方式。

**环境变量**

除了在代码里传凭据，你也可以设置以下环境变量，LiteLLM 会自动读取：

```bash
export OCI_REGION="us-chicago-1"
export OCI_USER="ocid1.user.oc1.."
export OCI_FINGERPRINT="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx"
export OCI_TENANCY="ocid1.tenancy.oc1.."
export OCI_COMPARTMENT_ID="ocid1.compartment.oc1.."
# Provide either the private key content OR the path to the key file:
export OCI_KEY_FILE="/path/to/oci_api_key.pem"
# export OCI_KEY="-----BEGIN PRIVATE KEY-----\n..."
```

### 方式二：OCI SDK Signer
使用 OCI SDK 的 `Signer` 对象完成认证。这种方式：
- 采用官方 [OCI SDK 签名](https://docs.oracle.com/en-us/iaas/tools/python/latest/api/signing.html)
- 支持更多认证方式（实例主体、工作负载身份等）

使用前先安装 OCI SDK：
```bash
uv add oci
```

在 Oracle Cloud Infrastructure 的实例或 Oracle Kubernetes Engine 上使用 LiteLLM SDK 时，可以选择这种方式。

## 区域与政府域

LiteLLM 按固定格式拼出推理端点：`https://inference.generativeai.{region}.oci.{realm_domain}`。区域取自 `oci_region`（或环境变量 `OCI_REGION`，默认为 `us-ashburn-1`）。域名部分取决于该区域由哪个 OCI realm（域）承载：商业域（OC1）对应 `oraclecloud.com`，美国政府域（OC2 与 OC3）对应 `oraclegovcloud.com`，英国政府域（OC4）对应 `oraclegovcloud.uk`，OCI SDK 已知的其余域也各有对应域名。因此，发往 `us-luke-1` 的请求会自动指向 `https://inference.generativeai.us-luke-1.oci.oraclegovcloud.com`，无需任何端点配置。

LiteLLM 会依次尝试以下来源，取第一个命中者作为 realm 域名：

1. `oci_compartment_id` 中的 realm 键。每个 OCID 的第三段都携带该键，因此 `ocid1.compartment.oc2..` 会选中美国政府域，`ocid1.compartment.oc1..` 则对应商业域。
2. OCI Python SDK 的区域注册表（`oci.regions`），前提是已安装 `oci` 包。
3. OCI SDK 同样会读取的区域元数据：先看 `~/.oci/regions-config.json`（JSON 数组），再看 `OCI_REGION_METADATA` 环境变量（单个 JSON 对象）。其中 `regionIdentifier` 与目标区域匹配的条目会提供 `realmDomainComponent`。
4. 商业域兜底，即 `oraclecloud.com`。

设置 `api_base` 会完全跳过这一解析流程，参见[用 api_base 覆盖端点](#用-api_base-覆盖端点)。

由于 compartment OCID 本身已标明所属域，政府域部署所需的参数与商业域完全相同：

<Tabs>
<TabItem value="gov-sdk" label="SDK" default>

```python
from litellm import completion

response = completion(
    model="oci/meta.llama-3.3-70b-instruct",
    messages=[{"role": "user", "content": "Hello"}],
    oci_region="us-luke-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="ocid1.compartment.oc2..",
)
```

</TabItem>
<TabItem value="gov-proxy" label="PROXY">

```yaml
model_list:
  - model_name: oci-gov-llama
    litellm_params:
      model: oci/meta.llama-3.3-70b-instruct
      oci_region: us-luke-1
      oci_user: os.environ/OCI_USER
      oci_fingerprint: os.environ/OCI_FINGERPRINT
      oci_tenancy: os.environ/OCI_TENANCY
      oci_key_file: os.environ/OCI_KEY_FILE
      oci_compartment_id: os.environ/OCI_COMPARTMENT_ID
```

</TabItem>
</Tabs>

只有当 `oci_compartment_id` 缺失，或它不是带 LiteLLM 可识别 realm 键的 OCID 时，来源 2 和 3 才会生效。未通过校验的元数据条目会被跳过并给出警告，而不是让请求直接失败；没有任何来源描述的区域则沿用商业域端点，因此政府域模型绝不会改变同一代理上其他 OCI 模型的端点。

### 用 api_base 覆盖端点

设置 `api_base` 可以把请求发往指定主机，例如尚未被 LiteLLM 识别的 realm、私有端点，或架在 OCI 前面的网关。LiteLLM 会按原样使用该值，并自行追加操作路径（对话用 `/20231130/actions/chat`，嵌入用 `/20231130/actions/embedText`）。如果 `api_base` 已经以这些路径之一结尾，会先去掉这一后缀，避免 URL 重复。请求仍会用你的 OCI 凭据对 `api_base` 指定的主机进行签名，`oci_region` 不再影响 URL。

<Tabs>
<TabItem value="api-base-sdk" label="SDK" default>

```python
from litellm import completion

response = completion(
    model="oci/meta.llama-3.3-70b-instruct",
    messages=[{"role": "user", "content": "Hello"}],
    api_base="https://inference.generativeai.us-gov-ashburn-1.oci.oraclegovcloud.com",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)
```

</TabItem>
<TabItem value="api-base-proxy" label="PROXY">

```yaml
model_list:
  - model_name: oci-gov-llama
    litellm_params:
      model: oci/meta.llama-3.3-70b-instruct
      api_base: https://inference.generativeai.us-gov-ashburn-1.oci.oraclegovcloud.com
      oci_user: os.environ/OCI_USER
      oci_fingerprint: os.environ/OCI_FINGERPRINT
      oci_tenancy: os.environ/OCI_TENANCY
      oci_key_file: os.environ/OCI_KEY_FILE
      oci_compartment_id: os.environ/OCI_COMPARTMENT_ID
```

</TabItem>
</Tabs>

## 用法

<Tabs>
<TabItem value="manual" label="手动凭据" default>

把创建 OCI 签名密钥过程中获得的参数填入 `completion` 函数：

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_region="<your_oci_region>",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    # Provide either the private key string OR the path to the key file:
    # Option 1: pass the private key as a string
    oci_key="<string_with_content_of_oci_key>",
    # Option 2: pass the private key file path
    # oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
<TabItem value="oci-sdk" label="OCI SDK Signer">

使用 OCI SDK 的 `Signer` 进行认证：

```python
from litellm import completion
from oci.signer import Signer

# Create an OCI Signer
signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
    # Or use private_key_content="<your_private_key_content>"
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",  # Optional, defaults to us-ashburn-1
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**备选方式：使用 OCI 配置文件**

OCI SDK 可以自动从 `~/.oci/config` 加载凭据：

```python
from litellm import completion
from oci.config import from_file
from oci.signer import Signer

# Load config from file
config = from_file("~/.oci/config", "DEFAULT")  # "DEFAULT" is the profile name
signer = Signer(
    tenancy=config["tenancy"],
    user=config["user"],
    fingerprint=config["fingerprint"],
    private_key_file_location=config["key_file"],
    pass_phrase=config.get("pass_phrase")  # Optional if key is encrypted
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region=config["region"],
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**实例主体认证**

适用于运行在 OCI 计算实例上的应用：

```python
from litellm import completion
from oci.auth.signers import InstancePrincipalsSecurityTokenSigner

# Use instance principal authentication
signer = InstancePrincipalsSecurityTokenSigner()

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

**工作负载身份认证**

适用于运行在 Oracle Kubernetes Engine（OKE）中的应用：

```python
from litellm import completion
from oci.auth.signers import get_oke_workload_identity_resource_principal_signer

# Use workload identity authentication
signer = get_oke_workload_identity_resource_principal_signer()

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```
</TabItem>
</Tabs>

## LiteLLM 代理用法

下面演示如何通过 LiteLLM 代理服务器（Proxy Server）调用 OCI GenAI。

### 1. 配置 config.yaml

```yaml
model_list:
  - model_name: oci-grok-4
    litellm_params:
      model: oci/xai.grok-4
      oci_region: os.environ/OCI_REGION
      oci_user: os.environ/OCI_USER
      oci_fingerprint: os.environ/OCI_FINGERPRINT
      oci_tenancy: os.environ/OCI_TENANCY
      oci_key_file: os.environ/OCI_KEY_FILE
      oci_compartment_id: os.environ/OCI_COMPARTMENT_ID

  - model_name: oci-cohere-command
    litellm_params:
      model: oci/cohere.command-latest
      oci_region: os.environ/OCI_REGION
      oci_user: os.environ/OCI_USER
      oci_fingerprint: os.environ/OCI_FINGERPRINT
      oci_tenancy: os.environ/OCI_TENANCY
      oci_key_file: os.environ/OCI_KEY_FILE
      oci_compartment_id: os.environ/OCI_COMPARTMENT_ID
```

全部可用的认证参数：

```
oci_region: Optional[str],
oci_user: Optional[str],
oci_fingerprint: Optional[str],
oci_tenancy: Optional[str],
oci_key: Optional[str],          # private key content as string
oci_key_file: Optional[str],     # path to .pem file
oci_compartment_id: Optional[str],
oci_serving_mode: Optional[str], # "ON_DEMAND" (default) or "DEDICATED"
oci_endpoint_id: Optional[str],  # only used with DEDICATED
```

### 2. 启动代理

```bash
litellm --config /path/to/config.yaml
```

### 3. 测试

<Tabs>
<TabItem value="Curl" label="Curl 请求">

```shell
curl --location 'http://0.0.0.0:4000/chat/completions' \
--header 'Content-Type: application/json' \
--data '{
  "model": "oci-grok-4",
  "messages": [
    {"role": "user", "content": "what llm are you"}
  ]
}'
```

</TabItem>
<TabItem value="openai" label="OpenAI v1.0.0+">

```python
import openai

client = openai.OpenAI(
    api_key="anything",
    base_url="http://0.0.0.0:4000"
)

response = client.chat.completions.create(
    model="oci-grok-4",
    messages=[{"role": "user", "content": "write a short poem"}],
)
print(response)
```

</TabItem>
</Tabs>

## 用法 - 流式
调用 completion 时设置 `stream=True` 即可。

<Tabs>
<TabItem value="manual-stream" label="手动凭据" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    stream=True,
    oci_region="<your_oci_region>",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_serving_mode="ON_DEMAND",  # Optional, default is "ON_DEMAND". Other option is "DEDICATED"
    # Provide either the private key string OR the path to the key file:
    # Option 1: pass the private key as a string
    oci_key="<string_with_content_of_oci_key>",
    # Option 2: pass the private key file path
    # oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

</TabItem>
<TabItem value="oci-sdk-stream" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",
    messages=messages,
    stream=True,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
for chunk in response:
    print(chunk["choices"][0]["delta"]["content"])  # same as openai format
```

</TabItem>
</Tabs>

## 按模型类型的用法示例

### 使用 Cohere 模型

<Tabs>
<TabItem value="cohere-manual" label="手动凭据" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Explain quantum computing"}]
response = completion(
    model="oci/cohere.command-latest",
    messages=messages,
    oci_region="us-chicago-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key="<string_with_content_of_oci_key>",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
<TabItem value="cohere-sdk" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Explain quantum computing"}]
response = completion(
    model="oci/cohere.command-latest",
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

## 使用专用端点

OCI 支持以专用端点（dedicated endpoint）的方式托管模型。搭配使用 `oci_serving_mode="DEDICATED"` 参数与 `oci_endpoint_id` 来指定端点 ID。

<Tabs>
<TabItem value="dedicated-manual" label="手动凭据" default>

```python
from litellm import completion

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",  # Must match the model type hosted on the endpoint
    messages=messages,
    oci_region="<your_oci_region>",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your dedicated endpoint OCID
    oci_key="<string_with_content_of_oci_key>",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
<TabItem value="dedicated-sdk" label="OCI SDK Signer">

```python
from litellm import completion
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

messages = [{"role": "user", "content": "Hey! how's it going?"}]
response = completion(
    model="oci/xai.grok-4",  # Must match the model type hosted on the endpoint
    messages=messages,
    oci_signer=signer,
    oci_region="us-chicago-1",
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your dedicated endpoint OCID
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

**注意**：使用 `oci_serving_mode="DEDICATED"` 时：
- `model` 参数**必须与专用端点上托管的模型类型一致**（例如 Cohere 模型用 `"oci/cohere.command-latest"`，Grok 模型用 `"oci/xai.grok-4"`）
- 模型名决定了 API 格式与各厂商的特定处理逻辑（Cohere 与 Generic 之分）
- `oci_endpoint_id` 参数指定专用端点的 OCID
- 若未提供 `oci_endpoint_id`，`model` 参数会被当作端点 ID 使用（出于向后兼容）

**Cohere 专用端点示例**：
```python
# For a dedicated endpoint hosting a Cohere model
response = completion(
    model="oci/cohere.command-latest",  # Use Cohere model name to get Cohere API format
    messages=messages,
    oci_region="us-chicago-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",  # Your Cohere endpoint OCID
    oci_key="<string_with_content_of_oci_key>",
    oci_compartment_id="<oci_compartment_id>",
)
```

## 用法 - 函数调用 / 工具调用

OCI GenAI 支持与 OpenAI 兼容的函数调用（function calling）。LiteLLM 会把请求与响应的结构归一化，因此面向 OpenAI 编写的同一份代码可以直接用于 OCI 的 Cohere 与 Generic（xAI Grok、Meta Llama、Google Gemini）模型。

<Tabs>
<TabItem value="tool-sdk" label="SDK">

```python
from litellm import completion

tools = [
    {
        "type": "function",
        "function": {
            "name": "get_current_weather",
            "description": "Get the current weather in a given location",
            "parameters": {
                "type": "object",
                "properties": {
                    "location": {
                        "type": "string",
                        "description": "The city and state, e.g. San Francisco, CA",
                    },
                    "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                },
                "required": ["location"],
            },
        },
    }
]

response = completion(
    model="oci/xai.grok-4",
    messages=[{"role": "user", "content": "What's the weather in Boston today?"}],
    tools=tools,
    tool_choice="auto",
    oci_region="us-chicago-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)

# Inspect the tool call
print(response.choices[0].message.tool_calls)
```

</TabItem>
<TabItem value="tool-proxy" label="PROXY">

```python
import openai

client = openai.OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="oci-grok-4",
    messages=[{"role": "user", "content": "What's the weather in Boston today?"}],
    tools=[
        {
            "type": "function",
            "function": {
                "name": "get_current_weather",
                "description": "Get the current weather in a given location",
                "parameters": {
                    "type": "object",
                    "properties": {
                        "location": {"type": "string"},
                        "unit": {"type": "string", "enum": ["celsius", "fahrenheit"]},
                    },
                    "required": ["location"],
                },
            },
        }
    ],
    tool_choice="auto",
)
print(response.choices[0].message.tool_calls)
```

</TabItem>
</Tabs>

工具调用同时适用于 Cohere（`cohere.command-*`）与 Generic（`xai.grok-*`、`meta.llama-*`、`google.gemini-*`）两个模型族。LiteLLM 会在内部把 OpenAI 的工具 schema 适配为各厂商的原生格式。

## 用法 - 视觉 / 多模态

OCI GenAI 提供支持视觉的模型，可以在文本之外接收图像。图像通过标准的 OpenAI `image_url` 内容块传入。

```python
from litellm import completion

response = completion(
    model="oci/meta.llama-4-maverick-17b-128e-instruct-fp8",
    messages=[
        {
            "role": "user",
            "content": [
                {"type": "text", "text": "What is in this image?"},
                {
                    "type": "image_url",
                    "image_url": {
                        "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/d/dd/Gfp-wisconsin-madison-the-nature-boardwalk.jpg/2560px-Gfp-wisconsin-madison-the-nature-boardwalk.jpg"
                    },
                },
            ],
        }
    ],
    oci_region="us-chicago-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)
print(response.choices[0].message.content)
```

OCI 上支持视觉的模型包括：

- `meta.llama-4-maverick-17b-128e-instruct-fp8`
- `meta.llama-4-scout-17b-16e-instruct`
- `meta.llama-3.2-11b-vision-instruct`
- `meta.llama-3.2-90b-vision-instruct`
- `cohere.command-a-vision-07-2025`
- `google.gemini-2.5-pro`, `google.gemini-2.5-flash`, `google.gemini-2.5-flash-lite`

URL 与 base64 编码的 data URI 均可使用。

## 用法 - 推理 / 思考

OCI 的 Generic 厂商模型（xAI Grok 推理变体、Google Gemini 等）支持推理步骤。LiteLLM 通过与 OpenAI 兼容的 `reasoning_effort` 参数暴露这一能力；可取值为 `"low"`、`"medium"`、`"high"` 和 `"disable"`（映射到 OCI 的 `NONE`）。

返回的推理 token 会体现在 `usage.completion_tokens_details.reasoning_tokens` 上，与 OpenAI 的结构一致。

<Tabs>
<TabItem value="reasoning-sdk" label="SDK">

```python
from litellm import completion

response = completion(
    model="oci/xai.grok-3-mini",
    messages=[{"role": "user", "content": "If 3x + 7 = 22, what is x? Show your reasoning."}],
    reasoning_effort="high",  # "low" | "medium" | "high" | "disable"
    oci_region="us-chicago-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key_file="<path/to/oci_key.pem>",
    oci_compartment_id="<oci_compartment_id>",
)

print(response.choices[0].message.content)
print("Reasoning tokens:", response.usage.completion_tokens_details.reasoning_tokens)
```

</TabItem>
<TabItem value="reasoning-proxy" label="PROXY">

```python
import openai

client = openai.OpenAI(api_key="anything", base_url="http://0.0.0.0:4000")

response = client.chat.completions.create(
    model="oci-grok-mini",
    messages=[{"role": "user", "content": "If 3x + 7 = 22, what is x?"}],
    reasoning_effort="high",
)
print(response.choices[0].message.content)
```

</TabItem>
</Tabs>

:::note
`reasoning_effort` 仅对 Generic 厂商的推理模型生效（例如 `xai.grok-3-mini`、`xai.grok-4`、`google.gemini-2.5-pro`）。OCI Cohere 模型不是推理模型，该参数会被静默忽略。
:::

## 可选参数

| 参数 | 类型 | 默认值 | 环境变量 | 说明 |
|-----------|------|---------|----------------------|-------------|
| `oci_region` | string | `us-ashburn-1` | `OCI_REGION` | GenAI 服务部署所在的 OCI 区域 |
| `oci_serving_mode` | string | `ON_DEMAND` | – | 服务模式：托管模型用 `ON_DEMAND`，专用端点用 `DEDICATED` |
| `oci_endpoint_id` | string | Same as `model` | – | （DEDICATED 模式下）专用端点的 OCID |
| `oci_compartment_id` | string | **Required** | `OCI_COMPARTMENT_ID` | 包含你资源的 OCI compartment 的 OCID |
| `oci_user` | string | – | `OCI_USER` | （手动认证）OCI 用户的 OCID |
| `oci_fingerprint` | string | – | `OCI_FINGERPRINT` | （手动认证）API 签名密钥的指纹 |
| `oci_tenancy` | string | – | `OCI_TENANCY` | （手动认证）你 OCI tenancy 的 OCID |
| `oci_key` | string | – | `OCI_KEY` | （手动认证）以字符串形式提供的私钥内容 |
| `oci_key_file` | string | – | `OCI_KEY_FILE` | （手动认证）私钥文件路径 |
| `oci_signer` | object | – | – | （SDK 认证）用于认证的 OCI SDK Signer 对象 |
| `reasoning_effort` | string | – | – | Generic 厂商推理模型的推理力度：`low`、`medium`、`high`、`disable` |

## 嵌入

LiteLLM 支持 OCI Generative AI 的嵌入模型。这些模型沿用上文介绍的认证方式。

<Tabs>
<TabItem value="embed-manual" label="手动凭据" default>

```python
from litellm import embedding

response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world", "Goodbye world"],
    oci_region="us-ashburn-1",
    oci_user="<your_oci_user>",
    oci_fingerprint="<your_oci_fingerprint>",
    oci_tenancy="<your_oci_tenancy>",
    oci_key="<string_with_content_of_oci_key>",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
<TabItem value="embed-sdk" label="OCI SDK Signer">

```python
from litellm import embedding
from oci.signer import Signer

signer = Signer(
    tenancy="ocid1.tenancy.oc1..",
    user="ocid1.user.oc1..",
    fingerprint="xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx:xx",
    private_key_file_location="~/.oci/key.pem",
)

response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world", "Goodbye world"],
    oci_signer=signer,
    oci_region="us-ashburn-1",
    oci_compartment_id="<oci_compartment_id>",
)
print(response)
```

</TabItem>
</Tabs>

### 嵌入可选参数

| 参数 | 类型 | 默认值 | 说明 |
|-----------|------|---------|-------------|
| `input_type` | string | - | 输入类型：`search_document`、`search_query`、`classification`、`clustering` |
| `truncate` | string | `END` | 输入超过最大 token 数时的截断策略：`END` 或 `START` |

### 使用专用嵌入端点

```python
response = embedding(
    model="oci/cohere.embed-english-v3.0",
    input=["Hello world"],
    oci_serving_mode="DEDICATED",
    oci_endpoint_id="ocid1.generativeaiendpoint.oc1...",
    oci_region="us-ashburn-1",
    oci_compartment_id="<oci_compartment_id>",
    # ... auth params
)
```
