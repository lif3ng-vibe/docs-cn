# 策略模板

策略模板（policy template）提供预先配置好的防护栏（guardrails）策略，可作为组织起步的现成方案。你无需手动创建策略和防护栏，只需选择一个与自身用例匹配的模板，即可一键部署。

## 使用策略模板

### 在 UI 中使用

1. 在 LiteLLM 管理界面（Admin UI）中打开 **Policies → Templates** 标签页
2. 浏览可用模板（例如 "PII Protection"、"Cost Control"、"HR Compliance"）
3. 点击任意模板上的 **"Use Template"**
4. 检查将要创建的防护栏：
   - 已存在的防护栏会标注绿色对勾
   - 新防护栏可自由勾选或取消
5. 点击 **"Create X Guardrails & Use Template"**
6. 检查并自定义预填好的策略表单
7. 点击 **"Create Policy"** 保存

### 工作流程

```
Select Template → Review Guardrails → Create Selected → Edit Policy → Save
```

系统会自动完成以下操作：
- ✅ 检测哪些防护栏已经存在
- ✅ 只创建你勾选且尚不存在的防护栏
- ✅ 用模板数据预填策略表单
- ✅ 允许你在保存前自定义

## 可用模板

模板从 [GitHub](https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json) 拉取，失败时自动回退到本地备份。

### 当前模板

#### 1. 高级 PII 防护（澳大利亚）
- **复杂度**：高
- **用例**：为澳大利亚组织提供全面的 PII（个人身份信息）检测
- **防护栏**：
  - 澳大利亚税务标识符（TFN、ABN、Medicare）
  - 澳大利亚护照
  - 国际 PII（SSN、护照、国民身份证）
  - 联系方式（邮箱、电话、地址）
  - 金融数据（信用卡、IBAN）
  - API 凭证（AWS、GitHub、Slack），**会阻断**请求
  - 网络基础设施（IP 地址）
  - 受保护类别信息（性别、种族、宗教、残障状况等）

#### 2. 基础 PII 防护
- **复杂度**：低
- **用例**：为内部工具和测试环境提供基础防护
- **防护栏**：
  - 澳大利亚税务标识符
  - API 凭证
  - 金融数据

## 创建你自己的策略模板

你可以为整个 LiteLLM 社区贡献策略模板。

### 模板结构

模板以 JSON 格式定义，结构如下：

```json
{
  "id": "unique-template-id",
  "title": "Display Title",
  "description": "Detailed description of what this template protects",
  "icon": "ShieldCheckIcon",
  "iconColor": "text-purple-500",
  "iconBg": "bg-purple-50",
  "guardrails": [
    "guardrail-name-1",
    "guardrail-name-2"
  ],
  "complexity": "Low|Medium|High",
  "guardrailDefinitions": [
    {
      "guardrail_name": "example-guardrail",
      "litellm_params": {
        "guardrail": "litellm_content_filter",
        "mode": "pre_call",
        "patterns": [
          {
            "pattern_type": "prebuilt",
            "pattern_name": "email",
            "action": "MASK"
          }
        ],
        "pattern_redaction_format": "[{pattern_name}_REDACTED]"
      },
      "guardrail_info": {
        "description": "What this guardrail does"
      }
    }
  ],
  "templateData": {
    "policy_name": "policy-name",
    "description": "Policy description",
    "guardrails_add": ["guardrail-name-1", "guardrail-name-2"],
    "guardrails_remove": []
  }
}
```

### 字段说明

#### 展示字段
- **id**：唯一标识符（小写字母加连字符）
- **title**：在 UI 中展示给用户的名称
- **description**：对模板防护内容的详细说明
- **icon**：图标名称（必须存在于 UI 图标映射中）
- **iconColor**：Tailwind CSS 文字颜色类
- **iconBg**：Tailwind CSS 背景颜色类
- **guardrails**：防护栏名称数组（仅用于展示）
- **complexity**：表示难度的徽章（"Low"、"Medium" 或 "High"）

#### 防护栏定义
- **guardrailDefinitions**：完整的防护栏配置数组
  - 每一项都必须是可发送到 `/guardrails` POST 端点的有效防护栏对象
  - 已存在的防护栏会被跳过
  - 若模板只用现有防护栏，可为空数组 `[]`

#### 策略配置
- **templateData**：用于预填策略表单的对象
  - **policy_name**：建议的策略名称（用户可修改）
  - **description**：策略描述
  - **guardrails_add**：要纳入的防护栏名称数组
  - **guardrails_remove**：要移除的数组（模板中通常为 `[]`）
  - **inherit**：（可选）用于继承的父策略名称

### 模板示例

下面是一个完整的 HIPAA 合规模板示例：

