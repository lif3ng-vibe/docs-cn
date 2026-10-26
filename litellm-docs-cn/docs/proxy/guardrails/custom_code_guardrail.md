import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# 自定义代码防护栏

用类 Python 代码编写自定义防护栏（guardrail）逻辑，代码在沙箱环境中运行。

## 快速上手

### 1. 在配置中定义防护栏

```yaml
model_list:
    - model_name: {{openai_large}}
      litellm_params:
        model: {{openai_large}}
        api_key: os.environ/OPENAI_API_KEY

guardrails:
    - guardrail_name: block-ssn
      litellm_params:
        guardrail: custom_code
        mode: pre_call
        custom_code: |
            def apply_guardrail(inputs, request_data, input_type):
                for text in inputs["texts"]:
                    if regex_match(text, r"\d{3}-\d{2}-\d{4}"):
                        return block("SSN detected")
                return allow()
```

### 2. 启动代理

```bash
litellm --config config.yaml
```

### 3. 测试

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "My SSN is 123-45-6789"}],
    "guardrails": ["block-ssn"]
  }'
```

## 配置

| 参数 | 类型 | 必填 | 说明 |
|-----------|------|----------|-------------|
| `guardrail` | string | ✅ | 必须为 `custom_code` |
| `mode` | string | ✅ | 运行时机：`pre_call`、`post_call`、`during_call` |
| `custom_code` | string | ✅ | 包含 `apply_guardrail` 函数的类 Python 代码 |
| `default_on` | bool | ❌ | 对所有请求运行（默认值：`false`） |
| `timeout` | float | ❌ | 单次运行 `apply_guardrail`（含模块级代码）的墙钟时间上限，单位为秒（默认值：`30`）。超时的运行会让请求失败，而不是让代理一直卡住。参见[执行超时](#执行超时) |

## 编写自定义代码

### 函数签名

代码中必须定义一个 `apply_guardrail` 函数，同步或异步均可：

```python
# Sync version
def apply_guardrail(inputs, request_data, input_type):
    # inputs: see table below
    # request_data: {"model": "...", "user_id": "...", "team_id": "...", "metadata": {...}}
    # input_type: "request" or "response"
    
    return allow()  # or block(), flag() or modify()

# Async version (recommended when using HTTP primitives)
async def apply_guardrail(inputs, request_data, input_type):
    response = await http_post("https://api.example.com/check", body={"text": inputs["texts"][0]})
    if response["success"] and response["body"].get("flagged"):
        return block("Content flagged")
    return allow()
```

### `inputs` 参数

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `texts` | `List[str]` | 从请求/响应中提取的文本 |
| `images` | `List[str]` | 提取出的图片（用于图片防护栏） |
| `tools` | `List[dict]` | 发送给 LLM 的工具 |
| `tool_calls` | `List[dict]` | LLM 返回的工具调用 |
| `structured_messages` | `List[dict]` | 带角色信息（system/user/assistant）的完整消息 |
| `model` | `str` | 当前使用的模型 |

### `request_data` 参数

| 字段 | 类型 | 说明 |
|-------|------|-------------|
| `model` | `str` | 模型名称 |
| `user_id` | `str` | API 密钥对应的用户 ID |
| `team_id` | `str` | API 密钥对应的团队 ID |
| `end_user_id` | `str` | 终端用户 ID |
| `metadata` | `dict` | 请求元数据 |

### 返回值

| 函数 | 说明 |
|----------|-------------|
| `allow()` | 放行请求/响应 |
| `block(reason)` | 拒绝请求并附带原因消息 |
| `flag(reason, metadata={})` | 请求/响应原样放行，但记录一条不阻断的违规 |
| `modify(texts=[], images=[], tool_calls=[])` | 改写内容 |

### 标记而不拦截

`flag(reason, metadata={...})` 用于纯审计或监控模式的防护栏。请求或响应会与使用 `allow()` 时完全一样继续处理，同时防护栏会在请求的防护栏信息中记录一条 `guardrail_flagged` 条目，内容包括防护栏名称、配置的 `mode`、被评估的 `input_type`（`request` 或 `response`）、`reason` 以及你传入的结构化 `metadata`。流式与非流式请求的处理方式相同。

在防护栏监控（Guardrails Monitor）中，被标记的请求计为 flagged，而非放行或拦截；在请求日志（Request Logs）中，防护栏那一行会显示 `flagged`（当同一防护栏同时在 `pre_call` 和 `post_call` 上运行时，该行显示两者中更严重的结果）。请求级的 `guardrail_status` 会变为 `guardrail_flagged`，除非同一请求上还有其他防护栏发生了拦截或失败，此时以那个状态为准。

```yaml
guardrails:
  - guardrail_name: audit-competitor-mentions
    litellm_params:
      guardrail: custom_code
      mode: [pre_call, post_call]
      default_on: true
      custom_code: |
        def apply_guardrail(inputs, request_data, input_type):
            for text in inputs["texts"]:
                if contains_any(lower(text), ["acme", "globex"]):
                    return flag(
                        "competitor mentioned",
                        metadata={"category": "competitor", "phase": input_type},
                    )
            return allow()
