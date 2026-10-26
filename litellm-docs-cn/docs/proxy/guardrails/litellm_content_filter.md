import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';
import Image from '@theme/IdealImage';


# LiteLLM Content Filter（内置防护栏）

**内置防护栏**（guardrail）：基于正则模式与关键词匹配来检测并过滤敏感信息，无需任何外部依赖。

**何时使用**？适合无需机器学习模型就能识别敏感信息的场景。

## 概述

| 属性 | 说明 |
|----------|---------|
| 描述 | 本地运行的防护栏，使用正则模式与关键词匹配检测并过滤敏感信息。内置于 LiteLLM，无外部依赖。 |
| 防护栏名称 | `litellm_content_filter` |
| 检测方式 | 内置正则模式、自定义正则、关键词匹配 |
| 处理动作 | `BLOCK`（拒绝请求）、`MASK`（脱敏内容） |
| 支持模式 | `pre_call`、`post_call`、`during_call`（流式） |
| 性能 | 快速：本地运行，不调用外部 API |

## 快速上手

## LiteLLM 管理界面

### 步骤 1：选择 LiteLLM Content Filter

点击 "Add New Guardrail"，然后选择 "LiteLLM Content Filter" 作为防护栏提供商。

<Image img={require('../../../img/create_guard.gif')} alt="选择 LiteLLM Content Filter" />

### 步骤 2：配置模式检测

选择需要屏蔽或脱敏的内置实体。本例中选择 "Email"，用于检测并屏蔽电子邮件地址。

如需屏蔽自定义实体，可点击 "Add custom regex" 添加自定义正则模式。

<Image img={require('../../../img/add_Guard2.gif')} alt="选择内置实体或添加自定义正则" />

### 步骤 3：添加屏蔽关键词

输入你想屏蔽的具体关键词。如果有屏蔽某些词语或短语的规定，这一步会很有用。

<Image img={require('../../../img/create_guard3.gif')} alt="添加屏蔽关键词" />

### 步骤 4：测试防护栏

创建防护栏后，前往 "Test Playground" 测试，选择刚创建的防护栏。

测试示例：
- **屏蔽关键词测试**：输入 "hi blue" 会触发屏蔽，因为我们已把 "blue" 设为屏蔽关键词
- **模式检测测试**：输入 "Hi ishaan@berri.ai" 会触发电子邮件模式检测器

<Image img={require('../../../img/add_guard5.gif')} alt="在 Playground 中测试防护栏" />

## LiteLLM Config.yaml 配置

### 步骤 1：在 config.yaml 中定义防护栏

<Tabs>
<TabItem label="有害内容检测" value="harmful">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "harmful-content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Enable harmful content categories
      categories:
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_illegal_weapons"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
```

</TabItem>

<TabItem label="PII 保护" value="pii">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "content-filter-pre"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Prebuilt patterns for common PII
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
      
      # Custom blocked keywords
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
          description: "Sensitive internal information"
```

</TabItem>

<TabItem label="组合使用" value="combined">

```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: openai/{{openai_small}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "comprehensive-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      # Harmful content categories
      categories:
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"
      
      # PII patterns
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
      
      # Custom keywords
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
```

</TabItem>
</Tabs>

### 步骤 2：启动 LiteLLM 网关

```shell
litellm --config config.yaml
```

### 步骤 3：测试请求

<Tabs>
<TabItem label="SSN 被屏蔽" value="ssn-blocked">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "My SSN is 123-45-6789"}
    ],
    "guardrails": ["content-filter-pre"]
  }'
```

**响应：HTTP 400 错误**
```json
{
  "error": {
    "message": {
      "error": "Content blocked: us_ssn pattern detected",
      "pattern": "us_ssn"
    },
    "code": "400"
  }
}
```

</TabItem>

<TabItem label="邮箱被脱敏" value="email-masked">

```shell
curl -i http://localhost:4000/v1/chat/completions \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $LITELLM_API_KEY" \
  -d '{
    "model": "{{openai_small}}",
    "messages": [
      {"role": "user", "content": "Contact me at john@example.com"}
    ],
    "guardrails": ["content-filter-pre"]
  }'
