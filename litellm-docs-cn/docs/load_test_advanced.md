import Image from '@theme/IdealImage';


# LiteLLM Proxy 在 locust 上的 1K RPS 负载测试

本教程演示如何让 LiteLLM Proxy 在 locust 上跑到 1K+ RPS（每秒请求数）。


## 测试前检查清单
- [ ] 确认你使用的是 litellm **最新的 `-stable` 版本**
    - [GitHub 发布页](https://github.com/BerriAI/litellm/releases)
    - [litellm Docker 容器](https://github.com/BerriAI/litellm/pkgs/container/litellm)
- [ ] 确认你已遵循**全部**[生产环境最佳实践](./proxy/prod.md)
- [ ] Locust：确认你的 Locust 实例每秒能发出 1K+ 个请求
    - 👉 可以直接使用我们 **[维护的 Locust 实例](https://locust-load-tester-production.up.railway.app/)**
    - 如果你自己托管 Locust
        - [我们 Locust 机器所用规格见此处](#运行-locust-的机器规格)
        - [测试所用的 locustfile.py 见此处](#测试用的-locust-文件)
- [ ] 使用这份 [**运行 litellm Proxy 的机器规格**](#运行-litellm-proxy-的机器规格)
- [ ] **Enterprise LiteLLM**：在 `proxy_config.yaml` 中把 `prometheus` 配置为回调，即可获取负载测试指标
    设置 `litellm_settings.callbacks` 来监控成功、失败及各类错误
    ```yaml
    litellm_settings:
        callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
    ```

**测试时使用以下配置**：

**注意**：我们正在迁移到吞吐量高出 10 倍的 aiohttp，负载测试建议使用 `openai/` 提供商。

:::tip[搭建模拟 OpenAI 端点]
可以使用我们托管的模拟端点，也可以通过 [github.com/BerriAI/example_openai_endpoint](https://github.com/BerriAI/example_openai_endpoint) 自行托管。
:::

```yaml
model_list:
  - model_name: "fake-openai-endpoint"
    litellm_params:
      model: openai/any
      api_base: https://exampleopenaiendpoint-production.up.railway.app/  # or your self-hosted endpoint
      api_key: "test"
```


## 负载测试：模拟 OpenAI 端点

### 预期性能

| 指标 | 数值 |
|--------|-------|
| 每秒请求数 | 1174+ |
| 响应时间中位数 | `96ms` |
| 平均响应时间 | `142.18ms` |

### 运行测试

1. 把 `fake-openai-endpoint` 加入你的 proxy config.yaml，然后启动 litellm Proxy
litellm 提供了一个托管的 `fake-openai-endpoint`，可以直接对它做负载测试

```yaml
model_list:
  - model_name: fake-openai-endpoint
    litellm_params:
      model: openai/fake
      api_key: fake-key
      api_base: https://exampleopenaiendpoint-production.up.railway.app/

litellm_settings:
  callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
```

2. `uv add locust`

3. 在本地创建一个名为 `locustfile.py` 的文件，从[此处](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)的 litellm 负载测试中复制其内容

4. 启动 locust
  在第 2 步创建的 `locustfile.py` 所在目录中运行 `locust`

  ```shell
  locust -f locustfile.py --processes 4
  ```

5. 在 locust 上运行负载测试

  打开 http://0.0.0.0:8089 进入 locust UI

  设置 **Users=1000、Ramp Up Users=1000**，Host 填你 LiteLLM Proxy 的 Base URL

6. 预期结果

  <Image img={require('../img/locust_load_test1.png')} />

## 负载测试：有速率限制的端点

对 2 个各有 10K RPM（每分钟请求数）配额的 LLM 部署跑负载测试，预期总吞吐约 20K RPM

### 预期性能

- 预期 1 分钟内收到 20,000+ 个成功响应
- 其余请求会**失败，因为端点超出了 LLM API 提供商设置的 10K RPM 配额上限**

| 指标 | 数值 |
|--------|-------|
| 1 分钟内的成功响应数 | 20,000+ |
| 每秒请求数 | ~1170+ |
| 响应时间中位数 | `70ms` |
| 平均响应时间 | `640.18ms` |

### 运行测试

1. 在 config.yaml 中加入 2 个 `gemini-vision` 部署，每个部署可承载 10K RPM。（我们在下方的 `/v1/projects/bad-adroit-crow` 路由上配置了一个限速 1000 RPM 的模拟端点）

:::info

所有 `model="gemini-vision"` 的请求会在 2 个部署之间平均负载均衡。

:::

```yaml
model_list:
  - model_name: gemini-vision
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      api_base: https://exampleopenaiendpoint-production.up.railway.app/v1/projects/bad-adroit-crow-413218/locations/us-central1/publishers/google/models/{{gemini_pro}}
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: /etc/secrets/adroit_crow.json
  - model_name: gemini-vision
    litellm_params:
      model: vertex_ai/{{gemini_pro}}
      api_base: https://exampleopenaiendpoint-production-c715.up.railway.app/v1/projects/bad-adroit-crow-413218/locations/us-central1/publishers/google/models/{{gemini_pro}}
      vertex_project: "adroit-crow-413218"
      vertex_location: "us-central1"
      vertex_credentials: /etc/secrets/adroit_crow.json

litellm_settings:
  callbacks: ["prometheus"] # Enterprise LiteLLM Only - use prometheus to get metrics on your load test
```

2. `uv add locust`

3. 在本地创建一个名为 `locustfile.py` 的文件，从[此处](https://github.com/BerriAI/litellm/blob/main/.github/workflows/locustfile.py)的 litellm 负载测试中复制其内容

4. 启动 locust
  在第 2 步创建的 `locustfile.py` 所在目录中运行 `locust`

  ```shell
  locust -f locustfile.py --processes 4 -t 60
  ```

5. 在 locust 上运行负载测试

  打开 http://0.0.0.0:8089 进入 locust UI，并使用以下设置

  <Image img={require('../img/locust_load_test2_setup.png')} />

6. 预期结果
    - 1 分钟内的成功响应数 = 19,800 =（69415 - 49615）
    - 每秒请求数 = 1170
    - 响应时间中位数 = 70ms
    - 平均响应时间 = 640ms

  <Image img={require('../img/locust_load_test2.png')} />


## 用于调试负载测试的 Prometheus 指标

使用以下 [Prometheus 指标来调试负载测试与失败情况](./proxy/prometheus)

| 指标名称          | 说明                          |
|----------------------|--------------------------------------|
| `litellm_deployment_failure_responses`              | 特定 LLM 部署的 LLM API 调用失败总数。标签：`"requested_model", "litellm_model_name", "model_id", "api_base", "api_provider", "hashed_api_key", "api_key_alias", "team", "team_alias", "exception_status", "exception_class"` |
| `litellm_deployment_cooled_down`             | 部署被 LiteLLM 负载均衡逻辑冷却的次数。标签：`"litellm_model_name", "model_id", "api_base", "api_provider", "exception_status"` |



## 运行 locust 的机器规格

| 指标 | 数值 |
|--------|-------|
| `locust --processes 4`  | 4|
| 负载测试机的 `vCPUs` | 2.0 vCPUs |
| 负载测试机的 `Memory` | 450 MB |
| 负载测试机的 `Replicas` | 1 |

## 运行 LiteLLM Proxy 的机器规格

👉 要跑到 1K+ RPS，**LiteLLM Proxy 需要 4 个副本**

| 服务 | 规格 | CPUs | 内存 | 架构 | 版本 |
| --- | --- | --- | --- | --- | --- | 
| 服务器 | `t2.large`. | `2vCPUs` | `8GB` | `x86` |


## 测试用的 locust 文件

```python
import os
import uuid
from locust import HttpUser, task, between

class MyUser(HttpUser):
    wait_time = between(0.5, 1)  # Random wait time between requests

    @task(100)
    def litellm_completion(self):
        # no cache hits with this
        payload = {
            "model": "fake-openai-endpoint",
            "messages": [{"role": "user", "content": f"{uuid.uuid4()} This is a test there will be no cache hits and we'll fill up the context" * 150 }],
            "user": "my-new-end-user-1"
        }
        response = self.client.post("chat/completions", json=payload)
        if response.status_code != 200:
            # log the errors in error.txt
            with open("error.txt", "a") as error_log:
                error_log.write(response.text + "\n")
    


    def on_start(self):
        self.api_key = os.getenv('API_KEY', 'sk-<your-litellm-api-key>')
        self.client.headers.update({'Authorization': f'Bearer {self.api_key}'})
```