```

记录的条目在 `standard_logging_guardrail_information` 中如下所示：

```json
{
  "guardrail_name": "audit-competitor-mentions",
  "guardrail_mode": ["pre_call", "post_call"],
  "guardrail_status": "guardrail_flagged",
  "guardrail_response": {
    "action": "flag",
    "reason": "competitor mentioned",
    "input_type": "request",
    "metadata": {"category": "competitor", "phase": "request"}
  }
}
```

## 内置原语

### 正则表达式

| 函数 | 说明 |
|----------|-------------|
| `regex_match(text, pattern)` | 找到匹配时返回 `True` |
| `regex_replace(text, pattern, replacement)` | 替换所有匹配项 |
| `regex_find_all(text, pattern)` | 返回所有匹配项的列表 |

### JSON

| 函数 | 说明 |
|----------|-------------|
| `json_parse(text)` | 解析 JSON 字符串，出错时返回 `None` |
| `json_stringify(obj)` | 转换为 JSON 字符串 |
| `json_schema_valid(obj, schema)` | 按 JSON schema 校验 |

### URL

| 函数 | 说明 |
|----------|-------------|
| `extract_urls(text)` | 从文本中提取所有 URL |
| `is_valid_url(url)` | 检查 URL 是否有效 |
| `all_urls_valid(text)` | 检查文本中的所有 URL 是否都有效 |

### 代码检测

| 函数 | 说明 |
|----------|-------------|
| `detect_code(text)` | 检测到代码时返回 `True` |
| `detect_code_languages(text)` | 返回检测到的语言列表 |
| `contains_code_language(text, ["sql", "python"])` | 检查是否包含指定语言 |

### 文本工具

| 函数 | 说明 |
|----------|-------------|
| `contains(text, substring)` | 检查子串是否存在 |
| `contains_any(text, [substr1, substr2])` | 检查任一子串是否存在 |
| `word_count(text)` | 统计词数 |
| `char_count(text)` | 统计字符数 |
| `lower(text)` / `upper(text)` / `trim(text)` | 字符串变换 |

### HTTP 请求（异步）

向外部 API 发起异步 HTTP 请求，用于额外的校验或内容审核。

| 函数 | 说明 |
|----------|-------------|
| `await http_request(url, method, headers, body, timeout)` | 通用异步 HTTP 请求 |
| `await http_get(url, headers, timeout)` | 异步 GET 请求 |
| `await http_post(url, body, headers, timeout)` | 异步 POST 请求 |

**响应格式**：
```python
{
    "status_code": 200,        # HTTP status code
    "body": {...},             # Response body (parsed JSON or string)
    "headers": {...},          # Response headers
    "success": True,           # True if status code is 2xx
    "error": None              # Error message if request failed
}
```

**注意**：使用 HTTP 原语时，请将函数定义为 `async def apply_guardrail(...)`，以保证非阻塞执行。

#### 屏蔽目标地址

每个 URL（包括重定向的每一跳）在建立连接前都要经过代理的 SSRF 校验。私有地址（RFC 1918）、回环地址、链路本地地址和云元数据地址都会被拒绝，此时原语返回一个错误响应而不是抛出异常：

```python
{
    "status_code": 0,
    "body": None,
    "headers": {},
    "success": False,
    "error": "Blocked URL: URL targets a blocked address (169.254.169.254). If this is a legitimate internal service, add the host to `user_url_allowed_hosts` in litellm_settings."
}
```

要让防护栏调用内部服务，请在 `litellm_settings` 下列出其主机名（按 URL 中的写法填写，URL 带端口时须连同端口一并写上）：

```yaml
litellm_settings:
  user_url_allowed_hosts:
    - moderation.corp.internal
    - 10.0.0.12:8080