```

请求发送给 LLM 时，邮箱地址已被脱敏：
```
Contact me at [EMAIL_REDACTED]
```

</TabItem>
</Tabs>

## 配置

### 支持的模式

- **`pre_call`**：在 LLM 调用前运行，过滤输入消息
- **`post_call`**：在 LLM 调用后运行，过滤输出响应
- **`during_call`**：在流式过程中运行，实时过滤每个分块

### 处理动作

- **`BLOCK`**：以 HTTP 400 错误拒绝请求
- **`MASK`**：用脱敏标签替换敏感内容（如 `[EMAIL_REDACTED]`）

## 内置模式

### 可用模式

| 模式名称 | 说明 | 示例 |
|-------------|-------------|---------|
| `us_ssn` | 美国社会安全号码 | `123-45-6789` |
| `email` | 电子邮件地址 | `user@example.com` |
| `us_phone` | 美国电话号码 | `+1-555-123-4567` |
| `visa` | Visa 信用卡 | `4532-1234-5678-9010` |
| `mastercard` | Mastercard 信用卡 | `5425-2334-3010-9903` |
| `amex` | American Express 信用卡 | `3782-822463-10005` |
| `aws_access_key` | AWS 访问密钥 | `AKIAIOSFODNN7EXAMPLE` |
| `aws_secret_key` | AWS 秘密访问密钥 | `wJalrXUtnFEMI/K7MDENG/bPxRfi...` |
| `github_token` | GitHub 令牌 | `example-github-token-123` |

### 使用内置模式

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "pii-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "BLOCK"
        
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
        
        - pattern_type: "prebuilt"
          pattern_name: "aws_access_key"
          action: "BLOCK"
```

## 自定义正则模式

针对特定领域的敏感数据，定义你自己的正则模式：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "custom-patterns"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      patterns:
        # Custom employee ID format
        - pattern_type: "regex"
          pattern: '\b[A-Z]{3}-\d{4}\b'
          name: "employee_id"
          action: "MASK"
        
        # Custom project code format
        - pattern_type: "regex"
          pattern: 'PROJECT-\d{6}'
          name: "project_code"
          action: "BLOCK"
```

## 关键词过滤

屏蔽或脱敏特定关键词：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "keyword-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      blocked_words:
        - keyword: "confidential"
          action: "BLOCK"
          description: "Internal confidential information"
        
        - keyword: "proprietary"
          action: "MASK"
          description: "Proprietary company data"
        
        - keyword: "secret_project"
          action: "BLOCK"
```

### 从文件加载关键词

关键词列表较长时，可以使用 YAML 文件：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "keyword-file-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      blocked_words_file: "/path/to/sensitive_keywords.yaml"
```

```yaml showLineNumbers title="sensitive_keywords.yaml"
blocked_words:
  - keyword: "project_apollo"
    action: "BLOCK"
    description: "Confidential project codename"
  
  - keyword: "internal_api"
    action: "MASK"
    description: "Internal API references"
  
  - keyword: "customer_database"
    action: "BLOCK"
    description: "Protected database name"
```

## 流式支持

内容过滤器支持流式（streaming）响应，会逐个检查每个分块：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "streaming-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "during_call"  # Check each streaming chunk
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
```

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="{{openai_small}}",
    messages=[{"role": "user", "content": "Tell me about yourself"}],
    stream=True,
    extra_body={"guardrails": ["streaming-filter"]}
)

for chunk in response:
    print(chunk.choices[0].delta.content)
    # Emails automatically masked in real-time
```

## 图片内容过滤

内容过滤器可以分析图片：先为图片生成文本描述，再对描述文本应用过滤规则。

:::warning

这会给请求带来显著延迟，具体取决于视觉模型的速度。

这是因为，每个包含图片的请求都会被发送给视觉模型以生成描述。

:::

### 配置


```yaml showLineNumbers title="config.yaml"
model_list:
  - model_name: gpt-4-vision
    litellm_params:
      model: openai/{{openai_large}}
      api_key: os.environ/OPENAI_API_KEY

