---
title: S3 和 GCS 缓存
description: 使用 S3 或 GCS 存储桶支撑 LiteLLM 代理的响应缓存。
---

# S3 和 GCS 缓存

对象存储是用延迟换持久性与成本的选择。每次查找时，存储桶都比 Redis 慢得多，但它价格低廉、可被所有副本共享，且数据在重启后依然保留。当缓存命中值得保存、而几百毫秒的查找延迟无伤大雅时，就适合用它。

## S3

### 步骤 1：在 config.yaml 中添加 `cache`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params: # set cache params for s3
    type: s3
    s3_bucket_name: cache-bucket-litellm # AWS Bucket Name for S3
    s3_region_name: us-west-2 # AWS Region Name for S3
    s3_aws_access_key_id: os.environ/AWS_ACCESS_KEY_ID # us os.environ/<variable name> to pass environment variables. This is AWS Access Key ID for S3
    s3_aws_secret_access_key: os.environ/AWS_SECRET_ACCESS_KEY # AWS Secret Access Key for S3
    s3_endpoint_url: https://s3.amazonaws.com # [OPTIONAL] S3 endpoint URL, if you want to use Backblaze/cloudflare s3 buckets
```

### 步骤 2：使用配置启动代理

```shell
$ litellm --config /path/to/config.yaml
```

## GCS

### 步骤 1：在 config.yaml 中添加 `cache`

```yaml
model_list:
  - model_name: {{openai_small}}
    litellm_params:
      model: {{openai_small}}
  - model_name: text-embedding-ada-002
    litellm_params:
      model: text-embedding-ada-002

litellm_settings:
  set_verbose: True
  cache: True # set cache responses to True
  cache_params: # set cache params for gcs
    type: gcs
    gcs_bucket_name: cache-bucket-litellm # GCS Bucket Name for caching
    gcs_path_service_account: os.environ/GCS_PATH_SERVICE_ACCOUNT # use os.environ/<variable name> to pass environment variables. This is the path to your GCS service account JSON file
    gcs_path: cache/ # [OPTIONAL] GCS path prefix for cache objects
```

### 步骤 2：在 .env 中添加 GCS 凭据

在 .env 文件中设置 GCS 环境变量：

```shell
GCS_BUCKET_NAME="your-gcs-bucket-name"
GCS_PATH_SERVICE_ACCOUNT="/path/to/service-account.json"
```

### 步骤 3：使用配置启动代理

```shell
$ litellm --config /path/to/config.yaml
```
