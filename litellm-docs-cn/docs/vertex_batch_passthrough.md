import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# /batchPredictionJobs

LiteLLM 通过透传（passthrough）端点支持 Vertex AI 批处理预测作业（batch prediction job），你可以直接通过代理服务器创建和管理批处理作业。

## 功能特性

- **批处理作业创建**：使用 Vertex AI 模型创建批处理预测作业
- **成本追踪**（cost tracking）：为批处理操作自动计算成本并统计用量
- **状态监控**：追踪作业状态并获取结果
- **模型支持**：兼容所有受支持的 Vertex AI 模型（Gemini、Text Embedding）

## 成本追踪支持

| 功能 | 是否支持 | 说明 |
|---------|-----------|-------|
| 成本追踪 | ✅ | 为批处理操作自动计算成本 |
| 用量监控 | ✅ | 追踪各批处理作业的 Token 用量与成本 |
| 日志记录 | ✅ | 支持 |

## 快速上手

1. **配置模型**：在代理配置中添加以下内容：

```yaml
model_list:
  - model_name: {{gemini_flash}}
    litellm_params:
      model: vertex_ai/{{gemini_flash}}
      vertex_project: your-project-id
      vertex_location: us-central1
      vertex_credentials: path/to/service-account.json
```

2. **创建批处理作业**：

```bash
curl -X POST "http://localhost:4000/vertex_ai/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "my-batch-job",
    "model": "projects/your-project/locations/us-central1/publishers/google/models/{{gemini_flash}}",
    "inputConfig": {
      "gcsSource": {
        "uris": ["gs://my-bucket/input.jsonl"]
      },
      "instancesFormat": "jsonl"
    },
    "outputConfig": {
      "gcsDestination": {
        "outputUriPrefix": "gs://my-bucket/output/"
      },
      "predictionsFormat": "jsonl"
    }
  }'
```

3. **监控作业状态**：

```bash
curl -X GET "http://localhost:4000/vertex_ai/v1/projects/your-project/locations/us-central1/batchPredictionJobs/job-id" \
  -H "Authorization: Bearer your-api-key"
```

## 模型配置

为批处理操作配置模型时，请遵循以下命名约定：

- **`model_name`**：基础模型名（例如 `{{gemini_flash}}`）
- **`model`**：完整的 LiteLLM 标识符（例如 `vertex_ai/{{gemini_flash}}`）

## 支持的模型

- `{{gemini_flash}}` / `vertex_ai/{{gemini_flash}}`
- `{{gemini_pro}}` / `vertex_ai/{{gemini_pro}}`

## 高级用法

### 创建带自定义参数的批处理作业

```bash
curl -X POST "http://localhost:4000/vertex_ai/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key" \
  -H "Content-Type: application/json" \
  -d '{
    "displayName": "advanced-batch-job",
    "model": "projects/your-project/locations/us-central1/publishers/google/models/{{gemini_pro}}",
    "inputConfig": {
      "gcsSource": {
        "uris": ["gs://my-bucket/advanced-input.jsonl"]
      },
      "instancesFormat": "jsonl"
    },
    "outputConfig": {
      "gcsDestination": {
        "outputUriPrefix": "gs://my-bucket/advanced-output/"
      },
      "predictionsFormat": "jsonl"
    },
    "labels": {
      "environment": "production",
      "team": "ml-engineering"
    }
  }'
```

### 列出所有批处理作业

```bash
curl -X GET "http://localhost:4000/vertex_ai/v1/projects/your-project/locations/us-central1/batchPredictionJobs" \
  -H "Authorization: Bearer your-api-key"
```

### 取消批处理作业

```bash
curl -X POST "http://localhost:4000/vertex_ai/v1/projects/your-project/locations/us-central1/batchPredictionJobs/job-id:cancel" \
  -H "Authorization: Bearer your-api-key"
```

## 成本追踪详情

LiteLLM 会追踪 Vertex AI 批处理操作的成本：

- **Token 用量**：追踪每个批处理请求的输入与输出 Token 数
- **成本计算**：依据最新的 Vertex AI 定价自动计算成本
- **用量聚合**：汇总单个批处理作业内所有请求的成本
- **实时监控**：在批处理作业运行期间实时监控成本

成本追踪基于 `generateContent` API 工作，会详细报告批处理作业的支出明细。

## 错误处理

常见错误场景及解决办法：

| 错误 | 说明 | 解决办法 |
|-------|-------------|----------|
| `INVALID_ARGUMENT` | 模型或配置无效 | 核对模型名和项目设置 |
| `PERMISSION_DENIED` | 权限不足 | 检查 Vertex AI 的 IAM 角色 |
| `RESOURCE_EXHAUSTED` | 超出配额 | 检查 Vertex AI 的配额与限额 |
| `NOT_FOUND` | 找不到作业或资源 | 核对作业 ID 和项目配置 |

## 最佳实践

1. **选择合适的批处理规模**：在处理效率和资源占用之间取得平衡
2. **监控作业状态**：定期查看作业状态，及时处理失败
3. **设置告警**：为作业完成和失败配置监控
4. **优化成本**：借助成本追踪发现可优化的环节
5. **先用小批量验证**：用小规模测试批处理确认配置无误

## 相关文档

- [Vertex AI 提供商文档](./providers/vertex.md)
- [通用 Batches API 文档](./batches.md)
- [成本追踪与监控](./proxy/logging)