guardrails:
  - guardrail_name: "image-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      image_model: "gpt-4-vision"  # value is `model_name` of the vision-capable model
      
      # Apply same filters to image descriptions
      categories:
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
      
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
```

### 工作原理

1. 图片被发送给视觉模型，生成文本描述
2. 对该描述应用内容过滤规则
3. 若检测到有害内容，请求将被屏蔽，并附带图片相关的上下文信息

**示例**

```python
import openai

client = openai.OpenAI(
    api_key="sk-<your-litellm-api-key>",
    base_url="http://localhost:4000"
)

response = client.chat.completions.create(
    model="gpt-4-vision",
    messages=[{
        "role": "user",
        "content": [
            {"type": "text", "text": "What's in this image?"},
            {"type": "image_url", "image_url": {"url": "https://example.com/image.jpg"}}
        ]
    }],
    extra_body={"guardrails": ["image-filter"]}
)
```

如果图片描述中包含被过滤的内容，会得到如下响应：

```json
{
  "error": "Content blocked: harmful_violence category keyword 'weapon' detected (severity: high) (Image description): The image shows..."
}
```

## 自定义脱敏标签

使用 `MASK` 动作时，敏感内容会被替换为脱敏标签，你可以自定义这些标签的呈现形式。

### 默认行为

**模式**：每种模式按名称获得各自的标签
```
Input:  "My email is john@example.com and SSN is 123-45-6789"
Output: "My email is [EMAIL_REDACTED] and SSN is [US_SSN_REDACTED]"
```

**关键词**：所有关键词共用同一个通用标签
```
Input:  "This is confidential and proprietary information"
Output: "This is [KEYWORD_REDACTED] and [KEYWORD_REDACTED] information"
```

### 自定义标签

使用 `pattern_redaction_format` 与 `keyword_redaction_tag` 更改脱敏格式：

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "custom-redaction"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      pattern_redaction_format: "***{pattern_name}***"  # Use {pattern_name} placeholder
      keyword_redaction_tag: "***REDACTED***"
      patterns:
        - pattern_type: "prebuilt"
          pattern_name: "email"
          action: "MASK"
        - pattern_type: "prebuilt"
          pattern_name: "us_ssn"
          action: "MASK"
      blocked_words:
        - keyword: "confidential"
          action: "MASK"
```

**输出**
```
Input:  "Email john@example.com, SSN 123-45-6789, confidential data"
Output: "Email ***EMAIL***, SSN ***US_SSN***, ***REDACTED*** data"
```

**要点**：
- `pattern_redaction_format` 必须包含 `{pattern_name}` 占位符
- 模式名称会自动转为大写（如 `email` → `EMAIL`）
- `keyword_redaction_tag` 是固定字符串（不含占位符）

## 内容类别

内置类别使用**关键词匹配**来检测有害内容、偏见与不当建议。关键词按词边界匹配（单个词），多词短语按子串匹配，不区分大小写。

### 可用类别

直接按名称引用下表中的任意类别即可，无需设置 `category_file:`

| 类别 | 说明 |
|----------|-------------|
| **有害内容** | |
| `harmful_self_harm` | 自残、自杀、进食障碍 |
| `harmful_violence` | 暴力、犯罪策划、攻击行为 |
| `harmful_illegal_weapons` | 非法武器、爆炸物、危险物品 |
| `harmful_child_safety` | 涉及未成年人的不当内容 |
| **偏见与就业歧视** | |
| `bias_gender` | 性别歧视与刻板印象 |
| `bias_sexual_orientation` | LGBTQ+ 歧视、恐同、恐跨 |
| `bias_racial` | 种族 / 民族歧视、仇恨言论 |
| `bias_religious` | 宗教歧视与刻板印象 |
| `age_discrimination` | 基于年龄的就业歧视 |
| `disability` | 针对残障人士的就业歧视 |
| `gender_sexual_orientation` | 基于性别、性或性取向的就业歧视 |
| `military_status` | 针对退伍军人 / 军事人员的就业歧视 |
| `religion` | 基于宗教或宗教信仰的就业歧视 |
| **禁止的建议** | |
| `denied_financial_advice` | 个性化财务建议、投资推荐 |
| `denied_medical_advice` | 医疗建议、诊断、治疗方案 |
| `denied_legal_advice` | 法律建议、代理、诉讼策略 |
| `denied_insults` | 辱骂、贬损称呼、人身攻击 |
| **提示注入**（prompt injection） | |
| `prompt_injection_jailbreak` | 越狱尝试（DAN、角色扮演攻击、绕过安全机制） |
| `prompt_injection_system_prompt` | 试图提取、泄露或覆盖系统提示词 |
| `prompt_injection_sql` | 嵌入提示词中的 SQL 注入 |
| `prompt_injection_malicious_code` | 通过提示词注入恶意代码 |
| `prompt_injection_data_exfiltration` | 试图窃取训练数据或内部信息 |
| **理赔滥用** | |
| `claims_fraud_coaching` | 教授欺诈性保险理赔的手法 |
| `claims_medical_advice` | 理赔场景下的医疗建议 |
| `claims_phi_disclosure` | 未经授权披露受保护健康信息（PHI）、违反 HIPAA |
| `claims_prior_auth_gaming` | 规避保险事先授权的尝试 |
| `claims_system_override` | 覆盖理赔系统 / 冒充角色的尝试 |