```json
{
  "id": "hipaa-compliance",
  "title": "HIPAA Compliance Policy",
  "description": "Healthcare compliance policy that masks PHI and enforces HIPAA regulations for healthcare applications.",
  "icon": "ShieldCheckIcon",
  "iconColor": "text-red-500",
  "iconBg": "bg-red-50",
  "guardrails": [
    "phi-detector",
    "medical-record-blocker",
    "patient-id-masker"
  ],
  "complexity": "High",
  "guardrailDefinitions": [
    {
      "guardrail_name": "phi-detector",
      "litellm_params": {
        "guardrail": "litellm_content_filter",
        "mode": "pre_call",
        "patterns": [
          {
            "pattern_type": "prebuilt",
            "pattern_name": "us_ssn",
            "action": "MASK"
          },
          {
            "pattern_type": "prebuilt",
            "pattern_name": "email",
            "action": "MASK"
          },
          {
            "pattern_type": "prebuilt",
            "pattern_name": "us_phone",
            "action": "MASK"
          }
        ],
        "pattern_redaction_format": "[PHI_REDACTED]"
      },
      "guardrail_info": {
        "description": "Detects and masks Protected Health Information (PHI)"
      }
    }
  ],
  "templateData": {
    "policy_name": "hipaa-compliance-policy",
    "description": "HIPAA compliance policy for healthcare applications",
    "guardrails_add": [
      "phi-detector",
      "medical-record-blocker",
      "patient-id-masker"
    ],
    "guardrails_remove": []
  }
}
```

## 贡献模板

要贡献一个人人可用的策略模板，请按以下步骤操作：

### 第 1 步：创建模板 JSON

1. 按照上面的结构创建一个 JSON 文件
2. 将其加入本地 `policy_templates.json` 进行本地测试
3. 确认所有防护栏都能正常工作
4. 确保描述清晰、有帮助

### 第 2 步：提交 Pull Request

1. Fork [LiteLLM 仓库](https://github.com/BerriAI/litellm)
2. 将你的模板加入根目录的 `policy_templates.json`
3. 将你的模板加入 `litellm/policy_templates_backup.json`（两处保持同步）
4. 创建 Pull Request，并附上：
   - 对模板防护内容的清晰描述
   - 用例示例
   - 相关的合规框架（HIPAA、GDPR、SOC 2 等）

### 准则

**推荐做法**：
- ✅ 使用清晰、有描述性的名称
- ✅ 提供详细的描述
- ✅ 充分测试所有防护栏
- ✅ 注明模式（pattern）来源（例如 "基于 NIST 指南"）
- ✅ 按逻辑将相关防护栏分组
- ✅ 考虑不同的复杂度级别

**避免做法**：
- ❌ 包含凭证或密钥
- ❌ 使用过于宽泛、容易误报的模式
- ❌ 重复已有模板
- ❌ 使用未经充分测试的自定义代码

## 离线使用模板

对于物理隔离（air-gapped）或离线部署环境，设置以下环境变量：

```bash
export LITELLM_LOCAL_POLICY_TEMPLATES=true
```

这会强制系统使用本地备份（`litellm/policy_templates_backup.json`），而不是从 GitHub 拉取。

## 模板来源

- **GitHub（默认）**：https://raw.githubusercontent.com/BerriAI/litellm/main/policy_templates.json
- **本地备份**：`litellm/policy_templates_backup.json`

系统会在每次请求时自动从 GitHub 拉取模板，任何失败都会回退到本地备份。

## 可用模式类型

为模板创建防护栏时，可以使用以下预置模式：

### 身份证件
- `passport_australia`、`passport_us`、`passport_uk`、`passport_germany` 等
- `us_ssn`、`us_ssn_no_dash`
- `au_tfn`、`au_abn`、`au_medicare`
- `nl_bsn_contextual`
- `br_cpf`、`br_rg`、`br_cnpj`

### 金融信息
- `visa`、`mastercard`、`amex`、`discover`、`credit_card`
- `iban`

### 联系方式
- `email`
- `us_phone`、`br_phone_landline`、`br_phone_mobile`
- `street_address`
- `br_cep`（巴西邮政编码）

### 凭证
- `aws_access_key`、`aws_secret_key`
- `github_token`
- `slack_token`
- `generic_api_key`

### 网络信息
- `ipv4`、`ipv6`

### 受保护类别
- `gender_sexual_orientation`
- `race_ethnicity_national_origin`
- `religion`
- `age_discrimination`
- `disability`
- `marital_family_status`
- `military_status`
- `public_assistance`

所有可用模式请见[完整模式列表](https://github.com/BerriAI/litellm/blob/main/litellm/proxy/guardrails/guardrail_hooks/litellm_content_filter/patterns.json)。

## 相关文档

- [防护栏策略](./guardrail_policies)
- [策略标签](./policy_tags)
- [内容过滤模式](/docs/proxy/guardrails/litellm_content_filter)
- [自定义代码防护栏](/docs/proxy/guardrails/custom_code_guardrail)