```

`user_url_validation: false` 会为整个代理关闭这项检查。这两项设置的说明见[配置设置](../config_settings#litellm_settings-参考)。GET 请求会跟随重定向并逐跳校验；POST、PUT、PATCH 和 DELETE 绝不跟随重定向，因此收到 3xx 时会原样返回该响应。

### 执行超时

`apply_guardrail` 的每次运行都受 `timeout`（默认 30 秒）限制，防护栏加载时执行的模块级代码同样受限。同步函数在 worker 线程上运行，因此忙循环不会卡住代理的事件循环；防护栏代码中的每个 `while` 条件测试、`for` 迭代和推导式都会检查时间预算，因此从不让出也从不 await 的循环同样会在截止时刻停止。异步函数以同样的方式被检查，不需要任何 `await` 点。超出预算的运行会让请求失败，报错 `Custom code guardrail '<name>' exceeded its 30s execution timeout`；编译期代码超出预算则会导致该防护栏加载失败。

```yaml
guardrails:
  - guardrail_name: "slow-moderation"
    litellm_params:
      guardrail: custom_code
      mode: "pre_call"
      timeout: 10
      custom_code: |
        async def apply_guardrail(inputs, request_data, input_type):
            result = await http_post("https://moderation.example.com/check", body={"texts": inputs["texts"]})
            if result["success"] and result["body"].get("flagged"):
                return block("Flagged by moderation service")
            return allow()
```

`http_request` 的 `timeout` 参数限制的是单次 HTTP 调用（默认 30 秒，上限 60 秒），并会计入本次运行的时间预算。

## 示例

### 拦截 PII（SSN）

```python
def apply_guardrail(inputs, request_data, input_type):
    for text in inputs["texts"]:
        if regex_match(text, r"\d{3}-\d{2}-\d{4}"):
            return block("SSN detected")
    return allow()
```

### 邮箱地址脱敏

```python
def apply_guardrail(inputs, request_data, input_type):
    pattern = r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}"
    modified = []
    for text in inputs["texts"]:
        modified.append(regex_replace(text, pattern, "[EMAIL REDACTED]"))
    return modify(texts=modified)
```

### 拦截 SQL 注入

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "request":
        return allow()
    for text in inputs["texts"]:
        if contains_code_language(text, ["sql"]):
            return block("SQL code not allowed")
    return allow()
```

### 校验 JSON 响应

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "response":
        return allow()
    
    schema = {
        "type": "object",
        "required": ["name", "value"]
    }
    
    for text in inputs["texts"]:
        obj = json_parse(text)
        if obj is None:
            return block("Invalid JSON response")
        if not json_schema_valid(obj, schema):
            return block("Response missing required fields")
    return allow()
```

### 检查响应中的 URL

```python
def apply_guardrail(inputs, request_data, input_type):
    if input_type != "response":
        return allow()
    for text in inputs["texts"]:
        if not all_urls_valid(text):
            return block("Response contains invalid URLs")
    return allow()
```

### 调用外部内容审核 API（异步）

```python
async def apply_guardrail(inputs, request_data, input_type):
    # Call an external moderation API
    for text in inputs["texts"]:
        response = await http_post(
            "https://api.example.com/moderate",
            body={"text": text, "user_id": request_data["user_id"]},
            headers={"Authorization": "Bearer YOUR_API_KEY"},
            timeout=10
        )
        
        if not response["success"]:
            # API call failed - decide whether to allow or block
            return allow()
        
        if response["body"].get("flagged"):
            return block(response["body"].get("reason", "Content flagged"))
    
    return allow()
```

### 组合多重检查

```python
def apply_guardrail(inputs, request_data, input_type):
    modified = []
    
    for text in inputs["texts"]:
        # Redact SSN
        text = regex_replace(text, r"\d{3}-\d{2}-\d{4}", "[SSN]")
        # Redact credit cards
        text = regex_replace(text, r"\d{16}", "[CARD]")
        modified.append(text)
    
    # Block SQL in requests
    if input_type == "request":
        for text in inputs["texts"]:
            if contains_code_language(text, ["sql"]):
                return block("SQL injection blocked")
    
    return modify(texts=modified)
```

## 沙箱限制

自定义代码运行在受限环境中：

- ❌ 不能使用 `import` 语句
- ❌ 不能进行文件 I/O
- ❌ 不能使用 `exec()` 或 `eval()`
- ✅ 可通过内置的 `http_request`、`http_get`、`http_post` 原语发起 HTTP 请求，目标限于公网地址或 `user_url_allowed_hosts` 中列出的主机（参见[屏蔽目标地址](#屏蔽目标地址)）
- ✅ 只有 LiteLLM 提供的原语可用
- ⏱ 每次运行都受防护栏 `timeout` 的限制（参见[执行超时](#执行超时)）

## 按请求启用

在单个请求上启用防护栏：

```bash
curl -X POST http://localhost:4000/chat/completions \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "model": "{{openai_large}}",
    "messages": [{"role": "user", "content": "Hello"}],
    "guardrails": ["block-ssn"]
  }'
```

## 默认启用

在顶层 `guardrails` 条目上设置 `default_on: true`，即可让该防护栏对所有请求生效：

```yaml
guardrails:
  - guardrail_name: block-ssn
    litellm_params:
      guardrail: custom_code
      mode: pre_call
      default_on: true
      custom_code: |
        def apply_guardrail(inputs, request_data, input_type):
            ...
```