:::info[偏见检测注意事项]

偏见检测**复杂且高度依赖上下文**。基于规则的系统能抓住明显的歧视性言论，但在正当讨论上可能产生误报。建议从**高严重度阈值**起步并充分测试。对任务关键的偏见检测场景，可考虑与基于 AI 的防护栏（如 HiddenLayer、Lakera）结合使用。

:::

### 配置

```yaml showLineNumbers title="config.yaml"
guardrails:
  - guardrail_name: "content-filter"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      categories:
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"  # Blocks medium+ severity
        
        - category: "bias_gender"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Only explicit discrimination
        
        - category: "denied_financial_advice"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
```

**严重度阈值**：
- `"high"`：只屏蔽高严重度内容
- `"medium"`：屏蔽中、高严重度内容（默认值）
- `"low"`：屏蔽所有严重度

### 自定义类别文件

用自己的关键词列表覆盖内置类别，或者新增一个全新类别

```yaml showLineNumbers title="config.yaml"
categories:
  - category: "<your-category-name>"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
    category_file: "<your-category-name>.yaml"
```

```yaml showLineNumbers title="<your-category-name>.yaml"
category_name: "<your-category-name>"
description: "Short description of what this category detects"
default_action: "BLOCK"

keywords:
  - keyword: "example keyword"
    severity: "high"

exceptions:
  - "example exception phrase"
```

#### 文件存放位置

把 YAML 文件放在以下两处之一：

**方式 A：放在内置 `categories/` 目录内**（推荐）

把文件挂载到 `<site-packages>/litellm/proxy/guardrails/guardrail_hooks/litellm_content_filter/categories/<your-category-name>.yaml`，并省略 `category_file:` 字段，加载器会按类别名称自动发现它

```yaml title="values.yaml (Helm)"
extraVolumeMounts:
  - name: content-filter-categories
    mountPath: /usr/local/lib/python{{python_version}}/site-packages/litellm/proxy/guardrails/guardrail_hooks/litellm_content_filter/categories/<your-category-name>.yaml
    subPath: <your-category-name>.yaml
    readOnly: true

extraVolumes:
  - name: content-filter-categories
    configMap:
      name: <your-configmap-name>
```

```yaml title="config.yaml"
guardrails:
  - guardrail_name: "<your-guardrail-name>"
    litellm_params:
      guardrail: litellm_content_filter
      mode: pre_call
      default_on: true
      categories:
        - category: "<your-category-name>"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"
```

若升级到基于不同 Python 次版本构建的 litellm 镜像，请更新 `mountPath`

**方式 B：任意其他路径，需通过环境变量开启**

设置

```bash
LITELLM_CONTENT_FILTER_ALLOW_EXTERNAL_PATHS=true
```

在代理 pod 上设置该变量，然后用绝对路径引用该文件

```yaml title="config.yaml"
categories:
  - category: "<your-category-name>"
    enabled: true
    action: "BLOCK"
    severity_threshold: "high"
    category_file: "/absolute/path/to/<your-category-name>.yaml"
```

仅当所有能写入 `category_file` 的一方（代理配置、数据库、Admin UI、团队级配置）都可信时才使用此方式；开关开启后，`category_file` 可以指向 pod 上任何能被 YAML 解析的文件

#### 验证加载结果

检查代理启动日志中是否出现以下任意一行：

```
content_filter.py: Loaded category <name>: N keywords, M always-block keywords ...
```

或

```
content_filter.py: Category <name>: invalid category_file path, skipping. ...
```

第二行说明文件被拒绝，该类别正以零条规则运行；请改用上面两种方式之一来修复

## 使用场景

### 1. 有害内容检测

屏蔽或检测包含有害、违法或危险内容的请求：

```yaml
categories:
  - category: "harmful_self_harm"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  - category: "harmful_violence"
    enabled: true
    action: "BLOCK"
    severity_threshold: "high"
  - category: "harmful_illegal_weapons"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
```

### 2. 偏见与歧视检测

跨多个维度检测并屏蔽偏见、歧视或仇恨内容：

```yaml
categories:
  # Gender-based discrimination
  - category: "bias_gender"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  
  # LGBTQ+ discrimination
  - category: "bias_sexual_orientation"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
  
  # Racial/ethnic discrimination
  - category: "bias_racial"
    enabled: true
    action: "BLOCK"
    severity_threshold: "high"  # Only explicit to reduce false positives
  
  # Religious discrimination
  - category: "bias_religious"
    enabled: true
    action: "BLOCK"
    severity_threshold: "medium"
```

**灵敏度调节**：

对偏见检测来说，严重度阈值是在安全性与正当讨论之间取得平衡的关键：

```yaml
# Conservative (low false positives, may miss subtle bias)
categories:
  - category: "bias_racial"
    severity_threshold: "high"  # Only blocks explicit discriminatory language

# Balanced (recommended)
categories:
  - category: "bias_gender"
    severity_threshold: "medium"  # Blocks stereotypes and explicit discrimination

# Strict (high safety, may have more false positives)
categories:
  - category: "bias_sexual_orientation"
    severity_threshold: "low"  # Blocks all potentially problematic content
```



### 3. PII 保护
在发送给 LLM 之前屏蔽或脱敏个人身份信息（PII）：

```yaml
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "us_ssn"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "email"
    action: "MASK"
```

### 2. 凭证检测
防止 API 密钥与机密凭证外泄：

```yaml
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "aws_access_key"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "github_token"
    action: "BLOCK"
```

### 3. 敏感内部数据保护
屏蔽或脱敏涉及机密内部项目、代号或专有信息的引用：

```yaml
blocked_words:
  - keyword: "project_titan"
    action: "BLOCK"
    description: "Confidential project codename"
  - keyword: "internal_api"
    action: "MASK"
    description: "Internal system references"
```

敏感词条较多时，可以改用文件：
```yaml
blocked_words_file: "/path/to/sensitive_terms.yaml"
```

### 4. 面向消费级应用的安全 AI

为面向消费者的 AI 组合有害内容检测与偏见检测：

```yaml
guardrails:
  - guardrail_name: "safe-consumer-ai"
    litellm_params:
      guardrail: litellm_content_filter
      mode: "pre_call"
      
      categories:
        # Harmful content - strict
        - category: "harmful_self_harm"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "harmful_violence"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        # Bias detection - balanced
        - category: "bias_gender"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Avoid blocking legitimate gender discussions
        
        - category: "bias_sexual_orientation"
          enabled: true
          action: "BLOCK"
          severity_threshold: "medium"
        
        - category: "bias_racial"
          enabled: true
          action: "BLOCK"
          severity_threshold: "high"  # Education and news may discuss race
```

**适用场景**：
- 聊天机器人与虚拟助手
- 教育 AI 工具
- 客服 AI
- 内容生成平台
- 面向公众的 AI 应用

### 5. 合规
通过过滤敏感数据类型来满足合规要求：

```yaml
# Categories checked first (high priority)
# Category keywords are matched first
categories:
  - category: "harmful_self_harm"
    severity_threshold: "high"

# Then regex patterns
patterns:
  - pattern_type: "prebuilt"
    pattern_name: "visa"
    action: "BLOCK"
  - pattern_type: "prebuilt"
    pattern_name: "us_ssn"
    action: "BLOCK"
```

